import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Shadow, Type } from '@/constants/design';
import { PressableScale } from './PressableScale';

type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'secondary';

const TONES: Record<Tone, { bg: string; border: string; fg: string }> = {
  primary: { bg: 'rgba(124, 58, 237, 0.16)', border: 'rgba(139, 92, 246, 0.28)', fg: GiveNetTheme.primaryLight },
  accent: { bg: 'rgba(6, 182, 212, 0.14)', border: 'rgba(6, 182, 212, 0.26)', fg: GiveNetTheme.accent },
  success: { bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.26)', fg: GiveNetTheme.success },
  warning: { bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.26)', fg: GiveNetTheme.warning },
  secondary: { bg: 'rgba(236, 72, 153, 0.14)', border: 'rgba(236, 72, 153, 0.26)', fg: GiveNetTheme.secondary },
};

interface Props {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Atalho de ação (grid da Home). Somente navegação — nenhum dado é alterado. */
export const ActionTile: React.FC<Props> = ({ title, subtitle, icon, tone = 'primary', onPress, style }) => {
  const t = TONES[tone];
  return (
    <PressableScale onPress={onPress} style={[styles.card, style]} scaleTo={0.96}>
      <View style={[styles.iconBox, { backgroundColor: t.bg, borderColor: t.border }]}>
        <Ionicons name={icon} size={20} color={t.fg} />
      </View>
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={14} color={GiveNetTheme.textMuted} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    minWidth: 140,
    flexGrow: 1,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    minHeight: 126,
    justifyContent: 'flex-start',
    ...Shadow.soft,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  chevron: {
    position: 'absolute',
    top: 16,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Type.bodyStrong,
    fontSize: 13.5,
    color: GiveNetTheme.textPrimary,
  },
  subtitle: {
    ...Type.caption,
    fontWeight: '600',
    color: GiveNetTheme.textMuted,
    marginTop: 2,
  },
});