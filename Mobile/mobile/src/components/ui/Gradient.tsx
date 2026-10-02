import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GiveNetTheme } from '@/constants/colors';

export const Gradients = {
  /** Ação principal (roxo GiveNet) */
  primary: [GiveNetTheme.primary, GiveNetTheme.gradientMid, GiveNetTheme.gradientEnd] as const,
  /** Destaque suave para cards especiais */
  primarySoft: ['rgba(124, 58, 237, 0.34)', 'rgba(79, 70, 229, 0.16)'] as const,
  /** Sucesso */
  success: [GiveNetTheme.success, '#059669'] as const,
  /** Fundo decorativo do topo das telas */
  screenTop: ['rgba(124, 58, 237, 0.22)', 'rgba(15, 9, 31, 0)'] as const,
  /** Card de impacto (hero) */
  hero: ['rgba(124, 58, 237, 0.32)', 'rgba(37, 20, 68, 0.9)'] as const,
} as const;

interface Props {
  colors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

/**
 * Wrapper de gradiente — apenas visual.
 * Componente nativo (GPU), sem animação contínua.
 */
export const Gradient: React.FC<Props> = ({
  colors = Gradients.primary,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
}) => {
  return (
    <LinearGradient colors={colors} style={style} start={start} end={end}>
      {children}
    </LinearGradient>
  );
};