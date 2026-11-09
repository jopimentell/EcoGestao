// mobile/src/components/TopContributors.tsx
// Ranking de colaboradores (reportes aprovados) via RPC get_top_contributors.
// Compartilhado entre Home (top 3) e Jornada de níveis (top 10), mobile e web.
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { UserAvatar } from './UserAvatar';
import {
  fontSize, fontWeight, getLevelVisual, iconSize, radius, severityColors, spacing, tint,
} from '../theme/designSystem';

export interface TopContributor {
  userId: string;
  name: string;
  avatar: string;
  isCustomAvatar: boolean;
  approvedReports: number;
  position: number;
}

interface TopContributorRow {
  user_id: string;
  name: string;
  avatar: string;
  approved_reports: number | string;
  rank_position: number | string;
}

// Ouro, prata e bronze
export const MEDAL_COLORS = [getLevelVisual(5).color, getLevelVisual(1).color, severityColors['Média']];

// Avatares padrão são nomes de cor ('orange', 'sky'...); avatares personalizados são URIs de imagem
const isImageAvatar = (avatar: string): boolean => /^(https?:|file:|data:|blob:)/.test(avatar);

const toContributor = (row: TopContributorRow): TopContributor => ({
  userId: row.user_id,
  name: row.name,
  avatar: row.avatar,
  isCustomAvatar: isImageAvatar(row.avatar),
  approvedReports: Number(row.approved_reports),
  position: Number(row.rank_position),
});

/* ---------- Dados ---------- */
export function useTopContributors(limit: number) {
  const [items, setItems] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: rpcError } = await supabase.rpc('get_top_contributors', { p_limit: limit });
    if (rpcError) {
      console.warn('Falha ao carregar ranking', rpcError);
      setError('Não foi possível carregar o ranking.');
    } else {
      setItems(((data ?? []) as TopContributorRow[]).map(toContributor));
    }
    setLoading(false);
  }, [limit]);

  // Recarrega sempre que a tela volta ao foco (ex.: após uma aprovação)
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return { items, loading, error, reload: load };
}

/* ---------- Posição (medalha no top 3) ---------- */
export function RankPosition({ position }: { position: number }) {
  const { theme } = useTheme();
  const medal = MEDAL_COLORS[position - 1];
  return (
    <View style={styles.position}>
      {medal
        ? <Feather name="award" size={iconSize.sm} color={medal} />
        : <Text style={[styles.positionText, { color: theme.colors.textMuted }]}>#{position}</Text>}
    </View>
  );
}

/* ---------- Lista vertical ---------- */
interface TopContributorsListProps {
  items: TopContributor[];
  loading: boolean;
  error: string | null;
  currentUserId?: string;
}

export function TopContributorsList({ items, loading, error, currentUserId }: TopContributorsListProps) {
  const { theme } = useTheme();

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;
  }
  if (error) {
    return <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{error}</Text>;
  }
  if (items.length === 0) {
    return (
      <Text style={[styles.message, { color: theme.colors.textMuted }]}>
        Ainda não há colaboradores com reportes aprovados.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const isMe = item.userId === currentUserId;
        return (
          <View
            key={item.userId}
            style={[styles.row, isMe && { backgroundColor: theme.colors.primary + tint.subtle }]}
          >
            <RankPosition position={item.position} />
            <UserAvatar
              user={{ name: item.name, avatar: item.avatar, isCustomAvatar: item.isCustomAvatar }}
              size={iconSize.xl}
            />
            <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {item.name}{isMe ? ' (você)' : ''}
            </Text>
            <View style={[styles.countPill, { backgroundColor: theme.colors.primary + tint.subtle }]}>
              <Text style={[styles.countText, { color: theme.colors.primary }]}>{item.approvedReports}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  message: { fontSize: fontSize.sm, textAlign: 'center', paddingVertical: spacing.sm },
  list: { gap: spacing.xs },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.md,
  },
  position: { width: iconSize.md, alignItems: 'center' },
  positionText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  name: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  countPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.pill },
  countText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
});
