import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';

interface Props {
  /** Mensagem de carregamento */
  label?: string;
  /** Exibe o ícone animado (pulso suave, não contínuo pesado) */
  showIcon?: boolean;
}

/** Estado de carregamento visual (ícone com pulso suave). */
export const LoadingState: React.FC<Props> = ({ label = 'Carregando...', showIcon = true }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={styles.box}>
      {showIcon && (
        <Animated.View style={[styles.iconBox, { transform: [{ scale }], opacity }]}>
          <Ionicons name="heart" size={22} color={GiveNetTheme.primaryLight} />
        </Animated.View>
      )}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(124, 58, 237, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Type.body,
    color: GiveNetTheme.textSecondary,
  },
});