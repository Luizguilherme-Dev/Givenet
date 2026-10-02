import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Motion } from '@/constants/design';

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /**
   * Estilos de LAYOUT do wrapper pressionável (flex, width, margin...).
   * `style` é aplicado ao conteúdo interno, então `flex` ali não distribui
   * largura — para ocupar espaço no pai use `containerStyle`.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /** Escala final ao pressionar (press feedback sutil) */
  scaleTo?: number;
  children?: React.ReactNode;
}

/**
 * Pressable com microinteração de "press feedback".
 *
 * Usa `Animated` nativo (driver nativo, sem JS por frame) — leve para
 * dispositivos Android modestos. Repassa TODOS os props originais
 * (onPress, disabled, accessibility...) sem alterar comportamento.
 */
export const PressableScale: React.FC<Props> = ({
  style,
  containerStyle,
  scaleTo = 0.97,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animate = (toScale: number, toOpacity: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: toOpacity,
        duration: Motion.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      disabled={disabled}
      style={containerStyle}
      onPressIn={(e) => {
        animate(scaleTo, 0.9);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animate(1, 1);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};