import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';

export default function SobreScreen() {
  const router = useRouter();

  const diferenciais = [
    {
      icon: 'sparkles' as const,
      title: '100% Gratuito',
      desc: 'Sem taxas para doadores ou ONGs em nenhuma etapa.',
      color: GiveNetTheme.primaryLight,
    },
    {
      icon: 'shield-checkmark' as const,
      title: 'ONGs Verificadas',
      desc: 'Todas as instituições passam por rigorosa validação cadastral.',
      color: GiveNetTheme.success,
    },
    {
      icon: 'qr-code' as const,
      title: 'Validação por PIN & QR',
      desc: 'Segurança e rastreabilidade ponta a ponta na entrega.',
      color: GiveNetTheme.accent,
    },
    {
      icon: 'chatbubbles' as const,
      title: 'Assistente Dedicado',
      desc: 'Suporte inteligente para esclarecer qualquer dúvida.',
      color: GiveNetTheme.secondary,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={GiveNetTheme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Sobre o GiveNet</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Hero */}
        <View style={styles.heroCard}>
          <View style={styles.logoBadge}>
            <Ionicons name="heart" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Conectando Solidariedade</Text>
          <Text style={styles.heroSub}>
            O GiveNet nasceu para transformar o ato de doar em uma experiência simples,
            segura e transparente através da tecnologia.
          </Text>
        </View>

        {/* Missão */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag-outline" size={20} color={GiveNetTheme.primaryLight} />
            <Text style={styles.cardTitle}>Nossa Missão</Text>
          </View>
          <Text style={styles.cardBody}>
            Facilitar o processo de doação, conectando diretamente pessoas dispostas a ajudar
            com organizações da sociedade civil que atuam em causas cruciais: combate à fome,
            educação de qualidade, proteção ao meio ambiente e reabilitação física.
          </Text>
        </View>

        {/* Como Funciona o Ecossistema */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="git-network-outline" size={20} color={GiveNetTheme.accent} />
            <Text style={styles.cardTitle}>O Ecossistema GiveNet</Text>
          </View>
          <Text style={styles.cardBody}>
            Nossa plataforma integra um backend Spring Boot robusto, banco de dados relacional
            e aplicativos multiplataforma para assegurar que cada item doado seja registrado,
            acompanhado por código PIN único e confirmado na entrega.
          </Text>
        </View>

        {/* Diferenciais */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Por que GiveNet?</Text>
        </View>

        <View style={styles.grid}>
          {diferenciais.map((d, idx) => (
            <View key={idx} style={styles.gridCard}>
              <View style={[styles.gridIconBox, { backgroundColor: `${d.color}20` }]}>
                <Ionicons name={d.icon} size={22} color={d.color} />
              </View>
              <Text style={styles.gridTitle}>{d.title}</Text>
              <Text style={styles.gridDesc}>{d.desc}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Faça parte dessa transformação!</Text>
          <Text style={styles.ctaSub}>
            Sua doação faz a diferença na vida de quem mais precisa.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/(tabs)/doacao')}
          >
            <Ionicons name="heart" size={18} color="#FFFFFF" />
            <Text style={styles.ctaBtnText}>Fazer Doação Agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GiveNetTheme.background,
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    marginBottom: 16,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  card: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  cardBody: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gridCard: {
    width: '48%',
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  gridIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 11,
    color: GiveNetTheme.textMuted,
    lineHeight: 15,
  },
  ctaCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  ctaSub: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
