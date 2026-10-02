import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';

interface Props {
  items: Array<{ label: string; value?: string | null }>;
  style?: StyleProp<ViewStyle>;
}

/** Grid de detalhes (rótulo + valor) — somente apresentação dos dados recebidos. */
export const InfoGrid: React.FC<Props> = ({ items, style }) => {
  const visible = items.filter((i) => i.value !== undefined && i.value !== null && i.value !== '');
  if (visible.length === 0) return null;

  return (
    <View style={[styles.grid, style]}>
      {visible.map((item, idx) => (
        <View key={`${item.label}-${idx}`} style={styles.item}>
          <Text style={styles.label}>{item.label.toUpperCase()}</Text>
          <Text style={styles.value} numberOfLines={2}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

interface RowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
  iconColor?: string;
}

/** Linha de detalhe (rótulo à esquerda, valor à direita). */
export const InfoRow: React.FC<RowProps> = ({ icon, label, value, iconColor = GiveNetTheme.textMuted }) => {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {icon ? <Ionicons name={icon} size={13} color={iconColor} /> : null}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderRadius: Radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  label: {
    ...Type.label,
    fontSize: 9.5,
    color: GiveNetTheme.textMuted,
  },
  value: {
    ...Type.bodyStrong,
    fontSize: 12.5,
    color: GiveNetTheme.textPrimary,
    marginTop: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabel: {
    ...Type.caption,
    fontWeight: '600',
    color: GiveNetTheme.textMuted,
  },
  rowValue: {
    ...Type.bodyStrong,
    fontSize: 12.5,
    color: GiveNetTheme.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
});