// mobile/src/screens/auth/RegisterScreen.web.tsx
// Cadastro Web Desktop: mesmo painel institucional do Login + formulário em 2 etapas (máx. 480px).
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Typography';
import { Icon } from '../../components/Icon';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BeamButton } from '../../components/BeamButton';
import { responsiveScreen } from '../../components/web/DesktopContainer';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { AuthHeroPanel, FormError, WebField } from './LoginScreen.web';
import {
  avatarColors, fontSize, fontWeight, iconSize, layout, onAccentColor, onPastelColor, radius, spacing,
} from '../../theme/designSystem';

const { RegisterScreen: MobileRegisterScreen } = require('./RegisterScreen.tsx') as typeof import('./RegisterScreen');

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

// Mesmas chaves de avatar usadas no mobile e no UserAvatar
const AVATARS = [
  { key: 'orange',  bg: avatarColors.orange },
  { key: 'indigo',  bg: avatarColors.indigo },
  { key: 'emerald', bg: avatarColors.emerald },
  { key: 'rose',    bg: avatarColors.rose },
  { key: 'sky',     bg: avatarColors.sky },
  { key: 'violet',  bg: avatarColors.violet },
] as const;

function RegisterDesktop({ navigation }: Props) {
  const { register } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [avatar, setAvatar] = useState<string>('orange');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      setIsCustom(true);
    }
  };

  const goNext = () => {
    if (!name || !email || password.length < 6 || password !== confirm) {
      setError(password !== confirm ? 'As senhas não coincidem.' : 'Verifique os campos acima.');
      return;
    }
    setError('');
    setStep(1);
  };

  const handleRegister = async () => {
    if (password !== confirm) { setError('As senhas não coincidem'); return; }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return; }
    setLoading(true);
    const err = await register(name, email, password, avatar, isCustom);
    setLoading(false);
    if (err) { setError(err); setStep(0); }
  };

  const initials = name.trim().split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'CX';
  const solidBg = AVATARS.find((a) => a.key === avatar)?.bg ?? AVATARS[0].bg;

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <AuthHeroPanel />

      <View style={styles.formSide}>
        <View style={styles.form}>
          <Pressable onPress={() => (step === 1 ? setStep(0) : navigation.goBack())} style={styles.backBtn}>
            <Icon name="arrow-left" size={iconSize.sm} color={theme.colors.primary} />
            <Text style={[styles.backText, { color: theme.colors.primary }]}>Voltar</Text>
          </Pressable>

          <View>
            <Text style={[styles.stepLabel, { color: theme.colors.textMuted }]}>ETAPA {step + 1} DE 2</Text>
            <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>{step === 0 ? 'Criar conta' : 'Foto de perfil'}</Text>
            <Text style={[styles.formSub, { color: theme.colors.textSecondary }]}>
              {step === 0 ? 'Preencha suas informações.' : 'Escolha como a comunidade vai te reconhecer.'}
            </Text>
          </View>

          <View style={styles.progressRow}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? theme.colors.primary : theme.colors.surface2 }]} />
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            {step === 0 ? (
              <>
                <WebField label="Nome completo" placeholder="Como você se chama?" value={name} onChangeText={setName} autoCapitalize="words" />
                <WebField label="E-mail" placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <WebField label="Senha" placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword} secure />
                  </View>
                  <View style={styles.rowItem}>
                    <WebField label="Confirmar senha" placeholder="Repita sua senha" value={confirm} onChangeText={setConfirm} secure onSubmitEditing={goNext} />
                  </View>
                </View>
                {!!error && <FormError message={error} />}
                <BeamButton title="Próximo" isPrimary iconRight="arrow-right" onPress={goNext} />
              </>
            ) : (
              <>
                <View style={styles.avatarSection}>
                  <View style={[styles.avatarPreview, { borderColor: theme.colors.borderLight }, !isCustom && { backgroundColor: solidBg }]}>
                    {isCustom
                      ? <Image source={{ uri: avatar }} style={styles.avatarImg} />
                      : <Text style={styles.avatarText}>{initials}</Text>}
                  </View>
                  <View style={styles.avatarControls}>
                    <Pressable
                      onPress={pickImage}
                      style={[styles.galleryBtn, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}
                    >
                      <Icon name="upload" size={iconSize.sm} color={theme.colors.primary} />
                      <Text style={[styles.galleryText, { color: theme.colors.textPrimary }]}>Enviar uma imagem</Text>
                    </Pressable>
                    <Text style={[styles.hint, { color: theme.colors.textMuted }]}>Ou escolha uma cor:</Text>
                    <View style={styles.colorGrid}>
                      {AVATARS.map((a) => {
                        const selected = !isCustom && avatar === a.key;
                        return (
                          <Pressable
                            key={a.key}
                            onPress={() => { setAvatar(a.key); setIsCustom(false); }}
                            style={[styles.colorOption, { backgroundColor: a.bg }, selected && { borderColor: theme.colors.textPrimary }]}
                          />
                        );
                      })}
                    </View>
                  </View>
                </View>
                {!!error && <FormError message={error} />}
                <BeamButton title={loading ? 'Criando conta...' : 'Criar minha conta'} iconRight="check" isPrimary onPress={handleRegister} />
                {loading && <ActivityIndicator color={theme.colors.primary} />}
              </>
            )}
          </View>

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
            <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
              Já tem conta? <Text style={[styles.switchHighlight, { color: theme.colors.primary }]}>Entrar</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const RegisterScreen = responsiveScreen(RegisterDesktop, MobileRegisterScreen);

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row' },
  formSide: { flex: 1, justifyContent: 'center', padding: spacing.xxxl },
  form: { width: '100%', maxWidth: layout.maxFormWidth, alignSelf: 'center', gap: spacing.lg },

  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs },
  backText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  stepLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: spacing.xs },
  formTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  formSub: { fontSize: fontSize.sm, marginTop: spacing.xs },

  progressRow: { flexDirection: 'row', gap: spacing.sm },
  progressSeg: { flex: 1, height: spacing.xs, borderRadius: radius.pill },

  card: { borderRadius: radius.lg, borderWidth: layout.borderWidth, padding: spacing.xl, gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },

  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  avatarPreview: {
    width: layout.thumbnailSize, height: layout.thumbnailSize, borderRadius: radius.pill,
    borderWidth: spacing.xxs, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: onPastelColor, fontSize: fontSize.xxl, fontWeight: fontWeight.semibold },
  avatarControls: { flex: 1, gap: spacing.sm },
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm,
    height: layout.controlHeight, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: layout.borderWidth,
  },
  galleryText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  hint: { fontSize: fontSize.xs, marginTop: spacing.xs },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorOption: { width: iconSize.xl, height: iconSize.xl, borderRadius: radius.pill, borderWidth: spacing.xxs, borderColor: 'transparent' },

  switchLink: { alignItems: 'center' },
  switchText: { fontSize: fontSize.sm },
  switchHighlight: { fontWeight: fontWeight.semibold },
});
