export const darkTheme = {
  colors: {
    background: '#232323',
    surface1: '#2F2F2F',
    surface2: '#3A3A3A',
    surface3: '#474747',
    primary: '#459C6A', // Verde floresta
    primaryMuted: 'rgba(69, 156, 106, 0.2)',
    primaryStrong: '#204630', // Verde profundo (círculo de seta em CTAs, texto sobre pastel)
    indigo: '#7B6FD6', // Lavanda (status Aprovado/Publicado)
    emerald: '#8BA33B', // Lima/oliva (acento secundário)
    textPrimary: '#FFFFFF',
    textSecondary: '#B5B5B5',
    textMuted: '#8A8A8A',
    border: '#3A3A3A',
    borderLight: 'rgba(255,255,255,0.06)',
    overlay: 'rgba(0,0,0,0.6)',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 64 },
  typography: {
    fontFamily: {
      regular: 'Nunito-Regular',
      medium: 'Nunito-Medium',
      semiBold: 'Nunito-SemiBold',
      bold: 'Nunito-Bold',
      extraBold: 'Nunito-ExtraBold',
    },
    sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, xxl: 30, hero: 48 },
    weights: { regular: '400' as const, medium: '500' as const, semiBold: '600' as const }
  },
  radii: { sm: 8, md: 12, lg: 16, xl: 22, full: 9999 }
};

export const lightTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#F6F6F6',
    surface1: '#FFFFFF',
    surface2: '#EFEFEF',
    surface3: '#E3E3E3',
    primary: '#377A54', // Verde floresta (tom mais escuro para contraste no claro)
    primaryMuted: 'rgba(55, 122, 84, 0.15)',
    textPrimary: '#232323',
    textSecondary: '#6B6B6B',
    textMuted: '#7A7A7A',
    border: '#ECECEC',
    borderLight: 'rgba(0,0,0,0.04)',
    overlay: 'rgba(35,35,35,0.4)',
  }
};

export type Theme = typeof darkTheme;
export const theme = darkTheme;
export default theme;
