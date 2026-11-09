// mobile/src/screens/DropOffScreen.web.tsx
// "Onde descartar" Web Desktop: filtro por material à esquerda, grid de pontos de coleta e cadastro em diálogo centralizado.
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDropOff } from '../context/DropOffContext';
import { useTheme } from '../context/ThemeContext';
import { LeafletMap } from '../components/LeafletMap';
import {
  DesktopCard, DesktopColumns, DesktopContainer, DesktopPageHeader, ResponsiveGrid,
  responsiveScreen, type WebPressableState,
} from '../components/web/DesktopContainer';
import type { DropOffPoint, NewDropOffPoint } from '../types';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, materials, onAccentColor, radius,
  severityColors, shadows, spacing, tint,
} from '../theme/designSystem';

const { DropOffScreen: MobileDropOffScreen } = require('./DropOffScreen.tsx') as typeof import('./DropOffScreen');

/* ---------- Card ---------- */
function PointCard({ point, highlight }: { point: DropOffPoint; highlight: string | null }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }, shadows.sm]}>
      <View style={styles.cardHeader}>
        <View style={[styles.pinIcon, { backgroundColor: theme.colors.primary + tint.subtle }]}>
          <Feather name="map-pin" size={iconSize.md} color={theme.colors.primary} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>{point.name}</Text>
          <Text style={[styles.cardAddress, { color: theme.colors.textSecondary }]} numberOfLines={2}>{point.address}</Text>
        </View>
      </View>
      {point.accepted_materials.length > 0 && (
        <View style={styles.chipsRow}>
          {point.accepted_materials.map((mat) => {
            const active = mat === highlight;
            return (
              <View
                key={mat}
                style={[styles.chip, active
                  ? { backgroundColor: theme.colors.primary + tint.soft, borderColor: theme.colors.primary }
                  : { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}
              >
                <Text style={[styles.chipText, { color: active ? theme.colors.primary : theme.colors.textSecondary }]}>{mat}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ---------- Diálogo de cadastro ---------- */
function FormDialog({ visible, onClose, onSubmit }: {
  visible: boolean; onClose: () => void; onSubmit: (data: NewDropOffPoint) => Promise<void>;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setName(''); setAddress(''); setSelected([]); setError(''); };
  const close = () => { reset(); onClose(); };

  const toggleMaterial = (mat: string) =>
    setSelected((prev) => (prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]));

  // Alert.alert não funciona no navegador: os erros aparecem dentro do diálogo
  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) { setError('Preencha nome e endereço.'); return; }
    if (selected.length === 0) { setError('Selecione ao menos um material.'); return; }
    try {
      setSubmitting(true);
      await onSubmit({ name, address, accepted_materials: selected });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.textPrimary }];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={[styles.backdrop, { backgroundColor: theme.colors.background + tint.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={[styles.dialog, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }, shadows.md]}>
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, { color: theme.colors.textPrimary }]}>Novo ponto de coleta</Text>
            <Pressable onPress={close} accessibilityLabel="Fechar" style={styles.closeBtn}>
              <Feather name="x" size={iconSize.md} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nome do local</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Ex: Ecoponto Centro" placeholderTextColor={theme.colors.textMuted} style={inputStyle} />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Endereço</Text>
            <TextInput value={address} onChangeText={setAddress} placeholder="Rua, número, bairro" placeholderTextColor={theme.colors.textMuted} style={inputStyle} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Materiais aceitos</Text>
            <View style={styles.chipsRow}>
              {materials.map((mat) => {
                const active = selected.includes(mat);
                return (
                  <Pressable
                    key={mat}
                    onPress={() => toggleMaterial(mat)}
                    style={[styles.chip, {
                      backgroundColor: active ? theme.colors.primary + tint.soft : theme.colors.surface2,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    }]}
                  >
                    <Text style={[styles.chipText, { color: active ? theme.colors.primary : theme.colors.textSecondary }]}>{mat}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: severityColors.Alta + tint.subtle, borderColor: severityColors.Alta + tint.strong }]}>
              <Feather name="alert-circle" size={iconSize.sm} color={severityColors.Alta} />
              <Text style={[styles.errorText, { color: severityColors.Alta }]}>{error}</Text>
            </View>
          )}

          <View style={styles.dialogActions}>
            <Pressable onPress={close} style={[styles.ghostBtn, { borderColor: theme.colors.border }]}>
              <Text style={[styles.ghostText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ hovered }: WebPressableState) => [styles.primaryBtn, styles.flex1, { backgroundColor: theme.colors.primary }, (hovered || submitting) && styles.hovered]}
            >
              {submitting ? <ActivityIndicator color={onAccentColor} /> : <Text style={styles.primaryText}>Cadastrar ponto</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Tela desktop ---------- */
function DropOffDesktop() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { points, loading, error, add } = useDropOff();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [material, setMaterial] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const materialCounts = useMemo(() => {
    const map: Record<string, number> = {};
    points.forEach((p) => p.accepted_materials.forEach((m) => { map[m] = (map[m] ?? 0) + 1; }));
    return map;
  }, [points]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return points
      .filter((p) => (material ? p.accepted_materials.includes(material) : true))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
  }, [points, query, material]);

  const side = (
    <DesktopCard title="Filtrar por material">
      <View style={styles.filterList}>
        {[null, ...materials].map((mat) => {
          const active = material === mat;
          const label = mat ?? 'Todos os materiais';
          const count = mat ? materialCounts[mat] ?? 0 : points.length;
          return (
            <Pressable
              key={label}
              onPress={() => setMaterial(mat)}
              style={({ hovered }: WebPressableState) => [
                styles.filterItem,
                hovered && { backgroundColor: theme.colors.surface2 },
                active && { backgroundColor: theme.colors.primary + tint.soft },
              ]}
            >
              <Text style={[styles.filterLabel, { color: active ? theme.colors.primary : theme.colors.textSecondary }]} numberOfLines={1}>{label}</Text>
              <Text style={[styles.filterCount, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{count}</Text>
            </Pressable>
          );
        })}
      </View>
    </DesktopCard>
  );

  let main: React.ReactNode;
  if (loading) {
    main = <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;
  } else if (error) {
    main = <DesktopCard><Text style={{ color: severityColors.Alta }}>{error}</Text></DesktopCard>;
  } else if (filtered.length === 0) {
    main = (
      <DesktopCard style={styles.emptyCard}>
        <Feather name="trash-2" size={iconSize.xl} color={theme.colors.textMuted} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {points.length === 0
            ? 'Nenhum ponto cadastrado ainda. Seja o primeiro a contribuir!'
            : 'Nenhum ponto encontrado para este filtro.'}
        </Text>
      </DesktopCard>
    );
  } else if (viewMode === 'map') {
    const markers = filtered
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        id: p.id,
        lat: p.latitude as number,
        lng: p.longitude as number,
        color: theme.colors.primary,
        title: p.name,
        description: p.address,
      }));
    const withoutCoords = filtered.length - markers.length;
    main = (
      <DesktopCard style={styles.mapCard}>
        <View style={[styles.mapBox, { borderColor: theme.colors.border }]}>
          <LeafletMap markers={markers} interactive />
        </View>
        {withoutCoords > 0 && (
          <Text style={[styles.mapNote, { color: theme.colors.textMuted }]}>
            {withoutCoords} ponto{withoutCoords === 1 ? '' : 's'} sem localização cadastrada não aparece{withoutCoords === 1 ? '' : 'm'} no mapa. Veja na Lista.
          </Text>
        )}
      </DesktopCard>
    );
  } else {
    main = (
      <ResponsiveGrid
        data={filtered}
        minItemWidth={layout.sidePanelWidth - spacing.xxxl}
        maxColumns={3}
        keyExtractor={(p) => p.id}
        renderItem={(p) => <PointCard point={p} highlight={material} />}
      />
    );
  }

  return (
    <>
      <DesktopContainer>
        <DesktopPageHeader
          left={navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Voltar" style={[styles.backBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
              <Feather name="arrow-left" size={iconSize.sm} color={theme.colors.textPrimary} />
            </Pressable>
          ) : undefined}
          title="Onde descartar"
          subtitle={`${points.length} ponto${points.length === 1 ? '' : 's'} de coleta cadastrado${points.length === 1 ? '' : 's'}`}
          right={(
            <View style={styles.headerActions}>
              <View style={[styles.toggle, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                {([
                  { key: 'list', label: 'Lista', icon: 'list' },
                  { key: 'map', label: 'Mapa', icon: 'map' },
                ] as const).map((opt) => {
                  const active = viewMode === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setViewMode(opt.key)}
                      style={({ hovered }: WebPressableState) => [
                        styles.toggleBtn,
                        hovered && !active && { backgroundColor: theme.colors.surface2 },
                        active && { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Feather name={opt.icon} size={iconSize.sm} color={active ? onAccentColor : theme.colors.textSecondary} />
                      <Text style={[styles.toggleText, { color: active ? onAccentColor : theme.colors.textSecondary }]}>{opt.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={[styles.search, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                <Feather name="search" size={iconSize.sm} color={theme.colors.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Buscar por nome ou endereço..."
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                />
              </View>
              <Pressable
                onPress={() => setModalOpen(true)}
                style={({ hovered }: WebPressableState) => [styles.primaryBtn, { backgroundColor: theme.colors.primary }, hovered && styles.hovered]}
              >
                <Feather name="plus" size={iconSize.sm} color={onAccentColor} />
                <Text style={styles.primaryText}>Novo ponto</Text>
              </Pressable>
            </View>
          )}
        />
        <DesktopColumns main={main} side={side} sideWidth={layout.sidebarWidth + spacing.xl} sidePosition="left" />
      </DesktopContainer>
      <FormDialog visible={modalOpen} onClose={() => setModalOpen(false)} onSubmit={add} />
    </>
  );
}

export const DropOffScreen = responsiveScreen(DropOffDesktop, MobileDropOffScreen);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  hovered: { opacity: 0.9 },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },

  backBtn: {
    width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.pill,
    borderWidth: layout.borderWidth, alignItems: 'center', justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggle: { flexDirection: 'row', padding: spacing.xxs, borderRadius: radius.sm, borderWidth: layout.borderWidth },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    height: layout.controlHeight - spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.xs,
  },
  toggleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  mapCard: { padding: spacing.md, gap: spacing.md },
  mapBox: { height: layout.heroImageHeight + layout.cardImageHeight, borderRadius: radius.md, overflow: 'hidden', borderWidth: layout.borderWidth },
  mapNote: { fontSize: fontSize.xs, textAlign: 'center' },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: layout.sidePanelWidth,
    height: layout.controlHeight, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: layout.borderWidth,
  },
  searchInput: { flex: 1, height: '100%', fontSize: fontSize.sm },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: layout.controlHeight, paddingHorizontal: spacing.lg, borderRadius: radius.sm,
  },
  primaryText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  filterList: { gap: spacing.xxs },
  filterItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    height: layout.controlHeight, paddingHorizontal: spacing.md, borderRadius: radius.sm,
  },
  filterLabel: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  filterCount: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  card: { height: '100%', borderRadius: radius.lg, padding: spacing.lg, borderWidth: layout.borderWidth },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardHeaderText: { flex: 1 },
  pinIcon: { width: iconSize.xl + spacing.xs, height: iconSize.xl + spacing.xs, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, lineHeight: fontSize.md * lineHeight.tight },
  cardAddress: { fontSize: fontSize.sm, marginTop: spacing.xs },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: layout.borderWidth },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },

  emptyCard: { alignItems: 'center' },
  emptyText: { fontSize: fontSize.md, textAlign: 'center', lineHeight: fontSize.md * lineHeight.normal },

  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  dialog: {
    width: '100%', maxWidth: layout.maxFormWidth, borderRadius: radius.lg, borderWidth: layout.borderWidth,
    padding: spacing.xl, gap: spacing.lg,
  },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dialogTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  closeBtn: { padding: spacing.xs },
  field: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  input: {
    height: layout.controlHeight, borderRadius: radius.sm, borderWidth: layout.borderWidth,
    paddingHorizontal: spacing.md, fontSize: fontSize.sm,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radius.sm, borderWidth: layout.borderWidth, padding: spacing.md,
  },
  errorText: { flex: 1, fontSize: fontSize.sm },
  dialogActions: { flexDirection: 'row', gap: spacing.sm },
  ghostBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    height: layout.controlHeight, borderRadius: radius.sm, borderWidth: layout.borderWidth,
  },
  ghostText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
