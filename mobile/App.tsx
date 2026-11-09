// mobile/App.tsx

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts, Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ReportsProvider } from './src/context/ReportsContext';
import { DropOffProvider } from './src/context/DropOffContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { theme } from './src/theme/tokens';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Título da aba do navegador (web). Sem isso o React Navigation usa o nome interno da rota
// (ex.: "HomeMain") ou "undefined" quando ainda não há rota ativa.
const APP_NAME = 'EcoGestão';

const ROUTE_TITLES: Record<string, string> = {
  Welcome: 'Bem-vindo',
  Login: 'Entrar',
  Register: 'Criar conta',
  Início: 'Início',
  HomeMain: 'Início',
  Mapa: 'Mapa',
  MapMain: 'Mapa',
  Comunidade: 'Comunidade',
  CommunityMain: 'Comunidade',
  Perfil: 'Perfil',
  ProfileMain: 'Perfil',
  Reportar: 'Reportar ocorrência',
  ReportDetail: 'Detalhe da ocorrência',
  DropOff: 'Onde descartar',
  DropOffDetail: 'Ponto de coleta',
  Levels: 'Níveis',
};

const documentTitle = {
  formatter: (options?: { title?: string }, route?: { name: string }): string => {
    const page = options?.title ?? (route ? ROUTE_TITLES[route.name] : undefined);
    return page ? `${page} · ${APP_NAME}` : APP_NAME;
  },
};

function SplashFade({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [opacity]);
  return <Animated.View style={[{ flex: 1 }, { opacity }]}>{children}</Animated.View>;
}

function LoadingScreen() {
  const { isDark } = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: isDark ? theme.colors.background : '#fff' }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

function RootContent() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) return <LoadingScreen />;

  return (
    <SplashFade>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {user ? <AppNavigator /> : <AuthNavigator />}
    </SplashFade>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Nunito-Regular':   Nunito_400Regular,
    'Nunito-Medium':    Nunito_500Medium,
    'Nunito-SemiBold':  Nunito_600SemiBold,
    'Nunito-Bold':      Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
  });

  if (!fontsLoaded) return <View style={styles.loading} />;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ReportsProvider>
            <DropOffProvider>
              <NavigationContainer documentTitle={documentTitle}>
                <RootContent />
              </NavigationContainer>
            </DropOffProvider>
          </ReportsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});