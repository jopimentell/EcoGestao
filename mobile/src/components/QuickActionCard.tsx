// mobile/src/components/QuickActionCard.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import { Icon, type IconName } from './Icon';
import { useTheme } from '../context/ThemeContext';
import {
  fontSize, fontWeight, iconSize, lineHeight, radius, shadows, spacing,
} from '../theme/designSystem';

interface Props {
  icon: IconName;
  title: string;
  description: string;
  accentColor: string;
  onPress: () => void;
}

export const QuickActionCard: React.FC<Props> = ({ icon, title, description, accentColor, onPress }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border },
        shadows.md,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={[styles.iconBubble, { backgroundColor: accentColor + '18' }]}>
        <Icon name={icon} size={iconSize.lg} color={accentColor} />
      </View>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {description}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1 },
  iconBubble: {
    width: 48, height: 48, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg, fontWeight: fontWeight.bold,
    lineHeight: fontSize.lg * lineHeight.tight, marginBottom: spacing.xs,
  },
  description: { fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal },
});