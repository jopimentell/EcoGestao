// mobile/src/theme/designSystem.ts

export const spacing = {
  none: 0,
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  xxxl: 40,
} as const;

export const radius = {
  xs:   8,
  sm:   12,
  md:   16,
  lg:   22,
  xl:   28,
  pill: 999,
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  26,
  xxxl: 34,
} as const;

export const lineHeight = {
  tight:   1.15,
  normal:  1.4,
  relaxed: 1.6,
} as const;

// Família por peso (Nunito). Resolvida automaticamente pelos componentes Text/TextInput
// de src/components/Typography.tsx a partir do fontWeight.
export const fontFamilyByWeight = {
  '400': 'Nunito-Regular',
  '500': 'Nunito-Medium',
  '600': 'Nunito-SemiBold',
  '700': 'Nunito-Bold',
  '800': 'Nunito-ExtraBold',
} as const;

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  extrabold: '800' as const,
};

export const iconSize = {
  sm:  18,
  md:  22,
  lg:  28,
  xl:  36,
  xxl: 48,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#232323',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#232323',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

// Layout Web Desktop (usado pelos arquivos .web.tsx)
export const layout = {
  desktopBreakpoint: 900,
  maxContentWidth:   1200,
  maxFormWidth:      480,
  sidebarWidth:      248,
  sidePanelWidth:    340,
  borderWidth:       1,
  controlHeight:     44,
  mapPreviewHeight:  320,
  mapPickerHeight:   360,
  cardImageHeight:   180,
  heroImageHeight:   380,
  thumbnailSize:     88,
  avatarLg:          72,
  textAreaHeight:    120,
} as const;

// Sufixos de opacidade (hex alpha) para tingir cores do tema: color + tint.soft
export const tint = {
  subtle: '14',
  soft:   '22',
  medium: '44',
  strong: '55',
  overlay: 'CC',
} as const;

// Cor de conteúdo sobre fundos de destaque (botões primários, badges sólidos)
export const onAccentColor = '#FFFFFF';

export const materials = [
  'Óleo de Cozinha',
  'Eletrônicos',
  'Pilhas e Baterias',
  'Vidro',
  'Papel e Papelão',
  'Plástico',
  'Metal',
  'Medicamentos',
  'Lâmpadas',
] as const;

export type Material = (typeof materials)[number];

// Pastéis da marca (fixos, iguais nos dois temas) — sempre com texto escuro por cima
export const pastelColors = {
  mint:     '#DDF0E5',
  lime:     '#EBF4C2',
  peach:    '#FED9A2',
  lavender: '#CAC4F8',
  sky:      '#D0F3FD',
  rose:     '#F7D6D0',
} as const;

// Texto/ícone sobre fundos pastel
export const onPastelColor = '#204630';

// Cores semânticas (domínio fixo, não muda com tema)
export const semanticColors = {
  success: '#459C6A',
  warning: '#D4A017',
  alert:   '#CB5E0C',
  danger:  '#D93036',
  info:    '#7B6FD6',
  neutral: '#8A8A8A',
} as const;

export const severityColors = {
  Baixa:   semanticColors.success,
  Média:   semanticColors.warning,
  Alta:    semanticColors.alert,
  Crítica: semanticColors.danger,
} as const;

export type Severity = keyof typeof severityColors;

export const statusColors: Record<string, string> = {
  'Resolvido':  semanticColors.success,
  'Aprovado':   semanticColors.info,
  'Publicado':  semanticColors.info,
  'Em análise': semanticColors.warning,
  'Rejeitado':  semanticColors.danger,
};

// Tons pastel usados em chips/etiquetas (Chip.tsx)
export type PastelTone = keyof typeof pastelColors | 'neutral';

export const severityTones: Record<string, PastelTone> = {
  'Baixa':   'mint',
  'Média':   'lime',
  'Alta':    'peach',
  'Crítica': 'rose',
};

export const statusTones: Record<string, PastelTone> = {
  'Resolvido':  'mint',
  'Aprovado':   'lavender',
  'Publicado':  'lavender',
  'Em análise': 'peach',
  'Rejeitado':  'rose',
};

// Paleta de avatares — as chaves são salvas no perfil, por isso não mudam
export const avatarColors: Record<string, string> = {
  orange:  pastelColors.mint,
  indigo:  pastelColors.lavender,
  emerald: pastelColors.lime,
  rose:    pastelColors.rose,
  sky:     pastelColors.sky,
  violet:  pastelColors.peach,
};

export const defaultAvatarColor = pastelColors.mint;

export const levelVisuals: Record<number, { color: string; icon: string }> = {
  1: { color: '#9A9A9A', icon: 'plant' },      // Novato — cinza
  2: { color: '#8BA33B', icon: 'binoculars' }, // Observador — lima
  3: { color: '#3E8FA8', icon: 'shield' },     // Guardião — azul-céu
  4: { color: '#7B6FD6', icon: 'award' },      // Fiscal — lavanda
  5: { color: '#C9962A', icon: 'crown' },      // Herói — dourado
};

export const getLevelVisual = (level: number) =>
  levelVisuals[level] ?? { color: '#9A9A9A', icon: 'plant' };