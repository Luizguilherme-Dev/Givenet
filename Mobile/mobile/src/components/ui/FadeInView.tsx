import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Motion } from '@/constants/design';

interface Props {
  children: React.ReactNode;
  /** Atraso da entrada (efeito cascata discreto) */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Entrada suave de elementos (fade + subida curta).
 * Animação única (não é contínua) e usa driver nativo — leve para Android modesto.
 */
export const FadeInView: React.FC<Props> = ({ children, delay = 0, style }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: Motion.slow,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

/** Container de tela com gradiente decorativo sutil no topo. */
export const ScreenBackdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {children}
  </View>
);