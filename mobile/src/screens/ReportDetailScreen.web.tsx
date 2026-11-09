// mobile/src/screens/ReportDetailScreen.web.tsx
// Detalhe Web Desktop: galeria + descrição + comentários à esquerda; informações e ações (admin/dono) à direita.
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { BeamButton } from '../components/BeamButton';
import { LeafletMap } from '../components/LeafletMap';
import { ModernAlert } from '../components/ModernAlert';
import { UserAvatar } from '../components/UserAvatar';
import {
  DesktopBadge, DesktopCard, DesktopColumns, DesktopContainer, DesktopPageHeader,
  getSeverityColor, getStatusColor, responsiveScreen, type WebPressableState,
} from '../components/web/DesktopContainer';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, onAccentColor, radius, severityColors, spacing,
} from '../theme/designSystem';

const { ReportDetailScreen: MobileReportDetailScreen } = require('./ReportDetailScreen.tsx') as typeof import('./ReportDetailScreen');

type FeatherName = keyof typeof Feather.glyphMap;

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  profiles?: { name?: string; avatar?: string } | null;
}

/* ---------- Linha de informação ---------- */
function InfoRow({ icon, label, value }: { icon: FeatherName; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={iconSize.sm} color={theme.colors.textMuted} />
      <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

/* ---------- Tela desktop ---------- */
function ReportDetailDesktop() {
  const route = useRoute();
  const navigation = useNavigation();
  const { reportId } = route.params as { reportId: string };

  const { user } = useAuth();
  const { reports, voteReport, updateReportStatus, deleteReport } = useReports();
  const { theme } = useTheme();

  const [isAdmin, setIsAdmin] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  // O report vem do contexto (atualizado em tempo real), como na versão mobile
  const report = reports.find((r) => r.id === reportId);
  const isOwner = !!user && !!report && report.user_id === user.id;

  const showAlert = (title: string, message: string) => setAlertConfig({ visible: true, title, message });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => setIsAdmin(data?.role === 'admin'));
  }, [user]);

  useEffect(() => {
    if (!user || !reportId) return;
    supabase.from('votes').select('*').eq('user_id', user.id).eq('report_id', reportId).maybeSingle()
      .then(({ data }) => setHasVoted(!!data));
  }, [user, reportId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles (name, avatar)')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
    if (data) setComments(data as CommentRow[]);
  };

  useEffect(() => { loadComments(); }, [reportId]);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleVote = async () => {
    if (!user) return;
    await voteReport(reportId);
    setHasVoted(!hasVoted);
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    setSubmittingComment(true);
    const { error } = await supabase.from('comments').insert({
      report_id: reportId,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (!error) {
      setNewComment('');
      await loadComments();
    } else {
      showAlert('Erro', 'Não foi possível enviar o comentário');
    }
    setSubmittingComment(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!updateReportStatus) return;
    setUpdating(true);
    try {
      await updateReportStatus(reportId, newStatus);
      showAlert('Sucesso', `Status alterado para ${newStatus}`);
    } catch {
      showAlert('Erro', 'Não foi possível atualizar o status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReport) return;
    setUpdating(true);
    try {
      await deleteReport(reportId);
      setConfirmDelete(false);
      goBack();
    } catch {
      showAlert('Erro', 'Não foi possível deletar o report');
    } finally {
      setUpdating(false);
    }
  };

  if (!report) {
    return (
      <DesktopContainer maxWidth={layout.maxFormWidth} contentStyle={styles.centerWrap}>
        <DesktopCard style={styles.center}>
          <Feather name="alert-circle" size={iconSize.xxl} color={theme.colors.textMuted} />
          <Text style={[styles.notFound, { color: theme.colors.textPrimary }]}>Report não encontrado</Text>
          <BeamButton title="Voltar" iconLeft="arrow-left" onPress={goBack} />
        </DesktopCard>
      </DesktopContainer>
    );
  }

  const images: string[] = report.images ?? [];
  const sevColor = getSeverityColor(report.severity);
  const statusColor = getStatusColor(report.status, theme);
  const hasCoords = !!report.latitude && !!report.longitude;

  const ADMIN_ACTIONS: { status: string; label: string; icon: FeatherName; color: string }[] = [
    { status: 'Aprovado',  label: 'Aprovar',  icon: 'check',        color: severityColors.Baixa },
    { status: 'Rejeitado', label: 'Rejeitar', icon: 'x',            color: severityColors.Alta },
    { status: 'Resolvido', label: 'Resolver', icon: 'check-circle', color: theme.colors.indigo },
  ];

  /* ----- Coluna principal ----- */
  const main = (
    <>
      {images.length > 0 && (
        <DesktopCard style={styles.galleryCard}>
          <Image source={{ uri: images[Math.min(activeImage, images.length - 1)] }} style={styles.heroImage} />
          {images.length > 1 && (
            <View style={styles.thumbRow}>
              {images.map((img, i) => (
                <Pressable
                  key={img}
                  onPress={() => setActiveImage(i)}
                  style={[styles.thumbWrap, { borderColor: i === activeImage ? theme.colors.primary : theme.colors.border }]}
                >
                  <Image source={{ uri: img }} style={styles.thumb} />
                </Pressable>
              ))}
            </View>
          )}
        </DesktopCard>
      )}

      <DesktopCard title="Descrição">
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{report.description}</Text>
      </DesktopCard>

      <DesktopCard title={`Comentários (${comments.length})`}>
        {comments.length === 0 ? (
          <Text style={[styles.muted, { color: theme.colors.textMuted }]}>Nenhum comentário ainda. Seja o primeiro!</Text>
        ) : comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <UserAvatar
              user={{ name: c.profiles?.name || 'Usuário', avatar: c.profiles?.avatar || 'default', isCustomAvatar: !!c.profiles?.avatar && c.profiles.avatar !== 'default' && c.profiles.avatar.startsWith('http') }}
              size={iconSize.xl}
            />
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: theme.colors.textPrimary }]}>{c.profiles?.name || 'Usuário'}</Text>
                <Text style={[styles.commentDate, { color: theme.colors.textMuted }]}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</Text>
              </View>
              <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>{c.content}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.commentInputRow, { borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.commentInput, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
            placeholder="Escreva um comentário..."
            placeholderTextColor={theme.colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleAddComment}
          />
          <Pressable
            onPress={handleAddComment}
            disabled={submittingComment || !newComment.trim()}
            style={[styles.sendBtn, { backgroundColor: theme.colors.primary }, (!newComment.trim()) && styles.disabled]}
          >
            {submittingComment
              ? <ActivityIndicator size="small" color={onAccentColor} />
              : <Feather name="send" size={iconSize.sm} color={onAccentColor} />}
            <Text style={styles.sendText}>Comentar</Text>
          </Pressable>
        </View>
      </DesktopCard>
    </>
  );

  /* ----- Painel lateral ----- */
  const side = (
    <>
      <DesktopCard title="Informações">
        <InfoRow icon="map-pin" label="Local" value={`${report.street}${report.neighborhood ? `, ${report.neighborhood}` : ''}`} />
        <InfoRow icon="user" label="Autor" value={report.userName || 'Anônimo'} />
        <InfoRow icon="calendar" label="Data" value={new Date(report.createdAt).toLocaleDateString('pt-BR')} />
        <Pressable
          onPress={handleVote}
          style={({ hovered }: WebPressableState) => [
            styles.voteBtn,
            { borderColor: hasVoted ? theme.colors.primary : theme.colors.border },
            hovered && { backgroundColor: theme.colors.surface2 },
          ]}
        >
          <Feather name="thumbs-up" size={iconSize.sm} color={hasVoted ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.voteText, { color: hasVoted ? theme.colors.primary : theme.colors.textSecondary }]}>
            {hasVoted ? 'Você apoiou' : 'Apoiar'} · {report.votes || 0} votos
          </Text>
        </Pressable>
      </DesktopCard>

      {hasCoords && (
        <DesktopCard title="Localização" style={styles.mapCard}>
          <View style={[styles.mapBox, { borderColor: theme.colors.border }]}>
            <LeafletMap
              center={{ lat: report.latitude, lng: report.longitude }}
              zoom={15}
              markers={[{ id: report.id, lat: report.latitude, lng: report.longitude, color: sevColor }]}
              interactive={false}
            />
          </View>
        </DesktopCard>
      )}

      {isAdmin && (
        <DesktopCard title="Moderação">
          {ADMIN_ACTIONS.map((a) => (
            <Pressable
              key={a.status}
              onPress={() => handleUpdateStatus(a.status)}
              disabled={updating || report.status === a.status}
              style={({ hovered }: WebPressableState) => [
                styles.actionBtn,
                { backgroundColor: a.color },
                (hovered && !updating) && styles.hovered,
                report.status === a.status && styles.disabled,
              ]}
            >
              <Feather name={a.icon} size={iconSize.sm} color={onAccentColor} />
              <Text style={styles.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </DesktopCard>
      )}

      {(isOwner || isAdmin) && (
        <DesktopCard title={isOwner ? 'Suas ações' : 'Ações'}>
          {confirmDelete ? (
            <>
              <Text style={[styles.muted, { color: theme.colors.textSecondary }]}>
                {isOwner && !isAdmin
                  ? 'Tem certeza que deseja deletar seu report? Esta ação não pode ser desfeita.'
                  : 'Tem certeza que deseja deletar este report? (Admin)'}
              </Text>
              <View style={styles.confirmRow}>
                <Pressable onPress={() => setConfirmDelete(false)} style={[styles.ghostBtn, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.ghostText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={handleDelete} disabled={updating} style={[styles.actionBtn, styles.flex1, { backgroundColor: severityColors.Alta }]}>
                  {updating ? <ActivityIndicator size="small" color={onAccentColor} /> : <Feather name="trash-2" size={iconSize.sm} color={onAccentColor} />}
                  <Text style={styles.actionText}>Deletar</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Pressable onPress={() => setConfirmDelete(true)} style={[styles.actionBtn, { backgroundColor: severityColors.Alta }]}>
              <Feather name="trash-2" size={iconSize.sm} color={onAccentColor} />
              <Text style={styles.actionText}>Deletar {isOwner ? 'meu report' : 'report'}</Text>
            </Pressable>
          )}
          {isOwner && !isAdmin && (
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>* Apenas administradores podem aprovar ou resolver reports.</Text>
          )}
        </DesktopCard>
      )}
    </>
  );

  return (
    <>
      <DesktopContainer>
        <DesktopPageHeader
          left={navigation.canGoBack() ? (
            <Pressable onPress={goBack} accessibilityLabel="Voltar" style={[styles.backBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
              <Feather name="arrow-left" size={iconSize.sm} color={theme.colors.textPrimary} />
            </Pressable>
          ) : undefined}
          eyebrow="Detalhes da ocorrência"
          title={report.street}
          subtitle={report.neighborhood || undefined}
          right={(
            <View style={styles.badges}>
              <DesktopBadge label={report.severity} color={sevColor} />
              <DesktopBadge label={report.status} color={statusColor} solid />
            </View>
          )}
        />
        <DesktopColumns main={main} side={side} />
      </DesktopContainer>
      <ModernAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </>
  );
}

export const ReportDetailScreen = responsiveScreen(ReportDetailDesktop, MobileReportDetailScreen);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  hovered: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
  muted: { fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal },

  centerWrap: { flex: 1, justifyContent: 'center' },
  center: { alignItems: 'center' },
  notFound: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },

  backBtn: {
    width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.pill,
    borderWidth: layout.borderWidth, alignItems: 'center', justifyContent: 'center',
  },
  badges: { flexDirection: 'row', gap: spacing.sm },

  galleryCard: { padding: spacing.md, gap: spacing.md },
  heroImage: { width: '100%', height: layout.heroImageHeight, borderRadius: radius.md },
  thumbRow: { flexDirection: 'row', gap: spacing.sm },
  thumbWrap: { borderRadius: radius.sm, borderWidth: spacing.xxs, overflow: 'hidden' },
  thumb: { width: layout.thumbnailSize, height: layout.thumbnailSize },

  description: { fontSize: fontSize.md, lineHeight: fontSize.md * lineHeight.relaxed },

  comment: { flexDirection: 'row', gap: spacing.md },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentAuthor: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  commentDate: { fontSize: fontSize.xs },
  commentText: { fontSize: fontSize.sm, marginTop: spacing.xxs, lineHeight: fontSize.sm * lineHeight.normal },
  commentInputRow: { flexDirection: 'row', gap: spacing.sm, borderTopWidth: layout.borderWidth, paddingTop: spacing.lg },
  commentInput: {
    flex: 1, height: layout.controlHeight, borderRadius: radius.sm, borderWidth: layout.borderWidth,
    paddingHorizontal: spacing.md, fontSize: fontSize.sm,
  },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    height: layout.controlHeight, paddingHorizontal: spacing.lg, borderRadius: radius.sm,
  },
  sendText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  infoLabel: { width: layout.controlHeight + spacing.md, fontSize: fontSize.sm },
  infoValue: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  voteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: layout.controlHeight, borderRadius: radius.sm, borderWidth: layout.borderWidth,
  },
  voteText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  mapCard: { gap: spacing.md },
  mapBox: { height: layout.cardImageHeight, borderRadius: radius.md, overflow: 'hidden', borderWidth: layout.borderWidth },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: layout.controlHeight, borderRadius: radius.sm,
  },
  actionText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  confirmRow: { flexDirection: 'row', gap: spacing.sm },
  ghostBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    height: layout.controlHeight, borderRadius: radius.sm, borderWidth: layout.borderWidth,
  },
  ghostText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  note: { fontSize: fontSize.xs, textAlign: 'center' },
});
