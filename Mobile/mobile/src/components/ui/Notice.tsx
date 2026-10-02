import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Motion, Radius, Type } from '@/constants/design';

export type NoticeTone = 'success' | 'error' | 'warning' | 'info';

interface Props {
  message: string;
  tone?: NoticeTone;
  /** Dispara a animação de entrada sempre que mudar */
  trigger?: unknown;
  style?: StyleProp<ViewStyle>;
}

const TONE: Record<NoticeTone, { fg: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: {
    fg: GiveNetTheme.success,
    bg: 'rgba(16, 185, 129, 0.13)',
    border: 'rgba(16, 185, 129, 0.32)',
    icon: 'checkmark-circle',
  },
  error: {
    fg: GiveNetTheme.danger,
    bg: 'rgba(239, 68, 68, 0.13)',
    border: 'rgba(239, 68, 68, 0.32)',
    icon: 'alert-circle',
  },
  warning: {
    fg: GiveNetTheme.warning,
    bg: 'rgba(245, 158, 11, 0.13)',
    border: 'rgba(245, 158, 11, 0.32)',
    icon: 'warning',
  },
  info: {
    fg: GiveNetTheme.primaryLight,
    bg: 'rgba(124, 58, 237, 0.13)',
    border: 'rgba(124, 58, 237, 0.32)',
    icon: 'information-circle',
  },
};

/**
 * Aviso inline (feedback visual de ações do usuário).
 * ⚠️ Não dispara nada: apenas exibe a mensagem que já vem da tela.
 */
export const Notice: React.FC<Props> = ({ message, tone = 'info', trigger, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const cfg = TONE[tone];

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: Motion.base,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [anim, trigger, message, tone]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] });

  return (
    <Animated.View
      style={[
        styles.box,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
        { opacity: anim, transform: [{ translateY }] },
        style,
      ]}
    >
      <Ionicons name={cfg.icon} size={16} color={cfg.fg} />
      <Text style={[styles.text, { color: cfg.fg }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  text: {
    ...Type.caption,
    fontWeight: '700',
    flex: 1,
    lineHeight: 16,
  },
});