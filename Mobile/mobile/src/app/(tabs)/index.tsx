import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { OngCard } from '@/components/OngCard';
import { GiveNetTheme } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Ong } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { usuario, isAuthenticated, isAdmin } = useAuth();
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await ApiService.getOngs();
      setOngs(data);
    } catch (e) {
      console.error('Erro ao buscar ONGs na Home:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const steps = [
    {
      num: '01',
      title: 'Crie sua conta',
      desc: 'Cadastre-se gratuitamente em menos de 1 minuto no GiveNet.',
      icon: 'person-add-outline' as const,
    },
    {
      num: '02',
      title: 'Escolha uma ONG',
      desc: 'Navegue pelas ONGs parceiras e escolha a causa que deseja apoiar.',
      icon: 'business-outline' as const,
    },
    {
      num: '03',
      title: 'Registre a doação',
      desc: 'Informe o que deseja doar e receba um PIN de confirmação.',
      icon: 'gift-outline' as const,
    },
    {
      num: '04',
      title: 'Agende a coleta',
      desc: 'Defina o horário e conclua com transparência e segurança.',
      icon: 'calendar-outline' as const,
    },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={GiveNetTheme.primaryLight}
            colors={[GiveNetTheme.primaryLight]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de boas-vindas do usuário */}
        {isAuthenticated && (
          <View style={styles.welcomeBanner}>
            <View style={styles.welcomeTextCol}>
              <Text style={styles.welcomeGreeting}>
                Olá, {usuario?.nome?.split(' ')[0]}! 👋
              </Text>
              <Text style={styles.welcomeSub}>
                Obrigado por transformar vidas com suas doações.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.welcomeActionBtn}
              onPress={() => router.push('/(tabs)/doacao')}
            >
              <Text style={styles.welcomeActionText}>Doar</Text>
              <Ionicons name="heart" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* HERO SECTION */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>Plataforma 100% gratuita</Text>
          </View>

          <Text style={styles.heroTitle}>
            Doe com propósito.{'\n'}
            <Text style={styles.heroTitleHighlight}>Transforme vidas.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            O GiveNet conecta doadores a ONGs verificadas de forma simples, rápida
            e transparente. Sua ajuda chega a quem realmente precisa.
          </Text>

          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.heroPrimaryBtn}
              onPress={() => router.push('/(tabs)/doacao')}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={18} color="#FFFFFF" />
              <Text style={styles.heroPrimaryBtnText}>Fazer Doação</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => router.push('/(tabs)/ongs')}
              activeOpacity={0.8}
            >
              <Text style={styles.heroSecondaryBtnText}>Ver ONGs →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ATALHOS RÁPIDOS */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/doacao')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
              <Ionicons name="gift" size={22} color={GiveNetTheme.primaryLight} />
            </View>
            <Text style={styles.quickTitle}>Nova Doação</Text>
            <Text style={styles.quickDesc}>Agendar coleta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/ongs')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.2)' }]}>
              <Ionicons name="business" size={22} color={GiveNetTheme.accent} />
            </View>
            <Text style={styles.quickTitle}>ONGs Parceiras</Text>
            <Text style={styles.quickDesc}>Conhecer causas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/chat')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
              <Ionicons name="chatbubbles" size={22} color={GiveNetTheme.secondary} />
            </View>
            <Text style={styles.quickTitle}>Assistente IA</Text>
            <Text style={styles.quickDesc}>Tirar dúvidas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => {
              if (isAdmin) {
                router.push('/confirmar');
              } else {
                router.push('/faq');
              }
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'help-circle'}
                size={22}
                color={GiveNetTheme.success}
              />
            </View>
            <Text style={styles.quickTitle}>{isAdmin ? 'Validar PIN' : 'Dúvidas FAQ'}</Text>
            <Text style={styles.quickDesc}>{isAdmin ? 'Painel Admin' : 'Perguntas'}</Text>
          </TouchableOpacity>
        </View>

        {/* CONTADORES DE IMPACTO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nosso Impacto</Text>
          <Text style={styles.sectionSubtitle}>Resultados que transformam o Brasil</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            valor="12.400+"
            label="Doações realizadas"
            iconName="heart-circle"
            color={GiveNetTheme.primaryLight}
          />
          <StatCard
            valor={`${ongs.length || 5}`}
            label="ONGs parceiras"
            iconName="business"
            color={GiveNetTheme.accent}
          />
          <StatCard
            valor="8.200+"
            label="Famílias atendidas"
            iconName="people"
            color={GiveNetTheme.secondary}
          />
          <StatCard
            valor="100%"
            label="Gratuito e seguro"
            iconName="shield-checkmark"
            color={GiveNetTheme.success}
          />
        </View>

        {/* COMO FUNCIONA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Como Funciona</Text>
          <Text style={styles.sectionSubtitle}>Doe em 4 passos simples e sem burocracia</Text>
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>{step.num}</Text>
              </View>
              <View style={styles.stepInfo}>
                <View style={styles.stepTitleRow}>
                  <Ionicons name={step.icon} size={16} color={GiveNetTheme.primaryLight} />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ONGs EM DESTAQUE */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>ONGs em Destaque</Text>
            <Text style={styles.sectionSubtitle}>Causas que precisam do seu apoio</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/ongs')}>
            <Text style={styles.seeAllText}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ongsContainer}>
          {ongs.slice(0, 3).map((ong) => (
            <OngCard
              key={ong.id}
              ong={ong}
              onDoarPress={() => router.push('/(tabs)/doacao')}
            />
          ))}
        </View>

        {/* BANNER INFORMATIVO / FAQ */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIconBox}>
            <Ionicons name="information-circle" size={28} color={GiveNetTheme.primaryLight} />
          </View>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Tem alguma dúvida?</Text>
            <Text style={styles.infoBannerText}>
              Consulte nossa central de perguntas frequentes ou converse com nosso assistente virtual.
            </Text>
            <View style={styles.infoBannerBtns}>
              <TouchableOpacity
                style={styles.infoBannerBtn}
                onPress={() => router.push('/faq')}
              >
                <Text style={styles.infoBannerBtnText}>Perguntas Frequentes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.infoBannerBtnOutline}
                onPress={() => router.push('/sobre')}
              >
                <Text style={styles.infoBannerBtnOutlineText}>Sobre o GiveNet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>GiveNet • Plataforma de Doações</Text>
          <Text style={styles.footerCopyright}>
            Conectando solidariedade através da tecnologia.
          </Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  welcomeTextCol: {
    flex: 1,
    marginRight: 10,
  },
  welcomeGreeting: {
    fontSize: 15,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  welcomeSub: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
  },
  welcomeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  welcomeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    marginBottom: 18,
    shadowColor: GiveNetTheme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
    lineHeight: 30,
    marginBottom: 8,
  },
  heroTitleHighlight: {
    color: GiveNetTheme.primaryLight,
  },
  heroSubtitle: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    lineHeight: 19,
    marginBottom: 18,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GiveNetTheme.primary,
    height: 46,
    borderRadius: 14,
  },
  heroPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  heroSecondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GiveNetTheme.cardSecondary,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  heroSecondaryBtnText: {
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickCard: {
    width: '48%',
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  quickIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  quickDesc: {
    fontSize: 11,
    color: GiveNetTheme.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    color: GiveNetTheme.primaryLight,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    gap: 14,
  },
  stepNumBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '900',
    color: GiveNetTheme.primaryLight,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
    lineHeight: 16,
  },
  ongsContainer: {
    marginBottom: 20,
  },
  infoBanner: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  infoBannerIconBox: {
    marginTop: 2,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  infoBannerBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoBannerBtn: {
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoBannerBtnOutline: {
    backgroundColor: GiveNetTheme.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  infoBannerBtnOutlineText: {
    color: GiveNetTheme.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: GiveNetTheme.border,
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.textSecondary,
  },
  footerCopyright: {
    fontSize: 11,
    color: GiveNetTheme.textMuted,
    marginTop: 4,
  },
});
