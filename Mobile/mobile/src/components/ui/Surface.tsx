import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle, StyleProp } from 'react-native';
import { Glass, Radius, Shadow } from '@/constants/design';
import { GiveNetTheme } from '@/constants/colors';

type SurfaceVariant = 'solid' | 'glass' | 'glassStrong' | 'muted' | 'outline' | 'gradientEdge';

interface Props extends ViewProps {
  variant?: SurfaceVariant;
  radius?: number;
  padded?: boolean;
  /** Habilita sombra suave */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Superfície base do redesign (Material 3 + glassmorphism pontual).
 *
 * Componente PURAMENTE VISUAL: apenas encapsula <View> com estilos.
 * Não controla estado, não dispara eventos e não altera nenhuma lógica.
 */
export const Surface: React.FC<Props> = ({
  variant = 'solid',
  radius = Radius.lg,
  padded = false,
  elevated = false,
  style,
  children,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.base,
        { borderRadius: radius },
        variant === 'solid' && styles.solid,
        variant === 'glass' && styles.glass,
        variant === 'glassStrong' && styles.glassStrong,
        variant === 'muted' && styles.muted,
        variant === 'outline' && styles.outline,
        variant === 'gradientEdge' && styles.gradientEdge,
        padded && styles.padded,
        elevated && Shadow.soft,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    position: 'relative',
  },
  solid: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  glass: {
    backgroundColor: Glass.neutral,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  glassStrong: {
    backgroundColor: Glass.tint,
    borderWidth: 1,
    borderColor: Glass.borderPrimary,
  },
  muted: {
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  gradientEdge: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  padded: {
    padding: 16,
  },
});