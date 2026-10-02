import React, { useEffect, useRef } from 'react';
import { Animated, ColorValue, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius } from '@/constants/design';

interface Props {
  /** Ícone já resolvido pelo tab bar (focused/outline) */
  name: keyof typeof Ionicons.glyphMap;
  /** Cor entregue pelo tab bar — aceita ColorValue (react-native 0.86) */
  color: ColorValue;
  focused: boolean;
}

/**
 * Ícone da bottom navigation com indicador animado.
 * Puramente visual: recebe o ícone/cor calculados pelo próprio tab bar.
 */
export const TabBarIcon: React.FC<Props> = ({ name, color, focused }) => {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [anim, focused]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const pillOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.pill, { opacity: pillOpacity }]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={name} size={21} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: 46,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 46,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(124, 58, 237, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.34)',
  },
});