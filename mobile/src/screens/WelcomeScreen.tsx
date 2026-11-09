import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Text } from '../components/Typography';
import { BeamButton } from '../components/BeamButton';
import { Icon, type IconName } from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import {
  fontSize, fontWeight, onPastelColor, pastelColors, radius, spacing,
} from '../theme/designSystem';

// ─── Animações ────────────────────────────────────────────────────────────────
function useFadeInUp(delay: number, duration = 600) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, delay, duration]);

  return { opacity, transform: [{ translateY }] };
}

function useFloat(delay: number) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -6, duration: 1600, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [y, delay]);
  return { transform: [{ translateY: y }] };
}

// ─── Ícone flutuante em círculo pastel ──────────────────────────────────────
function FloatingBubble({ icon, bg, style, delay }: {
  icon: IconName; bg: string; style: object; delay: number;
}) {
  const float = useFloat(delay);
  return (
    <Animated.View style={[styles.bubble, { backgroundColor: bg }, style, float]}>
      <Icon name={icon} size={24} color={onPastelColor} />
    </Animated.View>
  );
}

const CIRCLE = 280;

export const WelcomeScreen = ({ onLoginPress, onRegisterPress }: { onLoginPress: () => void, onRegisterPress: () => void }) => {
  const { theme, isDark } = useTheme();
  const heroAnim  = useFadeInUp(100);
  const sheetAnim = useFadeInUp(300);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>

        {/* Ilustração: círculo + cartão central + ícones flutuantes */}
        <Animated.View style={[styles.hero, heroAnim]}>
          <View
            style={[
              styles.circle,
              { backgroundColor: isDark ? theme.colors.primary : pastelColors.mint },
            ]}
          />
          <View style={[styles.card, { backgroundColor: theme.colors.surface1 }]}>
            <View style={[styles.cardIcon, { backgroundColor: theme.colors.primaryMuted }]}>
              <Icon name="map-pin" size={30} color={theme.colors.primary} weight="fill" />
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Descarte irregular</Text>
            <Text style={[styles.cardSub, { color: theme.colors.textMuted }]}>Bairro Centro · agora</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: pastelColors.lime }]}>
                <Text style={styles.chipText}>Entulho</Text>
                <Icon name="recycle" size={12} color={onPastelColor} />
              </View>
              <View style={[styles.chip, { backgroundColor: pastelColors.peach }]}>
                <Text style={styles.chipText}>Em análise</Text>
                <Icon name="clock" size={12} color={onPastelColor} />
              </View>
            </View>
          </View>

          <FloatingBubble icon="recycle" bg={pastelColors.lime} style={styles.bubbleTopLeft} delay={0} />
          <FloatingBubble icon="globe" bg={pastelColors.lavender} style={styles.bubbleTopRight} delay={400} />
          <FloatingBubble icon="drop" bg={pastelColors.sky} style={styles.bubbleBottomLeft} delay={800} />
          <FloatingBubble icon="leaf" bg={pastelColors.peach} style={styles.bubbleBottomRight} delay={1200} />
        </Animated.View>

        {/* Painel inferior */}
        <Animated.View style={[styles.sheet, { backgroundColor: theme.colors.surface1 }, sheetAnim]}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: theme.colors.surface3 }]} />
            <View style={[styles.dot, styles.dotActive, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: theme.colors.surface3 }]} />
          </View>

          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Sua cidade mais limpa
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Registre descartes irregulares, descubra onde descartar e acompanhe a sua comunidade em Caxias.
          </Text>

          <View style={styles.actions}>
            <BeamButton title="Entrar" iconRight="arrow-right" isPrimary onPress={onLoginPress} style={styles.btn} />
            <BeamButton title="Criar conta" onPress={onRegisterPress} style={styles.btn} />
          </View>

          <Text style={[styles.footerNote, { color: theme.colors.textMuted }]}>
            Ao entrar, você concorda com os termos de uso da plataforma.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  hero: {
    flex: 1,
    minHeight: CIRCLE + 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
  },
  card: {
    width: 200,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#232323',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  cardSub: {
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: onPastelColor,
  },
  bubble: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleTopLeft:     { top: '14%', left: '12%' },
  bubbleTopRight:    { top: '10%', right: '14%' },
  bubbleBottomLeft:  { bottom: '14%', left: '16%' },
  bubbleBottomRight: { bottom: '18%', right: '10%' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  btn: {
    width: '100%',
  },
  footerNote: {
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
