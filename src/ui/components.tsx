import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CenterService } from '@/types/center';
import { radius, spacing, useTheme } from '@/ui/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{children}</Text>;
}

export function ServiceBadge({ service }: { service: CenterService }) {
  const { colors } = useTheme();
  const isWarm = service === 'warming';
  const color = isWarm ? colors.warm : colors.cool;
  const label = isWarm ? 'Warming' : 'Cooling';
  const icon = isWarm ? '🔥' : '❄️';
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${label} center`}
      style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}
    >
      <Text style={[styles.badgeText, { color }]}>
        {icon} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: spacing.lg, borderWidth: 1 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
