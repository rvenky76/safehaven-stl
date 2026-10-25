import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store/AppStore';
import { Card, SectionTitle } from '@/ui/components';
import { radius, spacing, useTheme, type Palette } from '@/ui/theme';

const RADII = [3, 5, 10];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { settings, updateSettings, locationStatus, requestLocation, liveStatus, liveCount } =
    useStore();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}
    >
      <Card>
        <SectionTitle>Appearance</SectionTitle>
        <View style={styles.selRow}>
          {([
            ['dark', '🌙 Dark'],
            ['light', '☀️ Light'],
            ['system', '📱 System'],
          ] as const).map(([t, label]) => (
            <Pressable
              key={t}
              onPress={() => updateSettings({ theme: t })}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.theme === t }}
              accessibilityLabel={`${t} theme`}
              style={[styles.sel, settings.theme === t && styles.selActive]}
            >
              <Text style={[styles.selText, settings.theme === t && styles.selTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>Default view</SectionTitle>
        <View style={styles.selRow}>
          {([
            ['both', 'All'],
            ['warming', '🔥 Warming'],
            ['cooling', '❄️ Cooling'],
          ] as const).map(([val, label]) => (
            <Pressable
              key={val}
              onPress={() => updateSettings({ service: val })}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.service === val }}
              accessibilityLabel={`Default to ${label}`}
              style={[styles.sel, settings.service === val && styles.selActive]}
            >
              <Text style={[styles.selText, settings.service === val && styles.selTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>Data</SectionTitle>
        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Text style={styles.label}>Live cooling data</Text>
            <Text style={styles.hint}>
              Pull live cooling centers from the Missouri DHSS feed. Falls back to the curated list
              if unavailable. {liveStatus === 'live' ? `(${liveCount} live now)` : ''}
            </Text>
          </View>
          <Switch
            value={settings.liveData}
            onValueChange={(v) => updateSettings({ liveData: v })}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.text}
          />
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Text style={styles.label}>Show only open now</Text>
            <Text style={styles.hint}>
              Hide centers closed by their listed hours. Centers with unknown hours still show.
            </Text>
          </View>
          <Switch
            value={settings.openNowOnly}
            onValueChange={(v) => updateSettings({ openNowOnly: v })}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.text}
          />
        </View>
      </Card>

      <Card>
        <SectionTitle>Location</SectionTitle>
        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Text style={styles.label}>Show only centers near me</Text>
            <Text style={styles.hint}>
              Uses your location to show the closest centers. Falls back to all if location is off.
            </Text>
          </View>
          <Switch
            value={settings.nearbyOnly}
            onValueChange={(v) => updateSettings({ nearbyOnly: v })}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.text}
          />
        </View>
        {settings.nearbyOnly && (
          <>
            <Text style={[styles.label, { marginTop: spacing.md }]}>Radius</Text>
            <View style={styles.selRow}>
              {RADII.map((mi) => (
                <Pressable
                  key={mi}
                  onPress={() => updateSettings({ nearbyRadiusMiles: mi })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: settings.nearbyRadiusMiles === mi }}
                  accessibilityLabel={`${mi} mile radius`}
                  style={[styles.sel, settings.nearbyRadiusMiles === mi && styles.selActive]}
                >
                  <Text
                    style={[
                      styles.selText,
                      settings.nearbyRadiusMiles === mi && styles.selTextActive,
                    ]}
                  >
                    {mi} mi
                  </Text>
                </Pressable>
              ))}
            </View>
            {locationStatus === 'denied' && (
              <Pressable onPress={requestLocation} accessibilityRole="button">
                <Text style={[styles.hint, { color: colors.warm, marginTop: spacing.sm }]}>
                  Location permission denied. Tap to grant.
                </Text>
              </Pressable>
            )}
            {locationStatus === 'granted' && (
              <Text style={[styles.hint, { color: colors.active, marginTop: spacing.sm }]}>
                Location on — showing centers near you.
              </Text>
            )}
          </>
        )}
      </Card>

      <Text style={styles.footer}>
        SafeHaven STL · a community reference for St. Louis warming & cooling centers. Not an
        official City service. Call 2-1-1 to confirm.
      </Text>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    selRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
    sel: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    selText: { color: colors.text, fontWeight: '700' },
    selTextActive: { color: colors.bg },
    switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
    label: { color: colors.text, fontSize: 15, fontWeight: '600' },
    hint: { color: colors.textMuted, fontSize: 12, marginTop: 2, lineHeight: 17 },
    footer: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.sm },
  });
