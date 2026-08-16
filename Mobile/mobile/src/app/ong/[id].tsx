import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { ApiService } from '@/services/api';
import { Ong } from '@/types';

export default function OngDetalheScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [ong, setOng] = useState<Ong | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (id) {
        try {
          const data = await ApiService.getOng(Number(id));
          setOng(data);
        } catch (e) {
          console.error('Erro ao buscar detalhes da ONG:', e);
        } finally {
          setLoading(false);
        }
      }
    }
    carregar();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={GiveNetTheme.primaryLight} />
        <Text style={styles.loadingText}>Carregando informações da ONG...</Text>
      </View>
    );
  }

  if (!ong) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.notFoundText}>ONG não encontrada.</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
          <Text style={styles.backHomeBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tiposAceitos = Array.isArray(ong.tiposAceitos)
    ? ong.tiposAceitos
    : typeof ong.tiposAceitos === 'string'
      ? (ong.tiposAceitos as string).split(',').map((t) => t.trim())
      : ['Alimentos', 'Roupas'];

  const horarios = Array.isArray(ong.horarios)
    ? ong.horarios
    : typeof ong.horarios === 'string'
      ? (ong.horarios as string).split(',').map((h) => h.trim())
      : ['09:00', '14:00'];

  return (
    <View style={styles.container}>
      {/* Topo com botão voltar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={GiveNetTheme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {ong.nome}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={[styles.heroCard, { borderColor: ong.cor || GiveNetTheme.border }]}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: ong.corClara || 'rgba(124, 58, 237, 0.2)' },
            ]}
          >
            <Text style={styles.iconText}>{ong.icon || '🏢'}</Text>
          </View>

          <Text style={styles.heroName}>{ong.nome}</Text>

          <View style={styles.metaRow}>
            {ong.sede && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={13} color={GiveNetTheme.textSecondary} />
                <Text style={styles.metaText}>{ong.sede}</Text>
              </View>
            )}
            {ong.fundacao && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={GiveNetTheme.textSecondary} />
                <Text style={styles.metaText}>Fundada em {ong.fundacao}</Text>
              </View>
            )}
            {ong.funcionarios && (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={13} color={GiveNetTheme.textSecondary} />
                <Text style={styles.metaText}>{ong.funcionarios}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Números / Impacto */}
        {ong.numeros && ong.numeros.length > 0 && (
          <View style={styles.numerosRow}>
            {ong.numeros.map((n, idx) => (
              <View key={idx} style={styles.numeroCard}>
                <Text style={[styles.numeroVal, { color: ong.cor || GiveNetTheme.primaryLight }]}>
                  {n.valor}
                </Text>
                <Text style={styles.numeroLabel}>{n.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Sobre */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={18} color={GiveNetTheme.primaryLight} />
            <Text style={styles.sectionTitle}>Sobre a Organização</Text>
          </View>
          <Text style={styles.bodyText}>
            {ong.sobre || 'Informações institucionais não disponíveis.'}
          </Text>
        </View>

        {/* História */}
        {ong.historia && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={18} color={GiveNetTheme.secondary} />
              <Text style={styles.sectionTitle}>História & Fundação</Text>
            </View>
            <Text style={styles.bodyText}>{ong.historia}</Text>
          </View>
        )}

        {/* O que aceita */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift-outline" size={18} color={GiveNetTheme.accent} />
            <Text style={styles.sectionTitle}>Doações Aceitas</Text>
          </View>
          <View style={styles.chipsWrap}>
            {tiposAceitos.map((tipo, idx) => (
              <View key={idx} style={styles.chip}>
                <Ionicons name="checkmark-circle" size={13} color={GiveNetTheme.success} />
                <Text style={styles.chipText}>{tipo}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Horários */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={18} color={GiveNetTheme.warning} />
            <Text style={styles.sectionTitle}>Horários de Coleta</Text>
          </View>
          <View style={styles.chipsWrap}>
            {horarios.map((h, idx) => (
              <View key={idx} style={styles.horarioChip}>
                <Text style={styles.horarioText}>{h}h</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contato Oficial */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={18} color={GiveNetTheme.success} />
            <Text style={styles.sectionTitle}>Contato Oficial</Text>
          </View>

          {ong.email && (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(`mailto:${ong.email}`)}
            >
              <Ionicons name="mail-outline" size={16} color={GiveNetTheme.primaryLight} />
              <Text style={styles.contactText}>{ong.email}</Text>
            </TouchableOpacity>
          )}

          {ong.telefone && (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(`tel:${ong.telefone}`)}
            >
              <Ionicons name="call-outline" size={16} color={GiveNetTheme.primaryLight} />
              <Text style={styles.contactText}>{ong.telefone}</Text>
            </TouchableOpacity>
          )}

          {ong.site && (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(ong.site!)}
            >
              <Ionicons name="globe-outline" size={16} color={GiveNetTheme.primaryLight} />
              <Text style={styles.contactLink}>{ong.site} ↗</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Botão Fixo de Doação */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.donateCTA, { backgroundColor: ong.cor || GiveNetTheme.primary }]}
          onPress={() => router.push('/(tabs)/doacao')}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={20} color="#FFFFFF" />
          <Text style={styles.donateCTAText}>Fazer Doação para {ong.nome}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GiveNetTheme.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: GiveNetTheme.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  notFoundText: {
    color: GiveNetTheme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  backHomeBtn: {
    marginTop: 14,
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GiveNetTheme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: GiveNetTheme.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GiveNetTheme.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 34,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontWeight: '600',
  },
  numerosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  numeroCard: {
    flex: 1,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  numeroVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  numeroLabel: {
    fontSize: 10,
    color: GiveNetTheme.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  bodyText: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    lineHeight: 20,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 12,
    color: GiveNetTheme.textPrimary,
    fontWeight: '600',
  },
  horarioChip: {
    backgroundColor: GiveNetTheme.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  horarioText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
  },
  contactLink: {
    fontSize: 13,
    color: GiveNetTheme.primaryLight,
    fontWeight: '700',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: GiveNetTheme.cardBackground,
    borderTopWidth: 1,
    borderTopColor: GiveNetTheme.border,
  },
  donateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  donateCTAText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
