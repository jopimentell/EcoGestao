// mobile/src/components/OccurrenceCounter.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  fontSize, fontWeight, iconSize, lineHeight, radius, shadows, spacing,
} from '../theme/designSystem';

interface Props {
  count: number;
  title?: string;
  subtitle?: string;
}

export const OccurrenceCounter: React.FC<Props> = ({
  count,
  title = 'ocorrências reportadas',
  subtitle = 'Sua comunidade está fazendo a diferença',
}) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border },
      shadows.md,
    ]}>
      <View style={[styles.iconBubble, { backgroundColor: theme.colors.primary + '18' }]}>
        <Feather name="map-pin" size={iconSize.lg} color={theme.colors.primary} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.count, { color: theme.colors.textPrimary }]}>{count}</Text>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconBubble: {
    width: 52, height: 52, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  body: { flexDirection: 'row', alignItems: 'baseline', flex: 1 },
  count: {
    fontSize: fontSize.xxl, fontWeight: fontWeight.bold,
    marginRight: spacing.sm, lineHeight: fontSize.xxl * lineHeight.tight,
  },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, flexShrink: 1 },
  subtitle: {
    width: '100%', marginTop: spacing.sm,
    fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal,
  },
});