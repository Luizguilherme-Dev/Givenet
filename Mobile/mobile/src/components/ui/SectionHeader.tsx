import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';
import { PressableScale } from './PressableScale';

interface Props {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

/** Cabeçalho de seção com hierarquia clara. Somente visual. */
export const SectionHeader: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  iconColor = GiveNetTheme.primaryLight,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon && (
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={14} color={iconColor} />
          </View>
        )}
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {actionLabel && onActionPress ? (
        <PressableScale onPress={onActionPress} style={styles.action} scaleTo={0.94}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={13} color={GiveNetTheme.primaryLight} />
        </PressableScale>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.xs,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
  },
  title: {
    ...Type.heading,
    color: GiveNetTheme.textPrimary,
  },
  subtitle: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textMuted,
    marginTop: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(124, 58, 237, 0.14)',
  },
  actionText: {
    ...Type.caption,
    fontWeight: '800',
    color: GiveNetTheme.primaryLight,
  },
});