// mobile/src/screens/auth/LoginScreen.web.tsx
// Login Web Desktop: painel institucional à esquerda + formulário (máx. 480px) à direita.
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BeamButton } from '../../components/BeamButton';
import { responsiveScreen } from '../../components/web/DesktopContainer';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import {
  fontSize, fontWeight, iconSize, layout, lineHeight, radius, severityColors, spacing, tint,
} from '../../theme/designSystem';

const { LoginScreen: MobileLoginScreen } = require('./LoginScreen.tsx') as typeof import('./LoginScreen');

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };
type FeatherName = keyof typeof Feather.glyphMap;

const FEATURES: { icon: FeatherName; title: string; text: string }[] = [
  { icon: 'camera', title: 'Registre ocorrências', text: 'Foto, tipo de resíduo e localização em poucos passos.' },
  { icon: 'map', title: 'Acompanhe no mapa', text: 'Veja os pontos de descarte irregular da sua cidade.' },
  { icon: 'award', title: 'Ganhe reconhecimento', text: 'Suba de nível e desbloqueie conquistas colaborando.' },
];

/* ---------- Campo ---------- */
export function WebField({
  label, placeholder, value, onChangeText, secure = false, keyboardType = 'default', autoCapitalize = 'none', onSubmitEditing,
}: {
  label: string; placeholder: string; value: string; onChangeText: (v: string) => void;
  secure?: boolean; keyboardType?: 'default' | 'email-address'; autoCapitalize?: 'none' | 'words';
  onSubmitEditing?: () => void;
}) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <View style={[
        styles.fieldBox,
        { backgroundColor: theme.colors.surface2, borderColor: focused ? theme.colors.primary : theme.colors.border },
      ]}>
        <TextInput
          style={[styles.fieldInput, { color: theme.colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !showPwd}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
        />
        {secure && (
          <Pressable onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn} accessibilityLabel={showPwd ? 'Ocultar senha' : 'Mostrar senha'}>
            <Feather name={showPwd ? 'eye-off' : 'eye'} size={iconSize.sm} color={theme.colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ---------- Painel institucional ---------- */
export function AuthHeroPanel() {
  const { theme } = useTheme();
  return (
    <View style={[styles.hero, { backgroundColor: theme.colors.surface1, borderRightColor: theme.colors.border }]}>
      <View style={styles.heroInner}>
        <View style={styles.brandRow}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary + tint.soft, borderColor: theme.colors.primary + tint.medium }]}>
            <Feather name="map-pin" size={iconSize.md} color={theme.colors.primary} />
          </View>
          <Text style={[styles.brandName, { color: theme.colors.textPrimary }]}>EcoGestão</Text>
        </View>

        <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
          Tecnologia para uma cidade mais limpa, consciente e participativa.
        </Text>
        <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
          Mapeamento comunitário de descarte irregular de resíduos em Caxias-MA.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + tint.subtle }]}>
                <Feather name={f.icon} size={iconSize.sm} color={theme.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>{f.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ---------- Mensagem de erro ---------- */
export function FormError({ message }: { message: string }) {
  return (
    <View style={[styles.errorBox, { backgroundColor: severityColors.Alta + tint.subtle, borderColor: severityColors.Alta + tint.strong }]}>
      <Feather name="alert-circle" size={iconSize.sm} color={severityColors.Alta} />
      <Text style={[styles.errorText, { color: severityColors.Alta }]}>{message}</Text>
    </View>
  );
}

/* ---------- Tela desktop ---------- */
function LoginDesktop({ navigation }: Props) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true);
    setError('');
    const err = await login(email, password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <AuthHeroPanel />

      <View style={styles.formSide}>
        <View style={styles.form}>
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>Entrar na conta</Text>
          <Text style={[styles.formSub, { color: theme.colors.textSecondary }]}>Conecte-se para contribuir com a sua cidade.</Text>

          <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <WebField label="E-mail" placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" onSubmitEditing={handleLogin} />
            <WebField label="Senha" placeholder="••••••••" value={password} onChangeText={setPassword} secure onSubmitEditing={handleLogin} />

            {!!error && <FormError message={error} />}

            <BeamButton
              title={loading ? 'Entrando...' : 'Entrar'}
              isPrimary
              iconRight={loading ? undefined : 'log-in'}
              onPress={handleLogin}
            />
            {loading && <ActivityIndicator color={theme.colors.primary} />}
          </View>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.switchLink}>
            <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
              Não tem conta?{' '}
              <Text style={[styles.switchHighlight, { color: theme.colors.primary }]}>Criar conta gratuita</Text>
            </Text>
            <Feather name="arrow-right" size={iconSize.sm} color={theme.colors.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const LoginScreen = responsiveScreen(LoginDesktop, MobileLoginScreen);

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row' },

  hero: { flex: 1, borderRightWidth: layout.borderWidth, justifyContent: 'center', padding: spacing.xxxl },
  heroInner: { maxWidth: layout.maxFormWidth, alignSelf: 'center', gap: spacing.xl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: {
    width: layout.controlHeight, height: layout.controlHeight, borderRadius: radius.pill,
    borderWidth: layout.borderWidth, alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  heroTitle: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, lineHeight: fontSize.xxxl * lineHeight.tight },
  heroText: { fontSize: fontSize.md, lineHeight: fontSize.md * lineHeight.relaxed },
  features: { gap: spacing.lg, marginTop: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  featureIcon: { width: iconSize.xl, height: iconSize.xl, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  featureDesc: { fontSize: fontSize.sm, marginTop: spacing.xxs, lineHeight: fontSize.sm * lineHeight.normal },

  formSide: { flex: 1, justifyContent: 'center', padding: spacing.xxxl },
  form: { width: '100%', maxWidth: layout.maxFormWidth, alignSelf: 'center', gap: spacing.lg },
  formTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  formSub: { fontSize: fontSize.sm, marginTop: -spacing.sm },
  card: { borderRadius: radius.lg, borderWidth: layout.borderWidth, padding: spacing.xl, gap: spacing.lg },

  fieldWrapper: { gap: spacing.xs },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldBox: {
    flexDirection: 'row', alignItems: 'center', height: layout.controlHeight,
    borderRadius: radius.sm, borderWidth: layout.borderWidth, paddingHorizontal: spacing.md,
  },
  fieldInput: { flex: 1, height: '100%', fontSize: fontSize.md },
  eyeBtn: { padding: spacing.xs },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radius.sm, borderWidth: layout.borderWidth, padding: spacing.md,
  },
  errorText: { flex: 1, fontSize: fontSize.sm },

  switchLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  switchText: { fontSize: fontSize.sm },
  switchHighlight: { fontWeight: fontWeight.semibold },
});
