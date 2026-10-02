import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

const TONES: Record<Tone, { fg: string; bg: string; border: string }> = {
  primary: { fg: '#D8B4FE', bg: 'rgba(124, 58, 237, 0.18)', border: 'rgba(139, 92, 246, 0.4)' },
  success: { fg: GiveNetTheme.success, bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.34)' },
  warning: { fg: GiveNetTheme.warning, bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.34)' },
  danger: { fg: GiveNetTheme.danger, bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.34)' },
  info: { fg: GiveNetTheme.info, bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.34)' },
  accent: { fg: GiveNetTheme.accent, bg: 'rgba(6, 182, 212, 0.14)', border: 'rgba(6, 182, 212, 0.34)' },
  neutral: { fg: GiveNetTheme.textSecondary, bg: 'rgba(255, 255, 255, 0.06)', border: 'rgba(255, 255, 255, 0.12)' },
};

interface Props {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
  dot?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Etiqueta/pílula visual (status, categorias, tags). Somente apresentação. */
export const Badge: React.FC<Props> = ({
  label,
  tone = 'primary',
  icon,
  dot = false,
  small = false,
  style,
}) => {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.wrap,
        small && styles.wrapSmall,
        { backgroundColor: t.bg, borderColor: t.border },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: t.fg }]} />}
      {icon && <Ionicons name={icon} size={small ? 11 : 13} color={t.fg} />}
      <Text
        style={[styles.text, small && styles.textSmall, { color: t.fg }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  wrapSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...Type.caption,
    fontWeight: '800',
  },
  textSmall: {
    fontSize: 10.5,
  },
});