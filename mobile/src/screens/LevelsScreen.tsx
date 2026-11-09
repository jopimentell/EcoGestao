// mobile/src/screens/LevelsScreen.tsx
// Jornada de níveis (gamificação): timeline vertical com nível atual, conquistados e bloqueados.
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { TopContributorsList, useTopContributors } from '../components/TopContributors';
import type { LevelWithProgress } from '../types';
import {
  fontSize, fontWeight, getLevelVisual, iconSize, layout, lineHeight, onAccentColor, radius,
  severityColors, shadows, spacing, tint,
} from '../theme/designSystem';

type FeatherName = keyof typeof Feather.glyphMap;
export type LevelState = 'done' | 'current' | 'locked';

/* ---------- Dados (compartilhado com a versão .web.tsx) ---------- */
export interface LevelsSummary {
  current: LevelWithProgress | null;
  next: LevelWithProgress | null;
  userReports: number;
  progress: number; // 0..1 até o próximo nível
}

export function getLevelState(level: LevelWithProgress): LevelState {
  if (level.is_current) return 'current';
  return level.is_unlocked ? 'done' : 'locked';
}

export function summarizeLevels(levels: LevelWithProgress[]): LevelsSummary {
  const current = levels.find((l) => l.is_current) ?? null;
  const next = levels.find((l) => !l.is_unlocked) ?? null;
  const base = current?.min_reports ?? 0;
  const userReports = next ? next.min_reports - next.reports_needed : base;
  const span = next ? next.min_reports - base : 0;
  const progress = next ? (span > 0 ? Math.min(1, Math.max(0, (userReports - base) / span)) : 0) : 1;
  return { current, next, userReports, progress };
}

export function useLevelsProgress() {
  const { user } = useAuth();
  const [levels, setLevels] = useState<LevelWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc('get_levels_with_progress', { p_user_id: user.id });
    if (rpcError) {
      console.warn('Falha ao carregar níveis', rpcError);
      setError('Não foi possível carregar os níveis.');
    } else {
      // A RPC retorna o nível atual com is_unlocked = false; o nível atual conta como conquistado
      const rows = ((data ?? []) as LevelWithProgress[])
        .map((l) => ({
          ...l,
          min_reports: Number(l.min_reports),
          reports_needed: Number(l.reports_needed),
          is_unlocked: l.is_unlocked || l.is_current,
        }))
        .sort((a, b) => a.level - b.level);
      setLevels(rows);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return { levels, loading, error, reload: load, summary: summarizeLevels(levels) };
}

/* ---------- Visual por estado ---------- */
export function useLevelStateVisual() {
  const { theme } = useTheme();
  return (level: LevelWithProgress) => {
    const state = getLevelState(level);
    const visual = getLevelVisual(level.level);
    if (state === 'done') {
      return { state, icon: 'check' as FeatherName, color: severityColors.Baixa, label: 'Conquistado' };
    }
    if (state === 'current') {
      return { state, icon: visual.icon as FeatherName, color: theme.colors.primary, label: 'Nível atual' };
    }
    return {
      state,
      icon: 'lock' as FeatherName,
      color: theme.colors.textMuted,
      label: `Faltam ${level.reports_needed} reporte${level.reports_needed === 1 ? '' : 's'}`,
    };
  };
}

/* ---------- Tela mobile ---------- */
export const LevelsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { levels, loading, error, reload, summary } = useLevelsProgress();
  const visualFor = useLevelStateVisual();
  const ranking = useTopContributors(10);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        {navigation.canGoBack() && (
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
          >
            <Feather name="arrow-left" size={iconSize.sm} color={theme.colors.textPrimary} />
          </Pressable>
        )}
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Jornada de níveis</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Cada reporte aprovado te leva mais longe
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={iconSize.xl} color={theme.colors.textMuted} />
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>{error}</Text>
          <Pressable onPress={reload} style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Resumo */}
          <View style={[styles.summary, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }, shadows.md]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>SEU NÍVEL</Text>
            <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>{summary.current?.title ?? '—'}</Text>
            <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
              <View style={[styles.fill, { backgroundColor: theme.colors.primary, width: `${Math.round(summary.progress * 100)}%` }]} />
            </View>
            <Text style={[styles.summaryFoot, { color: theme.colors.textSecondary }]}>
              {summary.next
                ? `Faltam ${summary.next.reports_needed} reporte${summary.next.reports_needed === 1 ? '' : 's'} para ${summary.next.title}`
                : 'Nível máximo alcançado 🏆'}
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            {levels.map((level, i) => {
              const v = visualFor(level);
              const isLast = i === levels.length - 1;
              const current = v.state === 'current';
              return (
                <View key={level.level} style={styles.item}>
                  <View style={styles.rail}>
                    <View style={[
                      styles.node,
                      v.state === 'locked'
                        ? { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }
                        : { backgroundColor: v.color, borderColor: v.color },
                      current && styles.nodeCurrent,
                    ]}>
                      <Feather name={v.icon} size={iconSize.sm} color={v.state === 'locked' ? theme.colors.textMuted : onAccentColor} />
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.line,
                        { backgroundColor: v.state === 'done' ? severityColors.Baixa : theme.colors.border },
                      ]} />
                    )}
                  </View>

                  <View style={[
                    styles.card,
                    { backgroundColor: theme.colors.surface1, borderColor: current ? theme.colors.primary : theme.colors.border },
                    current && { backgroundColor: theme.colors.primary + tint.subtle },
                    v.state === 'locked' && styles.cardLocked,
                  ]}>
                    <Text style={[styles.cardEyebrow, { color: theme.colors.textMuted }]}>NÍVEL {level.level}</Text>
                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{level.title}</Text>
                    <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
                      A partir de {level.min_reports} reporte{level.min_reports === 1 ? '' : 's'} aprovado{level.min_reports === 1 ? '' : 's'}
                    </Text>
                    <View style={[styles.statePill, { backgroundColor: v.color + tint.soft }]}>
                      <Text style={[styles.statePillText, { color: v.color }]}>{v.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Ranking top 10 */}
          <View style={[styles.summary, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <View style={styles.rankingHeader}>
              <Feather name="award" size={iconSize.sm} color={theme.colors.primary} />
              <Text style={[styles.rankingTitle, { color: theme.colors.textPrimary }]}>Top 10 colaboradores</Text>
            </View>
            <Text style={[styles.summaryFoot, { color: theme.colors.textSecondary }]}>
              Ranking por reportes aprovados pela moderação
            </Text>
            <TopContributorsList
              items={ranking.items}
              loading={ranking.loading}
              error={ranking.error}
              currentUserId={user?.id}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  backBtn: {
    width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center', borderWidth: layout.borderWidth,
  },
  headerText: { flex: 1 },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, lineHeight: fontSize.xxl * lineHeight.tight },
  subtitle: { fontSize: fontSize.sm, marginTop: spacing.xxs },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxl },
  errorText: { fontSize: fontSize.md, textAlign: 'center' },
  retryBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md },
  retryText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl },

  summary: { borderRadius: radius.lg, borderWidth: layout.borderWidth, padding: spacing.lg, gap: spacing.sm },
  summaryLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5 },
  summaryTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  track: { height: spacing.sm, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.xs },
  fill: { height: '100%', borderRadius: radius.pill },
  summaryFoot: { fontSize: fontSize.sm },
  rankingHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rankingTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  timeline: {},
  item: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: iconSize.xl },
  node: {
    width: iconSize.xl, height: iconSize.xl, borderRadius: radius.pill, borderWidth: spacing.xxs,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeCurrent: { ...shadows.md },
  line: { flex: 1, width: spacing.xxs, marginVertical: spacing.xs },

  card: {
    flex: 1, borderRadius: radius.md, borderWidth: layout.borderWidth,
    padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.xxs,
  },
  cardLocked: { opacity: 0.7 },
  cardEyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5 },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  cardSub: { fontSize: fontSize.sm },
  statePill: {
    alignSelf: 'flex-start', marginTop: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.pill,
  },
  statePillText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
});
