import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Chip de seleção (itens aceitos, horários, categorias). Apenas visual. */
export const Chip: React.FC<Props> = ({ label, icon, selected = false, onPress, style }) => {
  return (
    <View
      onTouchEnd={onPress}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={12}
          color={selected ? '#FFFFFF' : GiveNetTheme.textMuted}
        />
      ) : null}
      <Text style={[styles.text, selected && styles.textSelected]} numberOfLines={1}>
        {label}
      </Text>
      {selected ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1.5,
    borderColor: GiveNetTheme.border,
    minHeight: 38,
  },
  chipSelected: {
    backgroundColor: GiveNetTheme.primary,
    borderColor: GiveNetTheme.primaryLight,
  },
  text: {
    ...Type.caption,
    fontWeight: '700',
    color: GiveNetTheme.textSecondary,
  },
  textSelected: {
    color: '#FFFFFF',
  },
});