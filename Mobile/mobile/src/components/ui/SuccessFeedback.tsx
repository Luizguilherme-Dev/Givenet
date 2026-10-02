import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';

interface Props {
  title?: string;
  message?: string;
  /** Ícone de sucesso (padrão checkmark) */
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  children?: React.ReactNode;
}

/**
 * Feedback visual de sucesso (entrada suave + "pop" no ícone).
 * Apenas apresentação — não dispara nem altera nenhuma ação.
 */
export const SuccessFeedback: React.FC<Props> = ({
  title = 'Tudo certo!',
  message,
  icon = 'checkmark-circle',
  accent = GiveNetTheme.success,
  children,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 10,
    }).start();
  }, [anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={[styles.card, { borderColor: `${accent}4D`, backgroundColor: `${accent}17` }]}>
      <Animated.View
        style={[
          styles.iconBox,
          { backgroundColor: `${accent}26`, borderColor: `${accent}55`, transform: [{ scale }] },
        ]}
      >
        <Ionicons name={icon} size={30} color={accent} />
      </Animated.View>

      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 20,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    ...Type.heading,
    textAlign: 'center',
  },
  message: {
    ...Type.body,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
});