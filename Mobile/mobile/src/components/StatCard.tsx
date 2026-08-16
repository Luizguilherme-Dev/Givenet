import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';

interface Props {
  valor: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export const StatCard: React.FC<Props> = ({
  valor,
  label,
  iconName,
  color = GiveNetTheme.primaryLight,
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
        <Ionicons name={iconName} size={20} color={color} />
      </View>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  valor: {
    fontSize: 18,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 11,
    color: GiveNetTheme.textMuted,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
});
