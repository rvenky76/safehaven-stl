import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Center } from '@/types/center';
import { useStore } from '@/store/AppStore';
import { Card, SectionTitle, ServiceBadge } from '@/ui/components';
import { radius, spacing, useTheme, type Palette } from '@/ui/theme';

function mapsUrl(c: Center): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address)}`;
}

export default function CenterDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { centers, activationFor } = useStore();
  const center = centers.find((c) => c.id === id);

  if (!center) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Center not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}
    >
      <Stack.Screen options={{ title: center.name }} />

      <Card>
        <Text style={styles.name} accessibilityRole="header">
          {center.name}
        </Text>
        <View style={styles.badges}>
          {center.services.map((s) => (
            <ServiceBadge key={s} service={s} />
          ))}
        </View>
        <Text style={[styles.body, { marginTop: spacing.md }]}>{center.address}</Text>
        {center.approxLocation && (
          <Text style={styles.approx}>Location is approximate (ZIP-level)</Text>
        )}

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
              accessibilityLabel={`Call ${center.name} at ${center.phone}`}
              style={[styles.action, { backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>📞 {center.phone}</Text>
            </Pressable>
          ) : null}
        </View>
      </Card>

      {center.hours ? (
        <Card>
          <SectionTitle>Hours</SectionTitle>
          <Text style={styles.body}>{center.hours}</Text>
          <Text style={[styles.muted, { marginTop: spacing.sm }]}>
            Hours can change, and sites may close in severe weather. Call 2-1-1 or the number above
            to confirm before you travel.
          </Text>
        </Card>
      ) : null}

      {center.notes ? (
        <Card>
          <SectionTitle>Also offers</SectionTitle>
          <Text style={styles.body}>{center.notes}</Text>
        </Card>
      ) : null}

      <Card>
        <SectionTitle>When is this open as a center?</SectionTitle>
        {center.services.map((s) => {
          const a = activationFor(s);
          return (
            <Text key={s} style={[styles.body, { marginBottom: 4 }]}>
              {s === 'warming' ? '🔥 Warming' : '❄️ Cooling'}: {a?.active ? 'ACTIVE now' : a?.label}
            </Text>
          );
        })}
        <Text style={[styles.muted, { marginTop: spacing.sm }]}>
          Warming centers open when the City declares Code Blue (extreme cold); cooling sites open
          during a declared heat emergency. Outside those windows, the site keeps its normal hours.
        </Text>
      </Card>

      {center.website ? (
        <Pressable onPress={() => Linking.openURL(center.website!)} accessibilityRole="link">
          <Text style={[styles.link]}>Visit website ↗</Text>
        </Pressable>
      ) : null}

      <Text style={styles.source}>Source: {center.source}</Text>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    name: { color: colors.text, fontSize: 22, fontWeight: '800' },
    badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    body: { color: colors.text, fontSize: 16, lineHeight: 22 },
    muted: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
    approx: { color: colors.textMuted, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap' },
    action: {
      flexGrow: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    actionText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    link: { color: colors.accent, fontSize: 15, fontWeight: '700' },
    source: { color: colors.textMuted, fontSize: 11, marginTop: spacing.sm },
  });
