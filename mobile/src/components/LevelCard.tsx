import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { LevelProgress } from '../types';
import {
  fontSize, fontWeight, iconSize, lineHeight, radius, shadows, spacing,
} from '../theme/designSystem';

interface Props {
  progress: LevelProgress;
  onPress?: () => void;
}

export const LevelCard: React.FC<Props> = ({ progress, onPress }) => {
  const { theme } = useTheme();
  const { current, next, reportsCount, reportsToNext, progress: pct } = progress;
  const percent = Math.round(pct * 100);
  const isMax = !next;

  const nextLabel = isMax
    ? 'Nível máximo alcançado 🏆'
    : `Faltam ${reportsToNext} reporte${reportsToNext === 1 ? '' : 's'} para ${next!.title}`;

  const content = (
    <>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: theme.colors.primary + '18' }]}>
          <Feather name="award" size={iconSize.md} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.levelLabel, { color: theme.colors.textMuted }]}>SEU NÍVEL</Text>
          <Text style={[styles.levelTitle, { color: theme.colors.textPrimary }]}>{current.title}</Text>
        </View>
        <Text style={[styles.reportsCount, { color: theme.colors.textSecondary }]}>
          {reportsCount} {reportsCount === 1 ? 'reporte' : 'reportes'}
        </Text>
        {onPress && (
          <Feather
            name="chevron-right"
            size={iconSize.md}
            color={theme.colors.textMuted}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>

      <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
        <View style={[
          styles.fill,
          { backgroundColor: theme.colors.primary, width: `${Math.min(100, Math.max(2, percent))}%` },
        ]} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {nextLabel}
        </Text>
        <Text style={[styles.percentText, { color: theme.colors.primary }]}>{percent}%</Text>
      </View>
    </>
  );

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border },
    shadows.md,
  ];

  if (!onPress) {
    return <View style={cardStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    width: 44, height: 44, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  levelLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5 },
  levelTitle: {
    fontSize: fontSize.lg, fontWeight: fontWeight.bold,
    lineHeight: fontSize.lg * lineHeight.tight, marginTop: spacing.xxs,
  },
  reportsCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  track: { height: 10, borderRadius: radius.pill, marginTop: spacing.lg, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.sm, gap: spacing.sm,
  },
  footerText: { fontSize: fontSize.sm, flex: 1 },
  percentText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});