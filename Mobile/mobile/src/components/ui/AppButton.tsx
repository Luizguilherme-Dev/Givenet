import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Shadow, Touch, Type } from '@/constants/design';
import { PressableScale } from './PressableScale';
import { Gradient, Gradients } from './Gradient';

type Variant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' | 'outline';
type Size = 'md' | 'lg' | 'sm';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT: Record<Size, number> = { sm: 40, md: Touch.button, lg: 56 };

/**
 * Botão do redesign.
 * ⚠️ Repassa onPress/disabled exatamente como recebidos — nenhuma lógica muda.
 */
export const AppButton: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}) => {
  const isDisabled = disabled || loading;
  const height = HEIGHT[size];

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={fgFor(variant)} /> : null}
          <Text style={[styles.label, { color: fgFor(variant), fontSize: size === 'sm' ? 13 : 14.5 }]}>
            {label}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={16} color={fgFor(variant)} /> : null}
        </>
      )}
    </View>
  );

  const baseStyle: StyleProp<ViewStyle> = [
    styles.base,
    { height },
    fullWidth && styles.fullWidth,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    variant === 'outline' && styles.outline,
    variant === 'danger' && styles.danger,
    variant === 'primary' && Shadow.glow,
    variant === 'success' && Shadow.soft,
    isDisabled && styles.disabled,
    style,
  ];

  if (variant === 'primary' || variant === 'success') {
    return (
      <PressableScale
        onPress={onPress}
        disabled={isDisabled}
        style={baseStyle}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        <Gradient
          colors={variant === 'primary' ? Gradients.primary : Gradients.success}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {content}
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      style={baseStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {content}
    </PressableScale>
  );
};

function fgFor(variant: Variant) {
  if (variant === 'secondary' || variant === 'outline') return GiveNetTheme.textPrimary;
  if (variant === 'ghost') return GiveNetTheme.textSecondary;
  if (variant === 'danger') return GiveNetTheme.danger;
  return '#FFFFFF';
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: '100%',
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  secondary: {
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: GiveNetTheme.borderLight,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.34)',
  },
  disabled: {
    opacity: 0.45,
  },
});