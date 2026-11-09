// mobile/src/screens/FeedScreen.web.tsx
// Comunidade Web Desktop: grid de ocorrências + painel lateral com filtros de status e busca.
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { Icon, type IconName } from '../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import {
  DesktopBadge, DesktopCard, DesktopColumns, DesktopContainer, DesktopPageHeader, ResponsiveGrid,
  getSeverityColor, getStatusColor, responsiveScreen, type WebPressableState,
} from '../components/web/DesktopContainer';
import { getRelativeTime } from '../utils/date';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, radius, spacing, tint,
} from '../theme/designSystem';

const { FeedScreen: MobileFeedScreen } = require('./FeedScreen.tsx') as typeof import('./FeedScreen');

type FilterType = 'Todos' | 'Novos' | 'Em análise' | 'Resolvidos';

const FILTERS: { key: FilterType; status: string | null; icon: IconName }[] = [
  { key: 'Todos',      status: null,         icon: 'layers' },
  { key: 'Novos',      status: 'Novo',       icon: 'inbox' },
  { key: 'Em análise', status: 'Em análise', icon: 'clock' },
  { key: 'Resolvidos', status: 'Resolvido',  icon: 'check-circle' },
];

type FeedItem = ReturnType<typeof useReports>['reports'][number];

/* ---------- Card ---------- */
function FeedCard({ item, onVote, onOpen }: { item: FeedItem; onVote: () => void; onOpen: () => void }) {
  const { theme } = useTheme();
  const [voted, setVoted] = useState(false);
  const sevColor = getSeverityColor(item.severity);
  const cover = item.images?.[0];
  const userAvatar = item.userAvatar || 'default';

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: 'transparent' }]}>

      <View style={styles.cardHeader}>
        <UserAvatar user={{ name: item.userName || 'Usuário', avatar: userAvatar, isCustomAvatar: userAvatar !== 'default' }} size={iconSize.xl} />
        <View style={styles.cardHeaderText}>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.userName || 'Usuário'}</Text>
          <Text style={[styles.userTime, { color: theme.colors.textMuted }]} numberOfLines={1}>{getRelativeTime(item.createdAt)}</Text>
        </View>
        <DesktopBadge label={item.status} color={getStatusColor(item.status, theme)} />
      </View>

      <Pressable onPress={onOpen} style={styles.cardBody}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} />
        ) : null}
        <View style={styles.addressRow}>
          <Icon name="map-pin" size={iconSize.sm} color={theme.colors.primary} />
          <Text style={[styles.street, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {item.street}{item.neighborhood ? ` · ${item.neighborhood}` : ''}
          </Text>
        </View>
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={3}>{item.description}</Text>
        <DesktopBadge label={item.severity} color={sevColor} />
      </Pressable>

      <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
        <Pressable
          onPress={() => { if (!voted) { setVoted(true); onVote(); } }}
          style={[
            styles.voteBtn,
            { borderColor: voted ? theme.colors.primary : theme.colors.border },
            voted && { backgroundColor: theme.colors.primary + tint.soft },
          ]}
        >
          <Icon name="chevron-up" size={iconSize.sm} color={voted ? theme.colors.primary : theme.colors.textMuted} />
          <Text style={[styles.actionText, { color: voted ? theme.colors.primary : theme.colors.textMuted }]}>{item.votes}</Text>
        </Pressable>
        <View style={styles.commentInfo}>
          <Icon name="message-square" size={iconSize.sm} color={theme.colors.textMuted} />
          <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>{item.comments || 0}</Text>
        </View>
        <Pressable onPress={onOpen} style={styles.detailsBtn}>
          <Text style={[styles.detailsText, { color: theme.colors.primary }]}>Ver detalhes</Text>
          <Icon name="arrow-right" size={iconSize.sm} color={theme.colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Tela desktop ---------- */
function FeedDesktop() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { reports, voteReport } = useReports();
  const { theme } = useTheme();
  const [activeFilter, setFilter] = useState<FilterType>('Todos');
  const [query, setQuery] = useState('');

  // Mesmo mapeamento de parâmetros da versão mobile (filtros vindos da Home)
  useEffect(() => {
    const params = route.params as { filter?: string } | undefined;
    if (!params?.filter) return;
    if (params.filter === 'analyzing') setFilter('Em análise');
    else if (params.filter === 'resolved') setFilter('Resolvidos');
    else setFilter('Todos');
  }, [route.params]);

  const counts = useMemo(() => {
    const map: Record<FilterType, number> = { Todos: reports.length, Novos: 0, 'Em análise': 0, Resolvidos: 0 };
    FILTERS.forEach((f) => { if (f.status) map[f.key] = reports.filter((r) => r.status === f.status).length; });
    return map;
  }, [reports]);

  const filtered = useMemo(() => {
    const status = FILTERS.find((f) => f.key === activeFilter)?.status;
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => (status ? r.status === status : true))
      .filter((r) => !q
        || r.street.toLowerCase().includes(q)
        || r.neighborhood?.toLowerCase().includes(q)
        || r.description?.toLowerCase().includes(q));
  }, [reports, activeFilter, query]);

  const side = (
    <>
      <DesktopCard title="Filtrar por status">
        <View style={styles.filterList}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={({ hovered }: WebPressableState) => [
                  styles.filterItem,
                  hovered && { backgroundColor: theme.colors.surface2 },
                  active && { backgroundColor: theme.colors.primary + tint.soft },
                ]}
              >
                <Icon name={f.icon} size={iconSize.sm} color={active ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.filterLabel, { color: active ? theme.colors.primary : theme.colors.textSecondary }]}>{f.key}</Text>
                <Text style={[styles.filterCount, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{counts[f.key]}</Text>
              </Pressable>
            );
          })}
        </View>
      </DesktopCard>

      <DesktopCard title="Como funciona">
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          Cada ocorrência passa por moderação antes de ser publicada. Vote nas ocorrências que você também
          identificou para ajudar a priorizar as mais urgentes.
        </Text>
      </DesktopCard>
    </>
  );

  const main = filtered.length === 0 ? (
    <DesktopCard style={styles.emptyCard}>
      <Icon name="message-square" size={iconSize.xl} color={theme.colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Nenhuma ocorrência encontrada</Text>
      <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
        {query ? 'Tente outro termo de busca.' : 'Ninguém postou nada nesta categoria ainda.'}
      </Text>
    </DesktopCard>
  ) : (
    <ResponsiveGrid
      data={filtered}
      minItemWidth={layout.sidePanelWidth - spacing.xl}
      maxColumns={3}
      keyExtractor={(r) => r.id}
      renderItem={(r) => (
        <FeedCard
          item={r}
          onVote={() => voteReport(r.id)}
          onOpen={() => navigation.navigate('ReportDetail', { reportId: r.id })}
        />
      )}
    />
  );

  return (
    <DesktopContainer>
      <DesktopPageHeader
        title="Comunidade"
        subtitle={`${filtered.length} ocorrência${filtered.length !== 1 ? 's' : ''} · filtro: ${activeFilter.toLowerCase()}`}
        right={(
          <View style={[styles.search, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <Icon name="search" size={iconSize.sm} color={theme.colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar rua, bairro ou descrição..."
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            />
          </View>
        )}
      />
      <DesktopColumns main={main} side={side} sideWidth={layout.sidebarWidth + spacing.xl} sidePosition="left" />
    </DesktopContainer>
  );
}

export const FeedScreen = responsiveScreen(FeedDesktop, MobileFeedScreen);

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: layout.sidePanelWidth,
    height: layout.controlHeight, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: layout.borderWidth,
  },
  searchInput: { flex: 1, height: '100%', fontSize: fontSize.sm },

  filterList: { gap: spacing.xxs },
  filterItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    height: layout.controlHeight, paddingHorizontal: spacing.md, borderRadius: radius.sm,
  },
  filterLabel: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  filterCount: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  infoText: { fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.relaxed },

  card: { borderRadius: radius.md, borderWidth: layout.borderWidth, overflow: 'hidden', height: '100%' },
  stripe: { height: spacing.xs },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.md },
  cardHeaderText: { flex: 1, minWidth: 0 },
  userName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  userTime: { fontSize: fontSize.xs, marginTop: spacing.xxs },

  cardBody: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  cover: { width: '100%', height: layout.cardImageHeight, borderRadius: radius.sm },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  street: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  desc: { fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal },

  actions: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    borderTopWidth: layout.borderWidth, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  voteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: layout.borderWidth,
  },
  commentInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginLeft: 'auto' },
  detailsText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  emptyCard: { alignItems: 'center' },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  emptySub: { fontSize: fontSize.sm, textAlign: 'center' },
});
