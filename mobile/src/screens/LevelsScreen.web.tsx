// mobile/src/screens/LevelsScreen.web.tsx
// Jornada de níveis Web Desktop: grid de níveis + painel lateral com o progresso do usuário.
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/Typography';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TopContributorsList, useTopContributors } from '../components/TopContributors';
import {
  DesktopCard, DesktopColumns, DesktopContainer, DesktopPageHeader, ResponsiveGrid,
  responsiveScreen, type WebPressableState,
} from '../components/web/DesktopContainer';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, onAccentColor, radius, severityColors, shadows, spacing, tint,
} from '../theme/designSystem';

// Import explícito do arquivo mobile: tela de fallback + lógica de dados compartilhada
const {
  LevelsScreen: MobileLevelsScreen, useLevelsProgress, useLevelStateVisual,
} = require('./LevelsScreen.tsx') as typeof import('./LevelsScreen');

function LevelsDesktop() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { levels, loading, error, reload, summary } = useLevelsProgress();
  const visualFor = useLevelStateVisual();
  const ranking = useTopContributors(10);

  const unlockedCount = levels.filter((l) => l.is_unlocked).length;

  let main: React.ReactNode;
  if (loading) {
    main = <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;
  } else if (error) {
    main = (
      <DesktopCard style={styles.center}>
        <Icon name="alert-circle" size={iconSize.xl} color={theme.colors.textMuted} />
        <Text style={[styles.muted, { color: theme.colors.textSecondary }]}>{error}</Text>
        <Pressable onPress={reload} style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.primaryText}>Tentar novamente</Text>
        </Pressable>
      </DesktopCard>
    );
  } else {
    main = (
      <ResponsiveGrid
        data={levels}
        minItemWidth={layout.sidePanelWidth - spacing.xxxl - spacing.xl}
        maxColumns={3}
        keyExtractor={(l) => String(l.level)}
        renderItem={(level) => {
          const v = visualFor(level);
          const current = v.state === 'current';
          const locked = v.state === 'locked';
          return (
            <View style={[
              styles.card,
              { backgroundColor: theme.colors.surface1, borderColor: current ? theme.colors.primary : theme.colors.border },
              current && { backgroundColor: theme.colors.primary + tint.subtle },
              current && shadows.md,
              locked && styles.cardLocked,
            ]}>
              <View style={styles.cardTop}>
                <View style={[
                  styles.node,
                  locked
                    ? { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }
                    : { backgroundColor: v.color, borderColor: v.color },
                ]}>
                  <Icon name={v.icon} size={iconSize.md} color={locked ? theme.colors.textMuted : onAccentColor} />
                </View>
                <Text style={[styles.levelNumber, { color: theme.colors.textMuted }]}>NÍVEL {level.level}</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{level.title}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
                A partir de {level.min_reports} reporte{level.min_reports === 1 ? '' : 's'} aprovado{level.min_reports === 1 ? '' : 's'}
              </Text>
              <View style={[styles.statePill, { backgroundColor: v.color + tint.soft }]}>
                <Text style={[styles.statePillText, { color: v.color }]}>{v.label}</Text>
              </View>
            </View>
          );
        }}
      />
    );
  }

  const percent = Math.round(summary.progress * 100);

  const side = (
    <>
      <DesktopCard>
        <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>SEU NÍVEL</Text>
        <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>{summary.current?.title ?? '—'}</Text>
        <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
          <View style={[styles.fill, { backgroundColor: theme.colors.primary, width: `${percent}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={[styles.muted, { color: theme.colors.textSecondary }]}>
            {summary.next
              ? `Faltam ${summary.next.reports_needed} para ${summary.next.title}`
              : 'Nível máximo alcançado 🏆'}
          </Text>
          <Text style={[styles.percent, { color: theme.colors.primary }]}>{percent}%</Text>
        </View>
        <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{summary.userReports}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Reportes aprovados</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{unlockedCount}/{levels.length}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Níveis conquistados</Text>
          </View>
        </View>
      </DesktopCard>

      <DesktopCard title="Top 10 colaboradores" right={<Icon name="award" size={iconSize.sm} color={theme.colors.primary} />}>
        <TopContributorsList
          items={ranking.items}
          loading={ranking.loading}
          error={ranking.error}
          currentUserId={user?.id}
        />
      </DesktopCard>

      <DesktopCard title="Legenda">
        {[
          { icon: 'check' as const, color: severityColors.Baixa, label: 'Nível conquistado' },
          { icon: 'star' as const, color: theme.colors.primary, label: 'Nível atual' },
          { icon: 'lock' as const, color: theme.colors.textMuted, label: 'Nível bloqueado' },
        ].map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <Icon name={item.icon} size={iconSize.sm} color={item.color} />
            <Text style={[styles.muted, { color: theme.colors.textSecondary }]}>{item.label}</Text>
          </View>
        ))}
        <Text style={[styles.note, { color: theme.colors.textMuted }]}>
          O nível considera apenas reportes aprovados pela moderação.
        </Text>
      </DesktopCard>

      <Pressable
        onPress={() => navigation.navigate('Reportar' as never)}
        style={({ hovered }: WebPressableState) => [styles.primaryBtn, { backgroundColor: theme.colors.primary }, hovered && styles.hovered]}
      >
        <Icon name="plus" size={iconSize.sm} color={onAccentColor} />
        <Text style={styles.primaryText}>Fazer um novo reporte</Text>
      </Pressable>
    </>
  );

  return (
    <DesktopContainer>
      <DesktopPageHeader
        left={navigation.canGoBack() ? (
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Voltar" style={[styles.backBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <Icon name="arrow-left" size={iconSize.sm} color={theme.colors.textPrimary} />
          </Pressable>
        ) : undefined}
        title="Jornada de níveis"
        subtitle="Cada reporte aprovado te leva mais longe na missão por uma Caxias mais limpa."
      />
      <DesktopColumns main={main} side={side} />
    </DesktopContainer>
  );
}

export const LevelsScreen = responsiveScreen(LevelsDesktop, MobileLevelsScreen);

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  muted: { fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal },
  hovered: { opacity: 0.9 },

  backBtn: {
    width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.pill,
    borderWidth: layout.borderWidth, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: layout.controlHeight, paddingHorizontal: spacing.lg, borderRadius: radius.sm,
  },
  primaryText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  card: { height: '100%', borderRadius: radius.lg, borderWidth: layout.borderWidth, padding: spacing.xl, gap: spacing.xs },
  cardLocked: { opacity: 0.7 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  node: {
    width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.pill, borderWidth: spacing.xxs,
    alignItems: 'center', justifyContent: 'center',
  },
  levelNumber: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5 },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  cardSub: { fontSize: fontSize.sm },
  statePill: {
    alignSelf: 'flex-start', marginTop: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.pill,
  },
  statePillText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: -spacing.sm },
  summaryTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  track: { height: spacing.sm, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginTop: -spacing.sm },
  percent: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  statsRow: { flexDirection: 'row', borderTopWidth: layout.borderWidth, paddingTop: spacing.lg },
  stat: { flex: 1 },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  statLabel: { fontSize: fontSize.xs, marginTop: spacing.xxs },

  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  note: { fontSize: fontSize.xs, lineHeight: fontSize.xs * lineHeight.normal },
});
