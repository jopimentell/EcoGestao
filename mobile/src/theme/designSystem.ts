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
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
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

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
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

// Cores semânticas de severidade (domínio fixo, não muda com tema)
export const severityColors = {
  Baixa:   '#22C55E',
  Média:   '#F97316',
  Alta:    '#EF4444',
  Crítica: '#A855F7',
} as const;

export type Severity = keyof typeof severityColors;

export const levelVisuals: Record<number, { color: string; icon: string }> = {
  1: { color: '#94A3B8', icon: 'circle' },     // Novato — cinza
  2: { color: '#22C55E', icon: 'eye' },        // Observador — verde
  3: { color: '#3B82F6', icon: 'shield' },     // Guardião — azul
  4: { color: '#A855F7', icon: 'star' },       // Fiscal — roxo
  5: { color: '#F59E0B', icon: 'award' },      // Herói — dourado
};

export const getLevelVisual = (level: number) =>
  levelVisuals[level] ?? { color: '#94A3B8', icon: 'circle' };