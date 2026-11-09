// mobile/src/components/Chip.tsx
// Etiqueta pill em tom pastel (padrão das tags da referência visual): texto escuro + ícone opcional à direita.
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Typography';
import { Icon, type IconName } from './Icon';
import { useTheme } from '../context/ThemeContext';
import {
  fontSize, fontWeight, onPastelColor, pastelColors, radius, severityTones, spacing, statusTones,
  type PastelTone,
} from '../theme/designSystem';

type ChipProps = {
  label: string;
  tone?: PastelTone;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, tone = 'neutral', icon, style }: ChipProps) {
  const { theme } = useTheme();
  const isNeutral = tone === 'neutral';
  const bg = isNeutral ? theme.colors.surface2 : pastelColors[tone];
  const fg = isNeutral ? theme.colors.textSecondary : onPastelColor;

  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>{label}</Text>
      {icon ? <Icon name={icon} size={12} color={fg} weight="bold" /> : null}
    </View>
  );
}

const STATUS_ICONS: Record<string, IconName> = {
  'Resolvido':  'check-circle',
  'Aprovado':   'check',
  'Publicado':  'check',
  'Em análise': 'clock',
  'Rejeitado':  'x',
  'Novo':       'plant',
};

const SEVERITY_ICONS: Record<string, IconName> = {
  'Baixa':   'leaf',
  'Média':   'drop',
  'Alta':    'alert-circle',
  'Crítica': 'alert-triangle',
};

export function StatusChip({ status, style }: { status: string; style?: StyleProp<ViewStyle> }) {
  return <Chip label={status} tone={statusTones[status] ?? 'neutral'} icon={STATUS_ICONS[status]} style={style} />;
}

export function SeverityChip({ severity, style }: { severity: string; style?: StyleProp<ViewStyle> }) {
  return <Chip label={severity} tone={severityTones[severity] ?? 'neutral'} icon={SEVERITY_ICONS[severity]} style={style} />;
}

const MATERIAL_VISUALS: Record<string, { tone: PastelTone; icon: IconName }> = {
  'Óleo de Cozinha':   { tone: 'sky',      icon: 'drop' },
  'Eletrônicos':       { tone: 'lavender', icon: 'zap' },
  'Pilhas e Baterias': { tone: 'peach',    icon: 'zap' },
  'Vidro':             { tone: 'sky',      icon: 'recycle' },
  'Papel e Papelão':   { tone: 'lime',     icon: 'leaf' },
  'Plástico':          { tone: 'mint',     icon: 'recycle' },
  'Metal':             { tone: 'neutral',  icon: 'recycle' },
  'Medicamentos':      { tone: 'rose',     icon: 'plus' },
  'Lâmpadas':          { tone: 'peach',    icon: 'sun' },
};

export function MaterialChip({ material, style }: { material: string; style?: StyleProp<ViewStyle> }) {
  const visual = MATERIAL_VISUALS[material] ?? { tone: 'mint' as PastelTone, icon: 'recycle' as IconName };
  return <Chip label={material} tone={visual.tone} icon={visual.icon} style={style} />;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
