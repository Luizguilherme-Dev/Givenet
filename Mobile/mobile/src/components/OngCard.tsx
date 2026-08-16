import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Ong } from '@/types';

interface Props {
  ong: Ong;
  onDoarPress?: (ong: Ong) => void;
  onDetalhesPress?: (ong: Ong) => void;
}

export const OngCard: React.FC<Props> = ({ ong, onDoarPress, onDetalhesPress }) => {
  const router = useRouter();

  const handleCardPress = () => {
    if (onDetalhesPress) {
      onDetalhesPress(ong);
    } else {
      router.push(`/ong/${ong.id}` as any);
    }
  };

  const tiposAceitos: string[] = Array.isArray(ong.tiposAceitos)
    ? (ong.tiposAceitos as string[])
    : typeof ong.tiposAceitos === 'string'
    ? (ong.tiposAceitos as string).split(',').map((t) => t.trim())
    : ['Alimentos', 'Roupas'];

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: ong.cor || GiveNetTheme.border }]}
      onPress={handleCardPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: ong.corClara || 'rgba(124, 58, 237, 0.2)' },
          ]}
        >
          <Text style={styles.iconText}>{ong.icon || '🏢'}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.ongName}>{ong.nome}</Text>
          <View style={styles.metaRow}>
            {ong.sede && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={11} color={GiveNetTheme.textMuted} />
                <Text style={styles.metaText}>{ong.sede}</Text>
              </View>
            )}
            {ong.fundacao && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={11} color={GiveNetTheme.textMuted} />
                <Text style={styles.metaText}>Desde {ong.fundacao}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Sobre / Descrição curta */}
      <Text style={styles.sobreText} numberOfLines={2}>
        {ong.sobre || 'Organização parceira verificada GiveNet.'}
      </Text>

      {/* Tags de itens aceitos */}
      <View style={styles.tagsContainer}>
        {tiposAceitos.slice(0, 3).map((tipo, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{tipo}</Text>
          </View>
        ))}
        {tiposAceitos.length > 3 && (
          <View style={styles.tagMore}>
            <Text style={styles.tagMoreText}>+{tiposAceitos.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Rodapé do Card com Ações */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.btnDetalhes}
          onPress={handleCardPress}
          activeOpacity={0.7}
        >
          <Text style={styles.btnDetalhesText}>Ver Detalhes</Text>
          <Ionicons name="chevron-forward" size={14} color={GiveNetTheme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnDoar, { backgroundColor: ong.cor || GiveNetTheme.primary }]}
          onPress={() => onDoarPress && onDoarPress(ong)}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={14} color="#FFFFFF" />
          <Text style={styles.btnDoarText}>Doar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  infoCol: {
    flex: 1,
  },
  ongName: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: GiveNetTheme.textMuted,
  },
  sobreText: {
    fontSize: 12.5,
    color: GiveNetTheme.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: GiveNetTheme.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  tagText: {
    fontSize: 11,
    color: GiveNetTheme.textSecondary,
    fontWeight: '600',
  },
  tagMore: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagMoreText: {
    fontSize: 11,
    color: GiveNetTheme.primaryLight,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: GiveNetTheme.border,
    paddingTop: 10,
  },
  btnDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  btnDetalhesText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontWeight: '600',
  },
  btnDoar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  btnDoarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
