import { Link } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Center, CenterService } from '@/types/center';
import { useStore } from '@/store/AppStore';
import { Card, ServiceBadge } from '@/ui/components';
import { distanceMiles, formatDistance } from '@/ui/geo';
import { openNow, openStateLabel, type OpenState } from '@/ui/hours';
import { radius, spacing, useTheme, type Palette } from '@/ui/theme';

function mapsUrl(c: Center): string {
  const q = encodeURIComponent(c.address);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

export default function FindScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const {
    centers,
    settings,
    updateSettings,
    userLocation,
    locationStatus,
    requestLocation,
    activationFor,
    isFavorite,
    toggleFavorite,
    liveStatus,
    liveCount,
  } = useStore();

  const service = settings.service;
  const nearbyActive = settings.nearbyOnly && !!userLocation;
  const openNowOnly = settings.openNowOnly;

  const filtered = useMemo(() => {
    let list = centers.filter((c) =>
      service === 'both' ? true : c.services.includes(service),
    );
    const withDist = list.map((c) => ({
      center: c,
      dist: userLocation ? distanceMiles(userLocation, c.location) : Infinity,
      open: openNow(c.hours),
    }));
    let out = withDist;
    if (nearbyActive) {
      out = out.filter(
        (x) => x.dist <= settings.nearbyRadiusMiles || isFavorite(x.center.id),
      );
    }
    if (openNowOnly) {
      // Show open + unknown (never hide a center just because hours are unparseable).
      out = out.filter((x) => x.open !== 'closed' || isFavorite(x.center.id));
    }
    out.sort((a, b) => {
      const favDiff = Number(isFavorite(b.center.id)) - Number(isFavorite(a.center.id));
      if (favDiff !== 0) return favDiff;
      if (userLocation && a.dist !== b.dist) return a.dist - b.dist;
      return a.center.name.localeCompare(b.center.name);
    });
    return out;
  }, [centers, service, userLocation, nearbyActive, settings.nearbyRadiusMiles, openNowOnly, isFavorite]);

  // Which activation banner to show.
  const bannerService: CenterService = service === 'cooling' ? 'cooling' : 'warming';
  const activation = activationFor(bannerService);

  return (
    <View style={styles.container}>
      {activation && (
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            styles.banner,
            {
              backgroundColor: activation.active ? colors.active : colors.surfaceAlt,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: activation.active ? '#06240F' : colors.text }]}>
            {activation.active
              ? `⚠️ ${activation.label} — centers are open now`
              : `${activation.label} · centers open on normal hours. Call 2-1-1 to confirm.`}
          </Text>
        </View>
      )}

      <FlatList
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        data={filtered}
        keyExtractor={(x) => x.center.id}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text style={styles.h1} accessibilityRole="header">
              Warming & cooling centers
            </Text>
            <Text style={styles.muted}>
              {nearbyActive
                ? `${filtered.length} within ${settings.nearbyRadiusMiles} mi`
                : `${filtered.length} places in St. Louis`}
            </Text>

            {/* Service filter */}
            <View style={styles.filterRow}>
              {([
                ['both', 'All'],
                ['warming', '🔥 Warming'],
                ['cooling', '❄️ Cooling'],
              ] as const).map(([val, label]) => (
                <Pressable
                  key={val}
                  onPress={() => updateSettings({ service: val })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: service === val }}
                  accessibilityLabel={`Show ${label}`}
                  style={[styles.chip, service === val && styles.chipActive]}
                >
                  <Text style={[styles.chipText, service === val && styles.chipTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Near me + Open now filters */}
            <View style={styles.filterRow}>
              <Pressable
                onPress={() => updateSettings({ nearbyOnly: !settings.nearbyOnly })}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.nearbyOnly }}
                accessibilityLabel="Show only centers near me"
                style={[styles.nearChip, settings.nearbyOnly && styles.chipActive]}
              >
                <Text style={[styles.chipText, settings.nearbyOnly && styles.chipTextActive]}>
                  📍 {settings.nearbyOnly ? `Near me · ${settings.nearbyRadiusMiles} mi` : 'Near me'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => updateSettings({ openNowOnly: !settings.openNowOnly })}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.openNowOnly }}
                accessibilityLabel="Show only centers open now"
                style={[styles.nearChip, settings.openNowOnly && styles.chipActive]}
              >
                <Text style={[styles.chipText, settings.openNowOnly && styles.chipTextActive]}>
                  🕑 Open now
                </Text>
              </Pressable>
            </View>
            {settings.nearbyOnly && locationStatus === 'denied' && (
              <Pressable onPress={requestLocation} accessibilityRole="button">
                <Text style={[styles.muted, { color: colors.warm, marginTop: spacing.xs }]}>
                  Location off — showing all. Tap to enable.
                </Text>
              </Pressable>
            )}
            {/* Live-data honesty line */}
            <Text style={[styles.muted, { marginTop: spacing.sm }]}>
              {liveStatus === 'live'
                ? `🟢 ${liveCount} cooling centers live from MO DHSS · warming from city list`
                : liveStatus === 'loading'
                  ? 'Loading live cooling data…'
                  : liveStatus === 'fallback'
                    ? 'Live feed unavailable — showing curated list'
                    : 'Showing curated list'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CenterRow
            center={item.center}
            dist={userLocation ? item.dist : undefined}
            open={item.open}
            favorite={isFavorite(item.center.id)}
            onFav={() => toggleFavorite(item.center.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={<Text style={styles.muted}>No centers match this filter.</Text>}
      />
    </View>
  );
}

function CenterRow({
  center,
  dist,
  open,
  favorite,
  onFav,
}: {
  center: Center;
  dist?: number;
  open?: OpenState;
  favorite: boolean;
  onFav: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const distLabel = dist != null && Number.isFinite(dist) ? formatDistance(dist) : '';
  const openColor = open === 'open' ? colors.active : open === 'closed' ? colors.warm : colors.textMuted;
  return (
    <Card>
      <Link href={`/center/${center.id}`} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${center.name}, ${center.services
            .map((s) => (s === 'warming' ? 'warming' : 'cooling'))
            .join(' and ')} center${distLabel ? ', ' + distLabel + ' away' : ''}${
            open ? ', ' + openStateLabel(open) : ''
          }`}
          accessibilityHint="Opens details, hours, and directions"
        >
          <View style={styles.rowTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={2}>
                {center.name}
              </Text>
              <Text style={styles.muted}>
                {center.address.replace(', Saint Louis', '').replace(', St. Louis', '')}
                {distLabel ? `  ·  ${distLabel} away` : ''}
                {center.approxLocation ? '  · approx' : ''}
              </Text>
              {open ? (
                <Text style={[styles.openLabel, { color: openColor }]}>
                  {open === 'open' ? '🟢 ' : open === 'closed' ? '⚪ ' : '🕑 '}
                  {openStateLabel(open)}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onFav}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={favorite ? 'Remove favorite' : 'Save favorite'}
            >
              <Text style={{ fontSize: 22 }}>{favorite ? '★' : '☆'}</Text>
            </Pressable>
          </View>
          <View style={styles.badges}>
            {center.services.map((s) => (
              <ServiceBadge key={s} service={s} />
            ))}
          </View>
        </Pressable>
      </Link>

      {/* Big, obvious action buttons — the two things a person in crisis needs. */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => Linking.openURL(mapsUrl(center))}
          accessibilityRole="button"
          accessibilityLabel={`Get directions to ${center.name}`}
          style={[styles.action, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.actionText}>🧭 Directions</Text>
        </Pressable>
        {center.phone ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${center.phone!.replace(/[^0-9]/g, '')}`)}
            accessibilityRole="button"
            accessibilityLabel={`Call ${center.name}`}
            style={[styles.action, { backgroundColor: colors.surfaceAlt }]}
          >
            <Text style={[styles.actionText, { color: colors.text }]}>📞 Call</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    banner: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    bannerText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
    h1: { color: colors.text, fontSize: 24, fontWeight: '800' },
    muted: { color: colors.textMuted, fontSize: 13 },
    filterRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nearChip: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.sm,
    },
    chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    chipText: { color: colors.text, fontWeight: '700', fontSize: 15 },
    chipTextActive: { color: colors.bg },
    rowTop: { flexDirection: 'row', alignItems: 'flex-start' },
    name: { color: colors.text, fontSize: 18, fontWeight: '800' },
    openLabel: { fontSize: 13, fontWeight: '700', marginTop: 4 },
    badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    action: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    actionText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  });
