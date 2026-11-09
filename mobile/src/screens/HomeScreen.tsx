import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
  Easing as RNEasing,
  Dimensions,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { OccurrenceCounter } from '../components/OccurrenceCounter';
import { LevelCard } from '../components/LevelCard';
import { QuickActionCard } from '../components/QuickActionCard';
import { RankPosition, useTopContributors } from '../components/TopContributors';
import { getRelativeTime } from '../utils/date';
import { LeafletMap } from '../components/LeafletMap';
import { supabase } from '../services/supabase';
import type { LevelProgress } from '../types';
import { darkTheme, lightTheme } from '../theme/tokens';
import {
  fontSize, fontWeight, lineHeight, onPastelColor, pastelColors, radius, spacing,
  severityColors, type Severity,
} from '../theme/designSystem';
import { SeverityChip, StatusChip } from '../components/Chip';

const { width } = Dimensions.get('window');

const SEVERITIES: { label: Severity }[] = [
  { label: 'Baixa' },
  { label: 'Média' },
  { label: 'Alta' },
  { label: 'Crítica' },
];

const getSeverityColor = (severity: string): string =>
  severityColors[severity as Severity] ?? severityColors['Média'];

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  const { theme } = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
      <Icon name="info" size={40} color={theme.colors.textMuted} style={{ marginBottom: spacing.sm }} />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Nenhum reporte ainda</Text>
      <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
        Seja o primeiro a reportar um Denúncia em Caxias!
      </Text>
    </View>
  );
}

// ── Report mini card ────────────────────────────────────────────────────────
function ReportMini({ item, onPress }: { item: any; onPress: () => void }) {
  const { theme } = useTheme();
  const cover: string | undefined = item.images?.[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.reportRow, { backgroundColor: theme.colors.surface1 }]}
    >
      {cover ? (
        <Image source={{ uri: cover }} style={styles.reportThumb} />
      ) : (
        <View style={[styles.reportThumb, styles.reportThumbEmpty, { backgroundColor: pastelColors.mint }]}>
          <Icon name="map-pin" size={28} color={onPastelColor} />
        </View>
      )}
      <View style={styles.reportBody}>
        <Text style={[styles.reportStreet, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.street}</Text>
        <Text style={[styles.reportSub, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {item.neighborhood} · {getRelativeTime(item.createdAt)}
        </Text>
        <View style={styles.reportChips}>
          <SeverityChip severity={item.severity} />
          {!!item.status && <StatusChip status={item.status} />}
        </View>
      </View>
      <Icon name="chevron-right" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────────
export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const { reports, loading } = useReports();
  const { theme, toggleTheme, transition, isDark } = useTheme();

  const headerAnim = useRef(new RNAnimated.Value(0)).current;
  const [ticker, setTicker] = useState(0);
  const [isMapFullVisible, setIsMapFullVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeverity, setActiveSeverity] = useState<string | null>(null);

  const [totalReports, setTotalReports] = useState(0);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const ranking = useTopContributors(3);

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
          next: row.next_level
            ? { level: row.next_level, title: row.next_title, min_reports: 0 }
            : null,
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

  const handleReportPress = (reportId: string) => {
    navigation.navigate('ReportDetail', { reportId });
  };

  const processedReports = reports.map(report => ({
    ...report,
    severityColor: getSeverityColor(report.severity),
    userAvatar: report.userAvatar || 'default',
    userName: report.userName || 'Usuário',
    isCustomAvatar: report.userAvatar && report.userAvatar !== 'default',
  }));

  useEffect(() => {
    RNAnimated.timing(headerAnim, { toValue: 1, duration: 600, easing: RNEasing.out(RNEasing.quad), useNativeDriver: true }).start();
    const interval = setInterval(() => setTicker(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [headerAnim]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const backgroundColor = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [darkTheme.colors.background, lightTheme.colors.background],
  });

  const markers = processedReports
    .filter(r => r.latitude && r.longitude)
    .filter(r => activeSeverity ? r.severity === activeSeverity : true)
    .filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.street.toLowerCase().includes(q) || r.neighborhood?.toLowerCase().includes(q);
    })
    .map(r => ({
      id: r.id,
      lat: r.latitude!,
      lng: r.longitude!,
      color: r.severityColor,
      image: r.images?.[0],
      title: r.street,
      description: r.neighborhood,
    }));

  if (loading) {
    return (
      <View style={[styles.safe, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) return null;

  return (
    <RNAnimated.View style={[styles.safe, { backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Header */}
          <RNAnimated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }]}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
                Olá, {user.name.split(' ')[0]}
              </Text>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                EcoGestão
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={[styles.themeToggle, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
              >
                <Icon name={isDark ? 'sun' : 'moon'} size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <UserAvatar user={user} />
            </View>
          </RNAnimated.View>

          {/* Contador de ocorrências da comunidade */}
          <View style={styles.section}>
            <OccurrenceCounter count={totalReports} />
          </View>

          {/* Gamificação: nível e progresso */}
          <View style={styles.section}>
            {loadingStats || !levelProgress ? (
              <View style={[styles.loadingBox, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : (
              <LevelCard progress={levelProgress} onPress={() => navigation.navigate('Levels')} />
            )}
          </View>

          {/* Acesso rápido: Mapa + Onde Descartar */}
          <View style={styles.actionsRow}>
            <QuickActionCard
              icon="map"
              title="Mapa de ocorrências"
              description="Veja os Denúncias reportados na cidade"
              accentColor={theme.colors.primary}
              onPress={() => setIsMapFullVisible(true)}
            />
            <View style={{ width: spacing.md }} />
            <QuickActionCard
              icon="trash-2"
              title="Onde descartar"
              description="Pontos de coleta de resíduos"
              accentColor={theme.colors.emerald}
              onPress={() => navigation.navigate('DropOff')}
            />
          </View>

          {/* Ranking */}
          <View style={styles.rankingSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Top 3 Colaboradores</Text>
              <Icon name="award" size={16} color={theme.colors.primary} />
            </View>
            {ranking.loading ? (
              <View style={[styles.loadingBox, styles.rankingMessage, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : ranking.error || ranking.items.length === 0 ? (
              <View style={[styles.loadingBox, styles.rankingMessage, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                <Text style={[styles.emptySub, { color: theme.colors.textMuted }]}>
                  {ranking.error ?? 'Ainda não há colaboradores com reportes aprovados.'}
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rankingScroll}>
                {ranking.items.map((item) => (
                  <View
                    key={item.userId}
                    style={[styles.rankingCard, {
                      backgroundColor: theme.colors.surface1,
                      borderColor: item.userId === user.id ? theme.colors.primary : theme.colors.border,
                    }]}
                  >
                    <View style={styles.rankBadge}>
                      <RankPosition position={item.position} />
                    </View>
                    <UserAvatar user={{ name: item.name, avatar: item.avatar, isCustomAvatar: item.isCustomAvatar }} size={48} />
                    <Text style={[styles.rankingName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {item.name.split(' ')[0]}
                    </Text>
                    <View style={[styles.reportCountBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Text style={[styles.reportCountText, { color: theme.colors.primary }]}>
                        {item.approvedReports} aprovado{item.approvedReports === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Mapa embedded */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Mapa da cidade</Text>
            <TouchableOpacity onPress={() => setIsMapFullVisible(true)} style={styles.seeAllBtn}>
              <Text style={{ color: theme.colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginRight: spacing.xs }}>
                Ver tela cheia
              </Text>
              <Icon name="arrow-right" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={() => setIsMapFullVisible(true)}
            style={[styles.mapContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface1 }]}
          >
            <LeafletMap markers={markers} interactive={false} />
            <LinearGradient colors={['transparent', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.mapOverlay}>
              <View style={[styles.expandBtn, { backgroundColor: theme.colors.primary }]}>
                <Icon name="maximize-2" size={18} color="#FFF" />
              </View>
            </View>
          </Pressable>

          {/* Reportes recentes */}
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
            Reportes recentes{processedReports.length > 0 ? ` (${processedReports.length})` : ''}
          </Text>
          {processedReports.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.reportsList}>
              {processedReports.slice(0, 5).map(r => (
                <ReportMini key={r.id} item={r} onPress={() => handleReportPress(r.id)} />
              ))}
            </View>
          )}

          {/* Modal mapa tela cheia */}
          <Modal visible={isMapFullVisible} animationType="slide" onRequestClose={() => setIsMapFullVisible(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Mapa de Caxias-MA</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: fontSize.xs }}>Navegue pelos reportes ativos</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsMapFullVisible(false)}
                  style={[styles.closeBtn, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, borderWidth: 1 }]}
                >
                  <Icon name="x" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <LeafletMap
                  markers={markers}
                  interactive
                  onMarkerPress={(markerId) => {
                    navigation.navigate('ReportDetail', { reportId: markerId });
                    setIsMapFullVisible(false);
                  }}
                />
                <View style={styles.mapSearchContainer}>
                  <View style={[styles.mapSearchBox, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                    <Icon name="search" size={18} color={theme.colors.textMuted} />
                    <TextInput
                      style={[styles.mapSearchInput, { color: theme.colors.textPrimary }]}
                      placeholder="Buscar ruas ou bairros..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                </View>
                <View style={styles.mapFiltersContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapFiltersScroll}>
                    <TouchableOpacity
                      onPress={() => setActiveSeverity(null)}
                      style={[styles.filterChip, {
                        backgroundColor: !activeSeverity ? theme.colors.primary : theme.colors.surface1,
                        borderColor: theme.colors.border,
                      }]}
                    >
                      <Text style={[styles.filterLabel, { color: !activeSeverity ? '#FFF' : theme.colors.textPrimary }]}>Todos</Text>
                    </TouchableOpacity>
                    {SEVERITIES.map((s) => {
                      const active = activeSeverity === s.label;
                      const color = severityColors[s.label];
                      return (
                        <TouchableOpacity
                          key={s.label}
                          onPress={() => setActiveSeverity(s.label)}
                          style={[styles.filterChip, {
                            backgroundColor: active ? color : theme.colors.surface1,
                            borderColor: theme.colors.border,
                          }]}
                        >
                          <View style={[styles.filterDot, { backgroundColor: active ? '#FFF' : color }]} />
                          <Text style={[styles.filterLabel, { color: active ? '#FFF' : theme.colors.textPrimary }]}>{s.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </SafeAreaView>
          </Modal>

        </ScrollView>
      </SafeAreaView>
    </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: spacing.xl,
  },
  greeting: { fontSize: fontSize.sm, marginBottom: spacing.xxs },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  themeToggle: { width: 44, height: 44, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  loadingBox: { borderRadius: radius.lg, padding: spacing.xxl, alignItems: 'center', borderWidth: 1 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.xl },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  mapContainer: { marginHorizontal: spacing.lg, height: 220, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.xl, borderWidth: 1, position: 'relative' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'flex-end', padding: spacing.lg },
  expandBtn: { width: 44, height: 44, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center' },

  reportsList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  reportRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  reportThumb: { width: 80, height: 80, borderRadius: radius.sm },
  reportThumbEmpty: { justifyContent: 'center', alignItems: 'center' },
  reportBody: { flex: 1, minWidth: 0 },
  reportChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  reportStreet: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  reportSub: { fontSize: fontSize.xs, marginTop: spacing.xxs },

  empty: { marginHorizontal: spacing.lg, alignItems: 'center', padding: spacing.xxl, borderRadius: radius.lg, gap: spacing.sm },
  emptyTitle: { fontWeight: fontWeight.semibold, fontSize: fontSize.md },
  emptySub: { fontSize: fontSize.sm, textAlign: 'center', lineHeight: fontSize.sm * lineHeight.normal },

  rankingSection: { marginBottom: spacing.xl },
  rankingScroll: { paddingHorizontal: spacing.lg, gap: spacing.md },
  rankingMessage: { marginHorizontal: spacing.lg, padding: spacing.lg },
  rankingCard: { width: 120, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, position: 'relative' },
  rankBadge: { position: 'absolute', top: spacing.xs, left: spacing.xs },
  rankText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  rankingName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: spacing.sm, marginBottom: spacing.xs, textAlign: 'center' },
  reportCountBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  reportCountText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },

  modalHeader: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  closeBtn: { width: 40, height: 40, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center' },
  mapSearchContainer: { position: 'absolute', top: spacing.lg, left: spacing.xl, right: spacing.xl, zIndex: 10 },
  mapSearchBox: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: radius.md, paddingHorizontal: spacing.lg, borderWidth: 1 },
  mapSearchInput: { flex: 1, marginLeft: spacing.md, fontSize: fontSize.sm, height: '100%' },
  mapFiltersContainer: { position: 'absolute', bottom: spacing.xl, left: 0, right: 0, zIndex: 10 },
  mapFiltersScroll: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: radius.pill, paddingHorizontal: spacing.lg, borderWidth: 1 },
  filterDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  filterLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
});