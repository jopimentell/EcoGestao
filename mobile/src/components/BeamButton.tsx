import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { Text } from './Typography';
import { Icon, type IconName } from './Icon';
import { useTheme } from '../context/ThemeContext';
import { fontSize, fontWeight, onAccentColor, radius, spacing } from '../theme/designSystem';

interface BeamButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isPrimary?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
}

const HEIGHT = 52;
const BADGE = 38;

// Botão pill do Design System: texto centralizado e, quando há iconRight,
// um círculo à direita com o ícone (padrão "Next →" da referência visual).
export const BeamButton: React.FC<BeamButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  isPrimary = false,
  iconLeft,
  iconRight,
}) => {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number) => {
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 50 }).start();
  };

  const contentColor = isPrimary ? onAccentColor : theme.colors.textPrimary;
  const badgeBg = isPrimary ? theme.colors.primaryStrong : theme.colors.surface2;

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animate(0.97)}
        onPressOut={() => animate(1)}
        style={[
          styles.inner,
          isPrimary
            ? { backgroundColor: theme.colors.primary }
            : { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border, borderWidth: 1 },
        ]}
      >
        {iconRight ? <View style={styles.badgeSpacer} /> : null}

        <View style={styles.label}>
          {iconLeft ? (
            <Icon name={iconLeft} size={18} color={contentColor} style={styles.iconLeft} />
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              { color: contentColor },
              isPrimary && { fontWeight: fontWeight.bold },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>

        {iconRight ? (
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Icon name={iconRight} size={18} color={contentColor} weight="bold" />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    borderRadius: radius.pill,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: (HEIGHT - BADGE) / 2,
  },
  label: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  badgeSpacer: {
    width: BADGE,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
});
