// mobile/src/screens/ReportScreen.web.tsx
// Registro de ocorrência Web Desktop: as 3 etapas ficam visíveis em uma única página
// (localização e detalhes na coluna principal, revisão/envio no painel lateral).
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { BeamButton } from '../components/BeamButton';
import { LeafletMap } from '../components/LeafletMap';
import { ModernAlert } from '../components/ModernAlert';
import {
  DesktopCard, DesktopColumns, DesktopContainer, DesktopPageHeader, responsiveScreen, type WebPressableState,
} from '../components/web/DesktopContainer';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, onAccentColor, radius, severityColors, spacing, tint,
  type Severity,
} from '../theme/designSystem';

const { ReportScreen: MobileReportScreen } = require('./ReportScreen.tsx') as typeof import('./ReportScreen');

type FeatherName = keyof typeof Feather.glyphMap;

const MAX_PHOTOS = 3;
const DEFAULT_CENTER = { lat: -4.8622, lng: -43.3561 }; // Caxias-MA (mesmo centro do LeafletMap)

const SEVERITIES: { label: Severity; icon: FeatherName }[] = [
  { label: 'Baixa',   icon: 'circle' },
  { label: 'Média',   icon: 'circle' },
  { label: 'Alta',    icon: 'circle' },
  { label: 'Crítica', icon: 'alert-triangle' },
];

/* ---------- Input ---------- */
function LabelInput({ label, placeholder, value, onChangeText, multiline = false }: {
  label: string; placeholder: string; value: string; onChangeText: (t: string) => void; multiline?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.textPrimary },
          multiline && styles.inputMulti,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

/* ---------- Título de etapa ---------- */
function StepTitle({ n, title, done }: { n: number; title: string; done: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.stepTitleRow}>
      <View style={[
        styles.stepDot,
        done
          ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
          : { backgroundColor: theme.colors.primary + tint.soft, borderColor: theme.colors.primary },
      ]}>
        {done
          ? <Feather name="check" size={iconSize.sm} color={onAccentColor} />
          : <Text style={[styles.stepDotText, { color: theme.colors.primary }]}>{n}</Text>}
      </View>
      <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

/* ---------- Item do checklist ---------- */
function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.checkRow}>
      <Feather name={ok ? 'check-circle' : 'circle'} size={iconSize.sm} color={ok ? severityColors.Baixa : theme.colors.textMuted} />
      <Text style={[styles.checkText, { color: ok ? theme.colors.textPrimary : theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

/* ---------- Tela desktop ---------- */
function ReportDesktop() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const { addReport } = useReports();
  const { theme } = useTheme();

  const [street, setStreet] = useState('');
  const [neighborhood, setNhood] = useState('');
  const [description, setDesc] = useState('');
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => setAlertConfig({ visible: true, title, message });

  // No navegador, o seletor abre o explorador de arquivos (câmera não está disponível)
  const pickPhoto = async () => {
    if (images.length >= MAX_PHOTOS) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - images.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri).filter(Boolean);
      setImages((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS));
    }
  };

  const getMyLocation = async () => {
    setLoadingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Erro de Permissão', 'A permissão de localização foi negada. Verifique as configurações do navegador.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      showAlert('Localização indisponível', 'Não foi possível obter sua localização. Marque o ponto no mapa.');
    } finally {
      setLoadingLoc(false);
    }
  };

  const locationDone = !!street.trim() && !!neighborhood.trim();
  const detailsDone = !!severity && !!description.trim() && images.length > 0;

  const reset = () => {
    setStreet(''); setNhood(''); setDesc(''); setSeverity(null);
    setImages([]); setLocation(null); setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!locationDone) { showAlert('Campos obrigatórios', 'Preencha a rua e o bairro para continuar.'); return; }
    if (!severity || images.length === 0 || !description.trim()) {
      showAlert('Campos Obrigatórios', 'Por favor, adicione pelo menos uma foto, uma descrição e selecione a gravidade para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      await addReport({
        street,
        neighborhood,
        description,
        severity,
        latitude: location?.lat,
        longitude: location?.lng,
      }, images);
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao enviar report:', error);
      showAlert('Erro ao enviar', 'Não foi possível enviar seu report. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <DesktopContainer maxWidth={layout.maxFormWidth} contentStyle={styles.successWrap}>
        <DesktopCard style={styles.successCard}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.primary + tint.soft, borderColor: theme.colors.primary + tint.strong }]}>
            <Feather name="map-pin" size={iconSize.xl} color={theme.colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>Reporte enviado!</Text>
          <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
            Seu relato foi enviado para moderação e logo aparecerá no mapa de Caxias. Obrigado pela contribuição!
          </Text>
          <View style={styles.successActions}>
            <BeamButton title="Novo reporte" isPrimary iconLeft="plus" onPress={reset} style={styles.flex1} />
            <BeamButton title="Ver comunidade" iconRight="arrow-right" onPress={() => { reset(); navigation.navigate('Comunidade'); }} style={styles.flex1} />
          </View>
        </DesktopCard>
      </DesktopContainer>
    );
  }

  /* ----- Coluna principal: etapas 1 e 2 ----- */
  const main = (
    <>
      <DesktopCard>
        <StepTitle n={1} title="Onde está a ocorrência?" done={locationDone} />
        <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>Clique no mapa para marcar o local ou use a sua localização atual.</Text>
        <View style={[styles.mapBox, { borderColor: theme.colors.border }]}>
          <LeafletMap
            center={location || DEFAULT_CENTER}
            markers={location ? [{ id: 'current', lat: location.lat, lng: location.lng, color: theme.colors.primary }] : []}
            onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
          />
          <Pressable
            onPress={getMyLocation}
            disabled={loadingLoc}
            style={({ hovered }: WebPressableState) => [styles.gpsBtn, { backgroundColor: theme.colors.primary }, hovered && styles.hovered]}
          >
            {loadingLoc
              ? <ActivityIndicator size="small" color={onAccentColor} />
              : <Feather name="target" size={iconSize.sm} color={onAccentColor} />}
            <Text style={styles.gpsText}>Usar minha localização</Text>
          </Pressable>
        </View>
        {location && (
          <Text style={[styles.coords, { color: theme.colors.textMuted }]}>
            Ponto marcado: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </Text>
        )}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <LabelInput label="Rua / Avenida *" placeholder="Ex: Av. Getúlio Vargas" value={street} onChangeText={setStreet} />
          </View>
          <View style={styles.flex1}>
            <LabelInput label="Bairro *" placeholder="Ex: Centro" value={neighborhood} onChangeText={setNhood} />
          </View>
        </View>
      </DesktopCard>

      <DesktopCard>
        <StepTitle n={2} title="Detalhe o problema" done={detailsDone} />

        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Gravidade *</Text>
        <View style={styles.severityRow}>
          {SEVERITIES.map((s) => {
            const color = severityColors[s.label];
            const active = severity === s.label;
            return (
              <Pressable
                key={s.label}
                onPress={() => setSeverity(s.label)}
                style={({ hovered }: WebPressableState) => [
                  styles.severityOption,
                  { borderColor: active || hovered ? color : theme.colors.border },
                  active && { backgroundColor: color + tint.subtle },
                ]}
              >
                <Feather name={s.icon} size={iconSize.sm} color={active ? color : theme.colors.textMuted} />
                <Text style={[styles.severityText, { color: active ? color : theme.colors.textSecondary }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <LabelInput label="Descrição *" placeholder="Descreva o problema (tipo de resíduo, riscos, há quanto tempo está no local...)" value={description} onChangeText={setDesc} multiline />

        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Fotos * ({images.length}/{MAX_PHOTOS})</Text>
        <View style={styles.photoRow}>
          {images.map((uri, i) => (
            <View key={uri} style={styles.photoWrapper}>
              <Image source={{ uri }} style={styles.photo} />
              <Pressable
                onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                style={[styles.photoRemove, { backgroundColor: severityColors.Alta, borderColor: theme.colors.surface1 }]}
                accessibilityLabel="Remover foto"
              >
                <Feather name="x" size={iconSize.sm} color={onAccentColor} />
              </Pressable>
            </View>
          ))}
          {images.length < MAX_PHOTOS && (
            <Pressable
              onPress={pickPhoto}
              style={({ hovered }: WebPressableState) => [
                styles.photoSlot,
                { backgroundColor: theme.colors.surface2, borderColor: hovered ? theme.colors.primary : theme.colors.border },
              ]}
            >
              <Feather name="upload" size={iconSize.md} color={theme.colors.textMuted} />
              <Text style={[styles.photoSlotText, { color: theme.colors.textMuted }]}>Adicionar</Text>
            </Pressable>
          )}
        </View>
      </DesktopCard>
    </>
  );

  /* ----- Painel lateral: etapa 3 ----- */
  const side = (
    <>
      <DesktopCard>
        <StepTitle n={3} title="Revisar e enviar" done={false} />
        <View style={styles.checklist}>
          <CheckItem ok={!!location} label="Ponto marcado no mapa" />
          <CheckItem ok={locationDone} label="Rua e bairro informados" />
          <CheckItem ok={!!severity} label="Gravidade selecionada" />
          <CheckItem ok={!!description.trim()} label="Descrição preenchida" />
          <CheckItem ok={images.length > 0} label="Pelo menos uma foto" />
        </View>
        <BeamButton
          title={submitting ? 'Enviando...' : 'Enviar reporte'}
          isPrimary
          iconRight={submitting ? undefined : 'send'}
          onPress={handleSubmit}
          style={!(locationDone && detailsDone) ? styles.disabled : undefined}
        />
        {submitting && <ActivityIndicator color={theme.colors.primary} />}
      </DesktopCard>

      <DesktopCard title="Dicas">
        {[
          'Fotografe o resíduo de forma que o local seja reconhecível.',
          'Evite expor rostos, placas de veículos ou dados de terceiros.',
          'Os reportes passam por moderação antes de ficarem públicos.',
        ].map((tip) => (
          <View key={tip} style={styles.tipRow}>
            <Feather name="info" size={iconSize.sm} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{tip}</Text>
          </View>
        ))}
      </DesktopCard>
    </>
  );

  return (
    <>
      <DesktopContainer>
        <DesktopPageHeader title="Reportar ocorrência" subtitle="Ajude a manter Caxias limpa: registre um ponto de descarte irregular." />
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

export const ReportScreen = responsiveScreen(ReportDesktop, MobileReportScreen);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.lg },
  hovered: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
  helper: { fontSize: fontSize.sm, marginTop: -spacing.sm },

  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepDot: {
    width: iconSize.lg, height: iconSize.lg, borderRadius: radius.pill, borderWidth: layout.borderWidth,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  stepTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },

  inputWrapper: { gap: spacing.xs },
  inputLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    height: layout.controlHeight, borderRadius: radius.sm, borderWidth: layout.borderWidth,
    paddingHorizontal: spacing.md, fontSize: fontSize.sm,
  },
  inputMulti: { height: layout.textAreaHeight, paddingVertical: spacing.md },

  mapBox: { height: layout.mapPickerHeight, borderRadius: radius.md, overflow: 'hidden', borderWidth: layout.borderWidth },
  gpsBtn: {
    position: 'absolute', right: spacing.md, bottom: spacing.xxl,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    height: layout.controlHeight, paddingHorizontal: spacing.lg, borderRadius: radius.pill,
  },
  gpsText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  coords: { fontSize: fontSize.xs, marginTop: -spacing.sm },

  severityRow: { flexDirection: 'row', gap: spacing.sm, marginTop: -spacing.sm },
  severityOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: layout.controlHeight, borderRadius: radius.sm, borderWidth: layout.borderWidth,
  },
  severityText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: -spacing.sm },
  photoWrapper: { position: 'relative' },
  photo: { width: layout.thumbnailSize, height: layout.thumbnailSize, borderRadius: radius.sm },
  photoRemove: {
    position: 'absolute', top: -spacing.sm, right: -spacing.sm,
    width: iconSize.md, height: iconSize.md, borderRadius: radius.pill, borderWidth: spacing.xxs,
    alignItems: 'center', justifyContent: 'center',
  },
  photoSlot: {
    width: layout.thumbnailSize, height: layout.thumbnailSize, borderRadius: radius.sm,
    borderWidth: layout.borderWidth, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
  },
  photoSlotText: { fontSize: fontSize.xs },

  checklist: { gap: spacing.md },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkText: { fontSize: fontSize.sm },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  tipText: { flex: 1, fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal },

  successWrap: { flex: 1, justifyContent: 'center' },
  successCard: { alignItems: 'center', padding: spacing.xxxl },
  successIcon: {
    width: layout.avatarLg, height: layout.avatarLg, borderRadius: radius.pill, borderWidth: layout.borderWidth,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  successSub: { fontSize: fontSize.sm, textAlign: 'center', lineHeight: fontSize.sm * lineHeight.relaxed },
  successActions: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch', marginTop: spacing.sm },
});
