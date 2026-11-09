// mobile/src/components/web/DesktopContainer.tsx
// Estrutura compartilhada das telas Web Desktop (.web.tsx).
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from '../Typography';
import { Chip, SeverityChip, StatusChip } from '../Chip';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../theme/tokens';
import {
  fontSize, fontWeight, layout, lineHeight, radius, severityColors, severityTones, spacing, statusColors,
  statusTones, type Severity,
} from '../../theme/designSystem';

/** Estado do Pressable no react-native-web (inclui hover do mouse). */
export type WebPressableState = { pressed: boolean; hovered?: boolean };

/* ---------- Breakpoint ---------- */
export const useIsDesktop = (): boolean => {
  const { width } = useWindowDimensions();
  return width >= layout.desktopBreakpoint;
};

/**
 * Renderiza a versão desktop acima do breakpoint e a versão mobile original abaixo dele
 * (ex.: navegador de celular). São componentes distintos, então a troca remonta a árvore
 * e não viola a ordem dos hooks.
 */
export function responsiveScreen<P extends object>(
  Desktop: React.ComponentType<P>,
  Mobile: React.ComponentType<P>,
): React.FC<P> {
  const Screen: React.FC<P> = (props) => {
    const isDesktop = useIsDesktop();
    return isDesktop ? <Desktop {...props} /> : <Mobile {...props} />;
  };
  return Screen;
}

/* ---------- Cores semânticas ---------- */
export const getSeverityColor = (severity: string): string =>
  severityColors[severity as Severity] ?? severityColors['Média'];

export const getStatusColor = (status: string, theme: Theme): string =>
  statusColors[status] ?? theme.colors.textMuted;

/* ---------- Container ---------- */
interface DesktopContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export const DesktopContainer: React.FC<DesktopContainerProps> = ({
  children, maxWidth = layout.maxContentWidth, scroll = true, contentStyle,
}) => {
  const { theme } = useTheme();
  const inner = <View style={[styles.inner, { maxWidth }, contentStyle]}>{children}</View>;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {scroll ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
          {inner}
        </ScrollView>
      ) : (
        <View style={[styles.root, styles.scrollContent]}>{inner}</View>
      )}
    </View>
  );
};

/* ---------- Cabeçalho de página ---------- */
interface DesktopPageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
}

export const DesktopPageHeader: React.FC<DesktopPageHeaderProps> = ({ title, subtitle, eyebrow, right, left }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.header}>
      {left}
      <View style={styles.headerText}>
        {!!eyebrow && <Text style={[styles.eyebrow, { color: theme.colors.textSecondary }]}>{eyebrow}</Text>}
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
};

/* ---------- Colunas ---------- */
interface DesktopColumnsProps {
  main: React.ReactNode;
  side?: React.ReactNode;
  sideWidth?: number;
  sidePosition?: 'left' | 'right';
}

export const DesktopColumns: React.FC<DesktopColumnsProps> = ({
  main, side, sideWidth = layout.sidePanelWidth, sidePosition = 'right',
}) => {
  const sideNode = side ? <View style={[styles.side, { width: sideWidth }]}>{side}</View> : null;
  return (
    <View style={styles.columns}>
      {sidePosition === 'left' && sideNode}
      <View style={styles.main}>{main}</View>
      {sidePosition === 'right' && sideNode}
    </View>
  );
};

/* ---------- Grid responsivo ---------- */
interface ResponsiveGridProps<T> {
  data: readonly T[];
  minItemWidth: number;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  gap?: number;
  maxColumns?: number;
}

/** Grid em linhas (flexDirection: 'row') que calcula o número de colunas pela largura disponível. */
export function ResponsiveGrid<T>({
  data, minItemWidth, keyExtractor, renderItem, gap = spacing.lg, maxColumns = 4,
}: ResponsiveGridProps<T>) {
  const [width, setWidth] = React.useState(0);
  const columns = width > 0
    ? Math.max(1, Math.min(maxColumns, Math.floor((width + gap) / (minItemWidth + gap))))
    : 1;
  // Arredonda para baixo: frações de pixel faziam a última coluna quebrar de linha
  const itemWidth = width > 0 ? Math.floor((width - gap * (columns - 1)) / columns) : undefined;

  return (
    <View
      style={[styles.grid, { gap }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {data.map((item) => (
        <View key={keyExtractor(item)} style={itemWidth ? { width: itemWidth } : styles.gridFallback}>
          {renderItem(item)}
        </View>
      ))}
    </View>
  );
}

/* ---------- Card ---------- */
interface DesktopCardProps {
  children: React.ReactNode;
  title?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const DesktopCard: React.FC<DesktopCardProps> = ({ children, title, right, style }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }, style]}>
      {(!!title || !!right) && (
        <View style={styles.cardHeader}>
          {!!title && <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{title}</Text>}
          {right}
        </View>
      )}
      {children}
    </View>
  );
};

/* ---------- Badge ---------- */
// Etiqueta pastel: status e severidade conhecidos ganham tom e ícone próprios (Chip.tsx).
// `color` e `solid` ficam por compatibilidade com as telas que já usam o componente.
export const DesktopBadge: React.FC<{ label: string; color?: string; solid?: boolean }> = ({ label }) => {
  if (label in statusTones) return <StatusChip status={label} />;
  if (label in severityTones) return <SeverityChip severity={label} />;
  return <Chip label={label} />;
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxl },
  inner: { width: '100%', alignSelf: 'center', gap: spacing.xl },

  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  headerText: { flex: 1 },
  eyebrow: { fontSize: fontSize.sm, marginBottom: spacing.xxs },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, lineHeight: fontSize.xxl * lineHeight.tight },
  subtitle: { fontSize: fontSize.sm, marginTop: spacing.xs },

  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  main: { flex: 1, minWidth: 0, gap: spacing.xl },
  side: { gap: spacing.xl },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridFallback: { width: '100%' },

  card: { borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
