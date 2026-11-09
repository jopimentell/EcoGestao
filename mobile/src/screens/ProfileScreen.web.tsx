// mobile/src/screens/ProfileScreen.web.tsx
// Perfil Web Desktop: coluna lateral com identidade/estatísticas/menu e área principal com conquistas e reportes.
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import {
  DesktopBadge, DesktopCard, DesktopColumns, DesktopContainer, DesktopPageHeader, ResponsiveGrid,
  getSeverityColor, getStatusColor, responsiveScreen, type WebPressableState,
} from '../components/web/DesktopContainer';
import { getRelativeTime } from '../utils/date';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, radius, severityColors, spacing, tint,
} from '../theme/designSystem';

const { ProfileScreen: MobileProfileScreen } = require('./ProfileScreen.tsx') as typeof import('./ProfileScreen');

type FeatherName = keyof typeof Feather.glyphMap;

// Mesmas faixas de nível da versão mobile
const getLevelInfo = (reportCount: number) => {
  if (reportCount >= 50) return { name: 'Herói da Cidade', nextLevel: 50, progressPercent: 100 };
  if (reportCount >= 25) return { name: 'Fiscal Urbano', nextLevel: 50, progressPercent: (reportCount / 50) * 100 };
  if (reportCount >= 10) return { name: 'Guardião de Ruas', nextLevel: 25, progressPercent: (reportCount / 25) * 100 };
  if (reportCount >= 3) return { name: 'Observador', nextLevel: 10, progressPercent: (reportCount / 10) * 100 };
  return { name: 'Novato', nextLevel: 3, progressPercent: (reportCount / 3) * 100 };
};

const ACHIEVEMENTS: { id: string; icon: FeatherName; label: string; hint: string }[] = [
  { id: '1', icon: 'target', label: 'Primeiro Reporte', hint: 'Envie seu primeiro reporte' },
  { id: '2', icon: 'hash',   label: '10 Reportes',      hint: 'Envie 10 reportes' },
  { id: '3', icon: 'star',   label: '5 Resolvidos',     hint: 'Tenha 5 reportes resolvidos' },
  { id: '4', icon: 'map',    label: 'Mapeou o Bairro',  hint: 'Envie 5 reportes' },
  { id: '5', icon: 'zap',    label: '50 Reportes',      hint: 'Envie 50 reportes' },
  { id: '6', icon: 'award',  label: 'Top Contribuidor', hint: 'Fique em 1º no ranking' },
];

function ProfileDesktop() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, logout } = useAuth();
  const { reports } = useReports();
  const { theme } = useTheme();

  const data = useMemo(() => {
    if (!user) return null;
    const userReports = reports.filter((r) => r.user_id === user.id);
    const userReportsCount = userReports.length;
    const resolvedCount = userReports.filter((r) => r.status === 'Resolvido').length;

    const acc: Record<string, { userId: string; count: number }> = {};
    reports.forEach((r) => {
      if (!acc[r.user_id]) acc[r.user_id] = { userId: r.user_id, count: 0 };
      acc[r.user_id].count++;
    });
    const ranking = Object.values(acc).sort((a, b) => b.count - a.count);
    const idx = ranking.findIndex((r) => r.userId === user.id);
    const userRank: number | string = idx === -1 ? (ranking.length > 0 ? ranking.length + 1 : '--') : idx + 1;

    const done: Record<string, boolean> = {
      '1': userReportsCount >= 1,
      '2': userReportsCount >= 10,
      '3': resolvedCount >= 5,
      '4': userReportsCount >= 5,
      '5': userReportsCount >= 50,
      '6': userRank === 1,
    };

    return {
      userReports, userReportsCount, resolvedCount, userRank,
      achievements: ACHIEVEMENTS.map((a) => ({ ...a, done: done[a.id] })),
      levelInfo: getLevelInfo(userReportsCount),
    };
  }, [reports, user]);

  if (!user || !data) return null;

  const { userReports, userReportsCount, resolvedCount, userRank, achievements, levelInfo } = data;
  const unlocked = achievements.filter((a) => a.done).length;

  const MENU_ITEMS: { icon: FeatherName; label: string; sub: string; danger?: boolean; onPress?: () => void }[] = [
    { icon: 'bell', label: 'Notificações', sub: 'Novidades dos seus reportes' },
    { icon: 'shield', label: 'Privacidade', sub: 'Gerencie seus dados' },
    { icon: 'message-circle', label: 'Feedback', sub: 'Nos ajude a melhorar' },
    { icon: 'help-circle', label: 'Ajuda e Suporte', sub: 'Dúvidas frequentes' },
    { icon: 'log-out', label: 'Sair', sub: 'Encerrar sessão', danger: true, onPress: logout },
  ];

  const STATS = [
    { label: 'Reportes', value: String(userReportsCount) },
    { label: 'Resolvidos', value: String(resolvedCount) },
    { label: 'Ranking', value: `#${userRank}` },
  ];

  /* ----- Coluna lateral ----- */
  const side = (
    <>
      <DesktopCard style={styles.identity}>
        <UserAvatar user={user} size={layout.avatarLg} />
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{user.name}</Text>
        <Text style={[styles.handle, { color: theme.colors.textMuted }]}>{user.handle || user.email}</Text>
        <View style={[styles.levelPill, { backgroundColor: theme.colors.primary + tint.soft, borderColor: theme.colors.primary + tint.strong }]}>
          <Feather name="star" size={iconSize.sm} color={theme.colors.primary} />
          <Text style={[styles.levelPillText, { color: theme.colors.primary }]}>{levelInfo.name}</Text>
        </View>
        <Text style={[styles.joined, { color: theme.colors.textMuted }]}>Membro desde {user.joinedAt}</Text>

        <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </DesktopCard>

      <DesktopCard title="Próximo nível">
        <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
          <View style={[styles.fill, { backgroundColor: theme.colors.primary, width: `${Math.min(100, levelInfo.progressPercent)}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>{userReportsCount} / {levelInfo.nextLevel} reportes</Text>
          <Text style={[styles.progressLabel, { color: theme.colors.primary }]}>{Math.round(levelInfo.progressPercent)}%</Text>
        </View>
      </DesktopCard>

      <DesktopCard style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ hovered }: WebPressableState) => [
              styles.menuRow,
              i < MENU_ITEMS.length - 1 && { borderBottomWidth: layout.borderWidth, borderBottomColor: theme.colors.border },
              hovered && { backgroundColor: theme.colors.surface2 },
            ]}
          >
            <Feather name={item.icon} size={iconSize.sm} color={item.danger ? severityColors.Alta : theme.colors.primary} />
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: item.danger ? severityColors.Alta : theme.colors.textPrimary }]}>{item.label}</Text>
              <Text style={[styles.menuSub, { color: theme.colors.textMuted }]}>{item.sub}</Text>
            </View>
            <Feather name="chevron-right" size={iconSize.sm} color={theme.colors.textMuted} />
          </Pressable>
        ))}
      </DesktopCard>
    </>
  );

  /* ----- Área principal ----- */
  const main = (
    <>
      <DesktopCard title="Conquistas" right={<Text style={[styles.muted, { color: theme.colors.textMuted }]}>{unlocked} de {achievements.length} desbloqueadas</Text>}>
        <ResponsiveGrid
          data={achievements}
          minItemWidth={layout.cardImageHeight}
          maxColumns={3}
          gap={spacing.md}
          keyExtractor={(a) => a.id}
          renderItem={(a) => (
            <View style={[
              styles.achiev,
              a.done
                ? { backgroundColor: theme.colors.primary + tint.subtle, borderColor: theme.colors.primary + tint.medium }
                : { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
            ]}>
              <View style={[styles.achievIcon, { backgroundColor: a.done ? theme.colors.primary + tint.soft : theme.colors.surface3 }]}>
                <Feather name={a.done ? a.icon : 'lock'} size={iconSize.md} color={a.done ? theme.colors.primary : theme.colors.textMuted} />
              </View>
              <View style={styles.achievText}>
                <Text style={[styles.achievLabel, { color: a.done ? theme.colors.textPrimary : theme.colors.textSecondary }]}>{a.label}</Text>
                <Text style={[styles.achievHint, { color: theme.colors.textMuted }]}>{a.done ? 'Desbloqueada' : a.hint}</Text>
              </View>
            </View>
          )}
        />
      </DesktopCard>

      <DesktopCard title={`Seus reportes (${userReportsCount})`}>
        {userReports.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="file-text" size={iconSize.xl} color={theme.colors.textMuted} />
            <Text style={[styles.muted, { color: theme.colors.textSecondary }]}>Você ainda não enviou nenhum reporte.</Text>
          </View>
        ) : (
          <View>
            {userReports.map((r, i) => (
              <Pressable
                key={r.id}
                onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
                style={({ hovered }: WebPressableState) => [
                  styles.historyRow,
                  i < userReports.length - 1 && { borderBottomWidth: layout.borderWidth, borderBottomColor: theme.colors.border },
                  hovered && { backgroundColor: theme.colors.surface2 },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: getSeverityColor(r.severity) }]} />
                <View style={styles.historyText}>
                  <Text style={[styles.historyStreet, { color: theme.colors.textPrimary }]} numberOfLines={1}>{r.street}</Text>
                  <Text style={[styles.historyTime, { color: theme.colors.textMuted }]}>
                    {r.neighborhood || 'Bairro não informado'} · {getRelativeTime(r.createdAt)}
                  </Text>
                </View>
                <DesktopBadge label={r.status} color={getStatusColor(r.status, theme)} />
                <Feather name="chevron-right" size={iconSize.sm} color={theme.colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
      </DesktopCard>
    </>
  );

  return (
    <DesktopContainer>
      <DesktopPageHeader title="Meu perfil" subtitle="Sua contribuição, conquistas e histórico de reportes." />
      <DesktopColumns main={main} side={side} sidePosition="left" />
    </DesktopContainer>
  );
}

export const ProfileScreen = responsiveScreen(ProfileDesktop, MobileProfileScreen);

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.sm },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, textAlign: 'center', marginTop: spacing.sm },
  handle: { fontSize: fontSize.sm },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: layout.borderWidth,
  },
  levelPillText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  joined: { fontSize: fontSize.xs },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch', borderTopWidth: layout.borderWidth, paddingTop: spacing.lg, marginTop: spacing.sm },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  statLabel: { fontSize: fontSize.xs, marginTop: spacing.xxs },

  track: { height: spacing.sm, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },

  menuCard: { padding: spacing.sm, gap: spacing.none },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.xs },
  menuText: { flex: 1 },
  menuLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  menuSub: { fontSize: fontSize.xs, marginTop: spacing.xxs },

  muted: { fontSize: fontSize.sm },
  achiev: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md, borderWidth: layout.borderWidth,
  },
  achievIcon: { width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  achievText: { flex: 1 },
  achievLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  achievHint: { fontSize: fontSize.xs, marginTop: spacing.xxs, lineHeight: fontSize.xs * lineHeight.normal },

  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.xs },
  dot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.pill },
  historyText: { flex: 1, minWidth: 0 },
  historyStreet: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  historyTime: { fontSize: fontSize.xs, marginTop: spacing.xxs },
});
