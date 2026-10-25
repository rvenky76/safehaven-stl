import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store/AppStore';
import { Card, SectionTitle } from '@/ui/components';
import { spacing, useTheme, type Palette } from '@/ui/theme';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { centers, curatedAt } = useStore();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}
    >
      <Card>
        <SectionTitle>Why this exists</SectionTitle>
        <Text style={styles.body}>
          When St. Louis hits dangerous cold or heat, the City opens warming and cooling centers —
          but that information is scattered across press releases, PDFs, and separate web pages.
          A person who is unhoused, elderly, or without a car often can&apos;t find a safe place in
          the moment they need it most.
        </Text>
        <Text style={[styles.body, { marginTop: spacing.sm }]}>
          SafeHaven puts every center in one place: nearest first, open in one tap to directions or
          a phone call, and working even on a cheap phone with little data.
        </Text>
      </Card>

      <Card>
        <SectionTitle>How to use it</SectionTitle>
        <Text style={styles.body}>• Tap 🔥 Warming or ❄️ Cooling to filter.</Text>
        <Text style={styles.body}>• Turn on 📍 Near me to see the closest centers.</Text>
        <Text style={styles.body}>• Tap 🧭 Directions or 📞 Call on any center.</Text>
        <Text style={styles.body}>• Star a center to keep it at the top.</Text>
      </Card>

      <Card>
        <SectionTitle>About the data</SectionTitle>
        <Text style={styles.body}>
          This app includes {centers.length} St. Louis centers, curated from the City of
          St. Louis&apos;s published warming- and cooling-center lists. It is a community reference,
          not an official City service — hours and emergency activations can change.
        </Text>
        <Text style={[styles.body, { marginTop: spacing.sm }]}>
          Always confirm by calling 2-1-1 (United Way) or the center&apos;s own number before you
          travel in severe weather.
        </Text>
        <Pressable onPress={() => Linking.openURL('tel:211')} accessibilityRole="button">
          <Text style={styles.callBig}>📞 Call 2-1-1</Text>
        </Pressable>
        <Text style={styles.source}>
          Data last curated {new Date(curatedAt).toLocaleDateString()}.
        </Text>
      </Card>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    body: { color: colors.text, fontSize: 16, lineHeight: 23, marginBottom: 2 },
    callBig: {
      color: colors.accent,
      fontSize: 18,
      fontWeight: '800',
      marginTop: spacing.md,
    },
    source: { color: colors.textMuted, fontSize: 12, marginTop: spacing.md },
  });
