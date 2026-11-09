// mobile/src/components/Typography.tsx
// Text e TextInput do app: aplicam a família Nunito correta a partir do fontWeight
// (ou da família informada), para que todo texto use a fonte do Design System
// sem precisar declarar fontFamily em cada estilo.
import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { fontFamilyByWeight } from '../theme/designSystem';

type Weight = keyof typeof fontFamilyByWeight;

const WEIGHT_BY_FAMILY: Record<string, Weight> = {
  'Nunito-Regular': '400',
  'Nunito-Medium': '500',
  'Nunito-SemiBold': '600',
  'Nunito-Bold': '700',
  'Nunito-ExtraBold': '800',
};

const normalizeWeight = (weight: TextStyle['fontWeight']): Weight | undefined => {
  if (weight === undefined || weight === null) return undefined;
  if (weight === 'normal') return '400';
  if (weight === 'bold') return '700';
  const n = typeof weight === 'number' ? weight : parseInt(String(weight), 10);
  if (Number.isNaN(n)) return undefined;
  if (n <= 400) return '400';
  if (n <= 500) return '500';
  if (n <= 600) return '600';
  if (n <= 700) return '700';
  return '800';
};

const resolveFontStyle = (style: StyleProp<TextStyle>): StyleProp<TextStyle> => {
  const flat = StyleSheet.flatten(style) ?? {};
  const family = flat.fontFamily;
  // Família externa ao Design System (ex.: monospace): respeita o que foi pedido
  if (family && !(family in WEIGHT_BY_FAMILY)) return style;

  const weight = normalizeWeight(flat.fontWeight) ?? (family ? WEIGHT_BY_FAMILY[family] : undefined) ?? '400';
  return [style, { fontFamily: fontFamilyByWeight[weight], fontWeight: 'normal' }];
};

export const Text = forwardRef<RNText, TextProps>(({ style, ...rest }, ref) => (
  <RNText ref={ref} style={resolveFontStyle(style)} {...rest} />
));
Text.displayName = 'Text';

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({ style, ...rest }, ref) => (
  <RNTextInput ref={ref} style={resolveFontStyle(style)} {...rest} />
));
TextInput.displayName = 'TextInput';
