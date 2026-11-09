// mobile/src/screens/HomeScreen.web.tsx
// Dashboard Web Desktop: KPIs no topo, conteúdo central (atalhos, mapa, reportes) e painel lateral (status + ranking).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { OccurrenceCounter } from '../components/OccurrenceCounter';
import { LevelCard } from '../components/LevelCard';
import { QuickActionCard } from '../components/QuickActionCard';
import { LeafletMap } from '../components/LeafletMap';
import { TopContributorsList, useTopContributors } from '../components/TopContributors';
import {
  DesktopBadge, DesktopCard, DesktopColumns, DesktopContainer, DesktopPageHeader, ResponsiveGrid,
  getSeverityColor, getStatusColor, responsiveScreen, type WebPressableState,
} from '../components/web/DesktopContainer';
import { getRelativeTime } from '../utils/date';
import type { LevelProgress } from '../types';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, onAccentColor, radius, spacing, tint,
} from '../theme/designSystem';

const { HomeScreen: MobileHomeScreen } = require('./HomeScreen.tsx') as typeof import('./HomeScreen');

const STATUS_ORDER = ['Novo', 'Em análise', 'Aprovado', 'Resolvido'] as const;

/* ---------- Card de reporte (grid) ---------- */
function ReportGridCard({ item, onPress }: {
  item: { id: string; street: string; neighborhood?: string; severity: string; status: string; createdAt: string; images?: string[] };
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const sevColor = getSeverityColor(item.severity);
  const cover = item.images?.[0];

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: WebPressableState) => [
        styles.reportCard,
        { backgroundColor: theme.colors.surface1, borderColor: hovered ? theme.colors.primary + tint.strong : theme.colors.border },
      ]}
    >
      {cover ? (
        <Image source={{ uri: cover }} style={styles.reportCover} />
      ) : (
        <View style={[styles.reportCover, styles.coverPlaceholder, { backgroundColor: theme.colors.surface2 }]}>
          <Feather name="image" size={iconSize.lg} color={theme.colors.textMuted} />
        </View>
      )}
      <View style={styles.reportBody}>
        <View style={styles.badgeRow}>
          <DesktopBadge label={item.severity} color={sevColor} />
          <DesktopBadge label={item.status} color={getStatusColor(item.status, theme)} />
        </View>
        <Text style={[styles.reportStreet, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.street}</Text>
        <Text style={[styles.reportSub, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {item.neighborhood || 'Bairro não informado'} · {getRelativeTime(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------- Tela desktop ---------- */
function HomeDesktop() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const { reports, loading } = useReports();
  const { theme } = useTheme();

  const [totalReports, setTotalReports] = useState(0);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const ranking = useTopContributors(3);

  // Mesma lógica de stats da Home mobile (RPCs do Supabase)
  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    setLoadingStats(true);
    try {
      const { data: stats } = await supabase.rpc('get_community_stats');
      if (stats?.[0]) setTotalReports(Number(stats[0].total_reports));

      const { data: lvl, error } = await supabase.rpc('get_user_level_progress', { p_user_id: user.id });
      if (error) throw error;
      const row = lvl?.[0];
      if (row) {
        setLevelProgress({
          current: { level: row.current_level, title: row.current_title, min_reports: 0 },
          next: row.next_level ? { level: row.next_level, title: row.next_title, min_reports: 0 } : null,
          reportsCount: Number(row.user_reports),
          reportsToNext: Number(row.reports_to_next),
          progress: Number(row.progress),
        });
      }
    } catch (err) {
      console.warn('Falha ao carregar stats da home', err);
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const markers = useMemo(() => reports
    .filter((r) => r.latitude && r.longitude)
    .map((r) => ({
      id: r.id,
      lat: r.latitude!,
      lng: r.longitude!,
      color: getSeverityColor(r.severity),
      image: r.images?.[0],
      title: r.street,
      description: r.neighborhood,
    })), [reports]);

  const statusCounts = useMemo(() => STATUS_ORDER.map((status) => ({
    status,
    count: reports.filter((r) => r.status === status).length,
  })), [reports]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) return null;

  const openReport = (reportId: string) => navigation.navigate('ReportDetail', { reportId });
  const maxStatus = Math.max(1, ...statusCounts.map((s) => s.count));

  /* ----- Coluna principal ----- */
  const main = (
    <>
      <View style={styles.actionsRow}>
        <QuickActionCard
          icon="map"
          title="Mapa de ocorrências"
          description="Veja as denúncias reportadas na cidade"
          accentColor={theme.colors.primary}
          onPress={() => navigation.navigate('Mapa')}
        />
        <QuickActionCard
          icon="trash-2"
          title="Onde descartar"
          description="Pontos de coleta de resíduos"
          accentColor={theme.colors.emerald}
          onPress={() => navigation.navigate('DropOff')}
        />
      </View>

      <DesktopCard
        title="Mapa da cidade"
        right={(
          <Pressable onPress={() => navigation.navigate('Mapa')} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>Abrir mapa completo</Text>
            <Feather name="arrow-right" size={iconSize.sm} color={theme.colors.primary} />
          </Pressable>
        )}
      >
        <View style={[styles.mapBox, { borderColor: theme.colors.border }]}>
          <LeafletMap markers={markers} interactive={false} />
        </View>
      </DesktopCard>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Reportes recentes{reports.length > 0 ? ` (${reports.length})` : ''}
        </Text>
        <Pressable onPress={() => navigation.navigate('Comunidade')} style={styles.linkBtn}>
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>Ver todos</Text>
          <Feather name="arrow-right" size={iconSize.sm} color={theme.colors.primary} />
        </Pressable>
      </View>

      {reports.length === 0 ? (
        <DesktopCard style={styles.emptyCard}>
          <Feather name="info" size={iconSize.xl} color={theme.colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Nenhum reporte ainda</Text>
          <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>Seja o primeiro a reportar uma ocorrência em Caxias!</Text>
        </DesktopCard>
      ) : (
        <ResponsiveGrid
          data={reports.slice(0, 6)}
          minItemWidth={layout.sidePanelWidth - spacing.xxxl}
          maxColumns={3}
          keyExtractor={(r) => r.id}
          renderItem={(r) => <ReportGridCard item={r} onPress={() => openReport(r.id)} />}
        />
      )}
    </>
  );

  /* ----- Painel lateral ----- */
  const side = (
    <>
      <DesktopCard title="Status das ocorrências">
        {statusCounts.map(({ status, count }) => {
          const color = getStatusColor(status, theme);
          return (
            <View key={status} style={styles.statusRow}>
              <View style={styles.statusLabelRow}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>{status}</Text>
                <Text style={[styles.statusCount, { color: theme.colors.textPrimary }]}>{count}</Text>
              </View>
              <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
                <View style={[styles.fill, { backgroundColor: color, width: `${(count / maxStatus) * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </DesktopCard>

      <DesktopCard title="Top 3 colaboradores" right={<Feather name="award" size={iconSize.sm} color={theme.colors.primary} />}>
        <TopContributorsList
          items={ranking.items}
          loading={ranking.loading}
          error={ranking.error}
          currentUserId={user.id}
        />
      </DesktopCard>
    </>
  );

  return (
    <DesktopContainer>
      <DesktopPageHeader
        eyebrow={`Olá, ${user.name.split(' ')[0]}`}
        title="Painel da comunidade"
        subtitle="Acompanhe as ocorrências e a sua contribuição para Caxias-MA."
        right={(
          <Pressable
            onPress={() => navigation.navigate('Reportar')}
            style={({ hovered }: WebPressableState) => [styles.primaryBtn, { backgroundColor: theme.colors.primary }, hovered && styles.hovered]}
          >
            <Feather name="plus" size={iconSize.sm} color={onAccentColor} />
            <Text style={styles.primaryBtnText}>Novo reporte</Text>
          </Pressable>
        )}
      />

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <OccurrenceCounter count={totalReports} />
        </View>
        <View style={styles.kpiItem}>
          {loadingStats || !levelProgress ? (
            <DesktopCard style={styles.loadingCard}>
              <ActivityIndicator color={theme.colors.primary} />
            </DesktopCard>
          ) : (
            <LevelCard progress={levelProgress} onPress={() => navigation.navigate('Levels')} />
          )}
        </View>
      </View>

      <DesktopColumns main={main} side={side} />
    </DesktopContainer>
  );
}

export const HomeScreen = responsiveScreen(HomeDesktop, MobileHomeScreen);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    height: layout.controlHeight, paddingHorizontal: spacing.lg, borderRadius: radius.sm,
  },
  primaryBtnText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  hovered: { opacity: 0.9 },

  kpiRow: { flexDirection: 'row', gap: spacing.xl, alignItems: 'stretch' },
  kpiItem: { flex: 1 },
  loadingCard: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  actionsRow: { flexDirection: 'row', gap: spacing.lg },

  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  linkText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  mapBox: { height: layout.mapPreviewHeight, borderRadius: radius.md, overflow: 'hidden', borderWidth: layout.borderWidth },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },

  reportCard: { borderRadius: radius.md, borderWidth: layout.borderWidth, overflow: 'hidden' },
  reportCover: { width: '100%', height: layout.cardImageHeight },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  reportBody: { padding: spacing.lg, gap: spacing.xs },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  reportStreet: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  reportSub: { fontSize: fontSize.xs },

  emptyCard: { alignItems: 'center' },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  emptySub: { fontSize: fontSize.sm, textAlign: 'center', lineHeight: fontSize.sm * lineHeight.normal },

  statusRow: { gap: spacing.xs },
  statusLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.pill },
  statusLabel: { flex: 1, fontSize: fontSize.sm },
  statusCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  track: { height: spacing.xs + spacing.xxs, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
