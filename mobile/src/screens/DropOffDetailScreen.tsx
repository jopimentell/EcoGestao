// mobile/src/screens/DropOffDetailScreen.tsx
// Detalhe de um ponto de coleta ("Onde descartar"). Usado no app e na web (conteúdo centralizado no desktop).
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDropOff } from '../context/DropOffContext';
import { useTheme } from '../context/ThemeContext';
import { LeafletMap } from '../components/LeafletMap';
import { getRelativeTime } from '../utils/date';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, onAccentColor, radius, shadows, spacing, tint,
} from '../theme/designSystem';

type RouteParams = { pointId: string };

const MAP_ZOOM = 16;

const buildDirectionsUrl = (address: string, lat: number | null, lng: number | null): string => {
  const destination = lat != null && lng != null ? `${lat},${lng}` : `${address}, Caxias - MA`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
};

export const DropOffDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pointId } = (route.params ?? {}) as Partial<RouteParams>;
  const { theme } = useTheme();
  const { points, loading } = useDropOff();

  const point = points.find((p) => p.id === pointId);
  const hasCoords = point?.latitude != null && point?.longitude != null;

  const backButton = (
    <Pressable
      onPress={() => navigation.goBack()}
      accessibilityLabel="Voltar"
      style={[styles.backBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
    >
      <Feather name="arrow-left" size={iconSize.sm} color={theme.colors.textPrimary} />
    </Pressable>
  );

  if (!point) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.headerRow}>{backButton}</View>
        <View style={styles.center}>
          <Feather name="map-pin" size={iconSize.xl} color={theme.colors.textMuted} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {loading ? 'Carregando ponto de coleta...' : 'Ponto de coleta não encontrado.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const openDirections = () => {
    Linking.openURL(buildDirectionsUrl(point.address, point.latitude, point.longitude));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.safe} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.headerRow}>
            {backButton}
            <Text style={[styles.eyebrow, { color: theme.colors.textSecondary }]}>Onde descartar</Text>
          </View>

          {/* Mapa */}
          {hasCoords ? (
            <View style={[styles.mapBox, { borderColor: theme.colors.border }]}>
              <LeafletMap
                center={{ lat: point.latitude as number, lng: point.longitude as number }}
                zoom={MAP_ZOOM}
                markers={[{
                  id: point.id,
                  lat: point.latitude as number,
                  lng: point.longitude as number,
                  color: theme.colors.primary,
                  title: point.name,
                  description: point.address,
                }]}
                interactive
              />
            </View>
          ) : (
            <View style={[styles.noMap, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
              <Feather name="map" size={iconSize.md} color={theme.colors.textMuted} />
              <Text style={[styles.noMapText, { color: theme.colors.textMuted }]}>
                Este ponto ainda não tem localização no mapa.
              </Text>
            </View>
          )}

          {/* Informações principais */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }, shadows.sm]}>
            <View style={styles.titleRow}>
              <View style={[styles.pinIcon, { backgroundColor: theme.colors.primary + tint.subtle }]}>
                <Feather name="map-pin" size={iconSize.md} color={theme.colors.primary} />
              </View>
              <View style={styles.titleText}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{point.name}</Text>
                <Text style={[styles.address, { color: theme.colors.textSecondary }]}>{point.address}</Text>
              </View>
            </View>

            <Pressable
              onPress={openDirections}
              style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.colors.primary }, pressed && styles.pressed]}
            >
              <Feather name="navigation" size={iconSize.sm} color={onAccentColor} />
              <Text style={styles.primaryText}>Como chegar</Text>
            </Pressable>
          </View>

          {/* Materiais aceitos */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }, shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Materiais aceitos</Text>
            {point.accepted_materials.length > 0 ? (
              <View style={styles.chipsRow}>
                {point.accepted_materials.map((mat) => (
                  <View
                    key={mat}
                    style={[styles.chip, { backgroundColor: theme.colors.primary + tint.soft, borderColor: theme.colors.primary + tint.strong }]}
                  >
                    <Feather name="check" size={fontSize.sm}color={theme.colors.primary} />
                    <Text style={[styles.chipText, { color: theme.colors.primary }]}>{mat}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.muted, { color: theme.colors.textMuted }]}>Nenhum material informado.</Text>
            )}
          </View>

          <Text style={[styles.footnote, { color: theme.colors.textMuted }]}>
            Cadastrado {getRelativeTime(point.created_at)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxxl },
  inner: { width: '100%', maxWidth: layout.maxFormWidth + layout.sidePanelWidth, alignSelf: 'center', gap: spacing.lg },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: {
    width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.pill,
    borderWidth: layout.borderWidth, alignItems: 'center', justifyContent: 'center',
  },
  eyebrow: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  mapBox: { height: layout.mapPreviewHeight, borderRadius: radius.lg, overflow: 'hidden', borderWidth: layout.borderWidth },
  noMap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.lg, borderRadius: radius.lg, borderWidth: layout.borderWidth,
  },
  noMapText: { flex: 1, fontSize: fontSize.sm },

  card: { borderRadius: radius.lg, borderWidth: layout.borderWidth, padding: spacing.lg, gap: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  pinIcon: {
    width: iconSize.xl + spacing.xs, height: iconSize.xl + spacing.xs, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  titleText: { flex: 1 },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, lineHeight: fontSize.xl * lineHeight.tight },
  address: { fontSize: fontSize.md, marginTop: spacing.xs, lineHeight: fontSize.md * lineHeight.normal },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: layout.controlHeight, borderRadius: radius.md,
  },
  primaryText: { color: onAccentColor, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  pressed: { opacity: 0.85 },

  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xxs,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: layout.borderWidth,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  muted: { fontSize: fontSize.sm },
  footnote: { fontSize: fontSize.xs, textAlign: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxl },
  emptyText: { fontSize: fontSize.md, textAlign: 'center' },
});
