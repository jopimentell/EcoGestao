import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { MaterialChip } from '../components/Chip';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDropOff } from '../context/DropOffContext';
import { useTheme } from '../context/ThemeContext';
import { LeafletMap } from '../components/LeafletMap';
import type { DropOffPoint, NewDropOffPoint } from '../types';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, materials, onAccentColor, radius,
  severityColors, shadows, spacing,
} from '../theme/designSystem';

// Zoom do mapa após o usuário marcar o local no cadastro
const PICKED_ZOOM = 16;

/* ---------- Card ---------- */
const PointCard: React.FC<{ point: DropOffPoint; onPress: () => void }> = ({ point, onPress }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${point.name}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border },
        shadows.sm,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.pinIcon, { backgroundColor: theme.colors.primary + '18' }]}>
          <Icon name="map-pin" size={iconSize.md} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{point.name}</Text>
          <Text style={[styles.cardAddress, { color: theme.colors.textSecondary }]}>{point.address}</Text>
        </View>
        <Icon name="chevron-right" size={iconSize.md} color={theme.colors.textMuted} />
      </View>
      {point.accepted_materials.length > 0 && (
        <View style={styles.chipsRow}>
          {point.accepted_materials.map((mat) => (
            <MaterialChip key={mat} material={mat} />
          ))}
        </View>
      )}
    </Pressable>
  );
};

/* ---------- Modal ---------- */
interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: NewDropOffPoint) => Promise<void>;
}

const FormModal: React.FC<FormModalProps> = ({ visible, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { setName(''); setAddress(''); setSelected([]); setLocation(null); };

  const toggleMaterial = (mat: string) =>
    setSelected((prev) => (prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]));

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) return Alert.alert('Preencha nome e endereço');
    if (selected.length === 0) return Alert.alert('Selecione ao menos um material');
    if (!location) return Alert.alert('Toque no mapa para marcar o local');
    try {
      setSubmitting(true);
      await onSubmit({ name, address, accepted_materials: selected, latitude: location.lat, longitude: location.lng });
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível cadastrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface1 }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.modalHandle, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Novo ponto de coleta</Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nome do local</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Ecoponto Centro"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Endereço</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Rua, número, bairro"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Materiais aceitos</Text>
          <View style={styles.chipsRow}>
            {materials.map((mat) => {
              const active = selected.includes(mat);
              return (
                <Pressable
                  key={mat}
                  onPress={() => toggleMaterial(mat)}
                  style={[styles.chip, {
                    backgroundColor: active ? theme.colors.primary + '20' : theme.colors.surface2,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  }]}
                >
                  <Text style={[styles.chipText, {
                    color: active ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: active ? fontWeight.semibold : fontWeight.medium,
                  }]}>
                    {mat}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Localização</Text>
          <View style={[styles.pickerBox, { borderColor: location ? theme.colors.primary : theme.colors.border }]}>
            <LeafletMap
              center={location ?? undefined}
              zoom={location ? PICKED_ZOOM : undefined}
              markers={location ? [{ id: 'novo-ponto', lat: location.lat, lng: location.lng, color: theme.colors.primary }] : []}
              onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
              interactive
            />
          </View>
          <Text style={[styles.pickerHint, { color: location ? theme.colors.primary : theme.colors.textMuted }]}>
            {location ? 'Local marcado. Toque de novo para ajustar.' : 'Toque no mapa para marcar o local do ponto.'}
          </Text>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [styles.submitBtn, { backgroundColor: theme.colors.primary }, (pressed || submitting) && { opacity: 0.85 }]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Cadastrar ponto</Text>
            )}
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.colors.textMuted }]}>Cancelar</Text>
          </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* ---------- Tela ---------- */
export const DropOffScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme();
  const { points, loading, error, add } = useDropOff();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const openPoint = (pointId: string) => navigation.navigate('DropOffDetail', { pointId });

  const markers = points
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      id: p.id,
      lat: p.latitude as number,
      lng: p.longitude as number,
      color: theme.colors.primary,
      title: p.name,
      description: p.address,
    }));
  const withoutCoords = points.length - markers.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
          <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Onde descartar</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {points.length} ponto{points.length === 1 ? '' : 's'} cadastrado{points.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      {/* Toggle Lista / Mapa */}
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
              style={[styles.toggleBtn, active && { backgroundColor: theme.colors.primary }]}
            >
              <Icon name={opt.icon} size={iconSize.sm} color={active ? onAccentColor : theme.colors.textSecondary} />
              <Text style={[styles.toggleText, { color: active ? onAccentColor : theme.colors.textSecondary }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={{ color: severityColors.Alta }}>{error}</Text></View>
      ) : viewMode === 'map' ? (
        <View style={styles.mapWrap}>
          <View style={[styles.mapBox, { borderColor: theme.colors.border }]}>
            <LeafletMap markers={markers} interactive onMarkerPress={openPoint} />
          </View>
          {withoutCoords > 0 && (
            <Text style={[styles.mapNote, { color: theme.colors.textMuted }]}>
              {withoutCoords} ponto{withoutCoords === 1 ? '' : 's'} sem localização no mapa (veja na Lista).
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={points}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PointCard point={item} onPress={() => openPoint(item.id)} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl * 2 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Nenhum ponto cadastrado ainda.{'\n'}Seja o primeiro a contribuir!
              </Text>
            </View>
          }
        />
      )}

      {/* FAB: novo ponto de coleta */}
      <Pressable
        onPress={() => setModalOpen(true)}
        accessibilityLabel="Cadastrar novo ponto de coleta"
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary }, pressed && { opacity: 0.85 }]}
      >
        <Icon name="plus" size={iconSize.md} color={onAccentColor} />
        <Text style={styles.fabText}>Novo ponto</Text>
      </Pressable>

      <FormModal visible={modalOpen} onClose={() => setModalOpen(false)} onSubmit={add} />
    </SafeAreaView>
  );
};

/* ---------- Estilos ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, gap: spacing.md,
  },
  backBtn: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, lineHeight: fontSize.xxl * lineHeight.tight },
  subtitle: { fontSize: fontSize.sm, marginTop: spacing.xxs },
  // FAB estendido e centralizado para não se confundir com o "+" (Reportar) da tab bar
  fab: {
    position: 'absolute', bottom: spacing.xl, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: iconSize.xxl, paddingHorizontal: spacing.xl, borderRadius: radius.pill, ...shadows.md,
  },
  fabText: { color: onAccentColor, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  toggle: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    padding: spacing.xxs, borderRadius: radius.pill, borderWidth: layout.borderWidth,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, borderRadius: radius.pill,
  },
  toggleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  // paddingBottom reserva espaço para o FAB não cobrir o mapa e o aviso
  mapWrap: { flex: 1, padding: spacing.lg, paddingBottom: iconSize.xxl + spacing.xl * 2, gap: spacing.sm },
  mapBox: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', borderWidth: layout.borderWidth },
  mapNote: { fontSize: fontSize.xs, textAlign: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  emptyText: { fontSize: fontSize.md, textAlign: 'center', lineHeight: fontSize.md * lineHeight.normal },

  card: { borderRadius: radius.lg, padding: spacing.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  pinIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: fontSize.lg * lineHeight.tight },
  cardAddress: { fontSize: fontSize.sm, marginTop: spacing.xxs },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs + 2, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: fontSize.xs },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(35,35,35,0.55)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '92%', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  pickerBox: { height: layout.cardImageHeight, borderRadius: radius.md, overflow: 'hidden', borderWidth: layout.borderWidth },
  pickerHint: { fontSize: fontSize.xs, marginTop: spacing.xs },
  modalHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: radius.pill, marginBottom: spacing.md },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: fontSize.md, borderWidth: 1 },
  submitBtn: { marginTop: spacing.xl, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  cancelBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center' },
  cancelText: { fontSize: fontSize.sm },
});