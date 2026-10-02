import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Space, Type } from '@/constants/design';

type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'secondary' | 'danger';

const TONES: Record<Tone, { bg: string; border: string; glow: string }> = {
  primary: { bg: 'rgba(124, 58, 237, 0.18)', border: 'rgba(139, 92, 246, 0.34)', glow: 'rgba(124, 58, 237, 0.28)' },
  accent: { bg: 'rgba(6, 182, 212, 0.16)', border: 'rgba(6, 182, 212, 0.32)', glow: 'rgba(6, 182, 212, 0.24)' },
  success: { bg: 'rgba(16, 185, 129, 0.16)', border: 'rgba(16, 185, 129, 0.32)', glow: 'rgba(16, 185, 129, 0.24)' },
  warning: { bg: 'rgba(245, 158, 11, 0.16)', border: 'rgba(245, 158, 11, 0.32)', glow: 'rgba(245, 158, 11, 0.24)' },
  secondary: { bg: 'rgba(236, 72, 153, 0.16)', border: 'rgba(236, 72, 153, 0.32)', glow: 'rgba(236, 72, 153, 0.24)' },
  danger: { bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.32)', glow: 'rgba(239, 68, 68, 0.24)' },
};

interface Props {
  label: string;
  value?: string;
  /** Nome do ícone Ionicons */
  iconName: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
  /** Atraso da entrada em cascata */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Cartão de estatística com entrada suave (efeito cascata discreto). */
export const StatTile: React.FC<Props> = ({
  label,
  value,
  iconName,
  tone = 'primary',
  delay = 0,
  style,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const t = TONES[tone];

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: t.bg, borderColor: t.border },
        { opacity: anim, transform: [{ translateY }] },
        style,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: t.glow }]}>
        <Ionicons name={iconName} size={16} color={GiveNetTheme.textPrimary} />
      </View>
      {value ? <Animated.Text style={styles.value}>{value}</Animated.Text> : null}
      <Animated.Text style={styles.label} numberOfLines={2}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    minHeight: 104,
    borderRadius: Radius.md,
    padding: Space.lg,
    borderWidth: 1,
    justifyContent: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 19,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
    letterSpacing: -0.3,
  },
  label: {
    ...Type.caption,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
  },
});