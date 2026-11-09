// mobile/src/navigation/AppNavigator.web.tsx
// Navegação Web: sidebar à esquerda no desktop; abaixo do breakpoint usa o AppNavigator mobile original.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FullMapScreen } from '../screens/FullMapScreen';
import { ReportDetailScreen } from '../screens/ReportDetailScreen';
import { DropOffScreen } from '../screens/DropOffScreen';
import { DropOffDetailScreen } from '../screens/DropOffDetailScreen';
import { LevelsScreen } from '../screens/LevelsScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { responsiveScreen, type WebPressableState } from '../components/web/DesktopContainer';
import {
  fontSize, fontWeight, iconSize, layout, onAccentColor, radius, spacing, tint,
} from '../theme/designSystem';

// Import explícito do arquivo mobile (o Metro resolve o caminho exato, sem sufixo .web)
const { AppNavigator: MobileAppNavigator } = require('./AppNavigator.tsx') as typeof import('./AppNavigator');

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <Stack.Screen name="DropOff" component={DropOffScreen} />
      <Stack.Screen name="DropOffDetail" component={DropOffDetailScreen} />
      <Stack.Screen name="Levels" component={LevelsScreen} />
    </Stack.Navigator>
  );
}

function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={FullMapScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityMain" component={FeedScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <Stack.Screen name="Levels" component={LevelsScreen} />
    </Stack.Navigator>
  );
}

type FeatherName = keyof typeof Feather.glyphMap;

const NAV_ICONS: Record<string, FeatherName> = {
  Início: 'home',
  Mapa: 'navigation',
  Comunidade: 'message-square',
  Perfil: 'user',
};

/* ---------- Item da sidebar ---------- */
function NavItem({ label, icon, active, onPress }: { label: string; icon: FeatherName; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ hovered }: WebPressableState) => [
        styles.navItem,
        hovered && { backgroundColor: theme.colors.surface2 },
        active && { backgroundColor: theme.colors.primary + tint.soft },
      ]}
    >
      <Feather name={icon} size={iconSize.sm} color={active ? theme.colors.primary : theme.colors.textSecondary} />
      <Text style={[styles.navLabel, { color: active ? theme.colors.primary : theme.colors.textSecondary }, active && styles.navLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({ state, navigation }: BottomTabBarProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const focused = state.routes[state.index];
  const nested = focused.state;
  // O estado aninhado pode chegar parcial (sem index) logo após navigate(tab, { screen })
  const nestedIndex = nested ? (typeof nested.index === 'number' ? nested.index : nested.routes.length - 1) : undefined;
  const nestedName = nested && nestedIndex !== undefined
    ? nested.routes[nestedIndex]?.name
    : (focused.params as { screen?: string } | undefined)?.screen;
  const isDropOff = focused.name === 'Início' && (nestedName === 'DropOff' || nestedName === 'DropOffDetail');
  const isLevels = nestedName === 'Levels';
  const isShortcut = isDropOff || isLevels;

  const navRoutes = state.routes.filter((r) => r.name !== 'Reportar');

  return (
    <View style={[styles.sidebar, { backgroundColor: theme.colors.surface1, borderRightColor: theme.colors.border }]}>
      {/* Marca */}
      <View style={styles.brand}>
        <View style={[styles.brandIcon, { backgroundColor: theme.colors.primary + tint.soft }]}>
          <Feather name="map-pin" size={iconSize.sm} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>EcoGestão</Text>
          <Text style={[styles.brandSub, { color: theme.colors.textMuted }]}>Caxias · MA</Text>
        </View>
      </View>

      {/* CTA principal */}
      <Pressable
        onPress={() => navigation.navigate('Reportar')}
        style={({ hovered }: WebPressableState) => [
          styles.cta,
          { backgroundColor: theme.colors.primary },
          (hovered || focused.name === 'Reportar') && styles.ctaHover,
        ]}
      >
        <Feather name="plus" size={iconSize.sm} color={onAccentColor} />
        <Text style={styles.ctaText}>Reportar ocorrência</Text>
      </Pressable>

      {/* Navegação */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>MENU</Text>
      <View style={styles.navGroup}>
        {navRoutes.map((route) => (
          <NavItem
            key={route.key}
            label={route.name}
            icon={NAV_ICONS[route.name] ?? 'circle'}
            active={focused.key === route.key && !isShortcut}
            onPress={() => {
              if (focused.key === route.key && nested && nestedIndex !== undefined && nestedIndex > 0) {
                // Volta para a raiz do stack ao clicar novamente na aba ativa
                navigation.navigate(route.name, { screen: nested.routes[0].name });
              } else {
                navigation.navigate(route.name);
              }
            }}
          />
        ))}
        <NavItem
          label="Onde descartar"
          icon="trash-2"
          active={isDropOff}
          onPress={() => navigation.navigate('Início', { screen: 'DropOff', initial: false })}
        />
        <NavItem
          label="Níveis"
          icon="award"
          active={isLevels}
          onPress={() => navigation.navigate('Perfil', { screen: 'Levels', initial: false })}
        />
      </View>

      <View style={styles.spacer} />

      {/* Rodapé: tema + usuário */}
      <NavItem label={isDark ? 'Modo claro' : 'Modo escuro'} icon={isDark ? 'sun' : 'moon'} active={false} onPress={toggleTheme} />

      {user && (
        <View style={[styles.userBox, { borderTopColor: theme.colors.border }]}>
          <UserAvatar user={user} size={iconSize.xl} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.textMuted }]} numberOfLines={1}>{user.email}</Text>
          </View>
          <Pressable onPress={logout} accessibilityLabel="Sair" style={styles.logoutBtn}>
            <Feather name="log-out" size={iconSize.sm} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ---------- Navigator desktop ---------- */
function DesktopAppNavigator() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      tabBar={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'left',
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tab.Screen name="Início" component={HomeStack} />
      <Tab.Screen name="Mapa" component={MapStack} />
      <Tab.Screen name="Comunidade" component={CommunityStack} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
      <Tab.Screen name="Reportar" component={ReportScreen} />
    </Tab.Navigator>
  );
}

export const AppNavigator = responsiveScreen(DesktopAppNavigator, MobileAppNavigator);

const styles = StyleSheet.create({
  sidebar: {
    width: layout.sidebarWidth, height: '100%', borderRightWidth: layout.borderWidth,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.xs,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
  brandIcon: { width: iconSize.xl, height: iconSize.xl, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  brandSub: { fontSize: fontSize.xs, marginTop: spacing.xxs },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    height: layout.controlHeight, borderRadius: radius.sm, marginBottom: spacing.xl,
  },
  ctaHover: { opacity: 0.9 },
  ctaText: { color: onAccentColor, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  sectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5, paddingHorizontal: spacing.sm, marginBottom: spacing.xs },
  navGroup: { gap: spacing.xxs },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    height: layout.controlHeight, paddingHorizontal: spacing.md, borderRadius: radius.sm,
  },
  navLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  navLabelActive: { fontWeight: fontWeight.semibold },

  spacer: { flex: 1 },

  userBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderTopWidth: layout.borderWidth, paddingTop: spacing.lg, marginTop: spacing.sm, paddingHorizontal: spacing.xs,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  userEmail: { fontSize: fontSize.xs, marginTop: spacing.xxs },
  logoutBtn: { padding: spacing.xs },
});
