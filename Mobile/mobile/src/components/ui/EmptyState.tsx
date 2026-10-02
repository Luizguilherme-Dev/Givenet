import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Motion, Radius, Type } from '@/constants/design';

interface Props {
  /** Nome do ícone Material/Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  /** Cor de destaque do ícone (padrão: roxo GiveNet) */
  accent?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Estado vazio / informativo com entrada suave.
 * Apenas visual — o botão de ação apenas repassa o handler recebido.
 */
export const EmptyState: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  accent = GiveNetTheme.primaryLight,
  actionLabel,
  onActionPress,
  compact = false,
  style,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: Motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <Animated.View
        style={[
          styles.iconBox,
          { backgroundColor: `${accent}1F`, borderColor: `${accent}44` },
          { opacity: anim, transform: [{ scale }, { translateY }] },
        ]}
      >
        <Ionicons name={icon} size={compact ? 28 : 34} color={accent} />
      </Animated.View>

      <Animated.View style={{ opacity: anim, transform: [{ translateY }], alignItems: 'center' }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {actionLabel && onActionPress ? (
          <View style={styles.actionWrap}>
            <Text style={styles.actionText} onPress={onActionPress} suppressHighlighting>
              {actionLabel}
            </Text>
            <Ionicons name="arrow-forward" size={13} color={GiveNetTheme.primaryLight} />
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: Radius.xl,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  cardCompact: {
    padding: 20,
  },
  iconBox: {
    width: 66,
    height: 66,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    ...Type.heading,
    color: GiveNetTheme.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Type.body,
    color: GiveNetTheme.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(124, 58, 237, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  actionText: {
    ...Type.caption,
    fontWeight: '800',
    color: GiveNetTheme.primaryLight,
  },
});