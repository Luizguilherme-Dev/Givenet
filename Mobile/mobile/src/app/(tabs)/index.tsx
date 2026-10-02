import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { OngCard } from '@/components/OngCard';
import { GiveNetTheme } from '@/constants/colors';
import { Glass, Radius, Shadow, Space, TabBarSpace, Type } from '@/constants/design';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Ong } from '@/types';
import {
  ActionTile,
  Badge,
  FadeInView,
  Gradient,
  Gradients,
  PressableScale,
  SectionHeader,
} from '@/components/ui';export default function HomeScreen() {
  const router = useRouter();
  const { usuario, isAuthenticated, isAdmin, isOng } = useAuth();
  const podeConfirmarEntrega = isAdmin || isOng;
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

  const passos = [
    {
      num: '01',
      titulo: 'Crie sua conta',
      desc: 'Cadastro gratuito em menos de 1 minuto.',
      icon: 'person-add-outline' as const,
    },
    {
      num: '02',
      titulo: 'Escolha uma ONG',
      desc: 'Encontre a causa que deseja apoiar.',
      icon: 'business-outline' as const,
    },
    {
      num: '03',
      titulo: 'Registre a doação',
      desc: 'Informe os itens e receba o PIN de confirmação.',
      icon: 'gift-outline' as const,
    },
    {
      num: '04',
      titulo: 'Agende a coleta',
      desc: 'Escolha o horário e acompanhe o status.',
      icon: 'calendar-outline' as const,
    },
  ];

  const primeiroNome = usuario?.nome?.split(' ')[0];

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
        {/* SAUDAÇÃO — exibida apenas para usuários autenticados */}
        {isAuthenticated && (
          <FadeInView style={styles.greetingCard}>
            <View style={styles.greetingAvatar}>
              <Text style={styles.greetingAvatarText}>
                {primeiroNome ? primeiroNome.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.greetingTexts}>
              <Text style={styles.greetingHello} numberOfLines={1}>
                Olá, {primeiroNome}! 👋
              </Text>
              <Text style={styles.greetingSub} numberOfLines={2}>
                Obrigado por transformar vidas com suas doações.
              </Text>
            </View>
            <Badge label="Ativo" tone="success" dot small />
          </FadeInView>
        )}

        {/* HERO */}
        <Gradient
          colors={Gradients.hero}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroGlow} pointerEvents="none" />

          <Badge label="Plataforma 100% gratuita" tone="primary" icon="sparkles" />

          <Text style={styles.heroTitle}>
            Doe com propósito.{'\n'}
            <Text style={styles.heroTitleHighlight}>Transforme vidas.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Conectamos doadores a ONGs verificadas de forma simples, rápida e transparente. Sua
            ajuda chega a quem realmente precisa.
          </Text>

          <View style={styles.heroActions}>
            <PressableScale
              onPress={() => router.push('/(tabs)/doacao')}
              containerStyle={styles.heroPrimaryWrap}
              style={styles.heroPrimaryBtn}
              scaleTo={0.97}
            >
              <Ionicons name="heart" size={19} color={GiveNetTheme.primaryDark} />
              <Text style={styles.heroPrimaryText}>Fazer doação</Text>
            </PressableScale>

            <PressableScale
              onPress={() => router.push('/(tabs)/ongs')}
              containerStyle={styles.heroSecondaryWrap}
              style={styles.heroSecondaryBtn}
              scaleTo={0.97}
            >
              <Text style={styles.heroSecondaryText}>Ver ONGs</Text>
              <Ionicons name="arrow-forward" size={16} color={GiveNetTheme.textPrimary} />
            </PressableScale>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{ongs.length || 3}</Text>
              <Text style={styles.heroMetricLabel}>ONGs parceiras</Text>
            </View>
            <View style={styles.heroMetricSeparator} />
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>4</Text>
              <Text style={styles.heroMetricLabel}>Passos</Text>
            </View>
            <View style={styles.heroMetricSeparator} />
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>PIN</Text>
              <Text style={styles.heroMetricLabel}>Entrega segura</Text>
            </View>
          </View>
        </Gradient>

        {/* AÇÕES RÁPIDAS */}
        <SectionHeader
          title="Acesso rápido"
          subtitle="Tudo o que você precisa em um toque"
          icon="flash"
        />

        <View style={styles.actionsGrid}>
          <ActionTile
            title="Nova doação"
            subtitle="Agendar coleta"
            icon="gift"
            tone="primary"
            onPress={() => router.push('/(tabs)/doacao')}
          />
          <ActionTile
            title="ONGs parceiras"
            subtitle="Conhecer causas"
            icon="business"
            tone="accent"
            onPress={() => router.push('/(tabs)/ongs')}
          />
          <ActionTile
            title="Assistente IA"
            subtitle="Tirar dúvidas"
            icon="chatbubbles"
            tone="secondary"
            onPress={() => router.push('/(tabs)/chat')}
          />
          <ActionTile
            title={podeConfirmarEntrega ? 'Validar PIN' : 'Dúvidas FAQ'}
            subtitle={podeConfirmarEntrega ? 'Painel ONG/Admin' : 'Perguntas frequentes'}
            icon={podeConfirmarEntrega ? 'shield-checkmark' : 'help-circle'}
            tone="success"
            onPress={() => {
              if (podeConfirmarEntrega) {
                router.push('/confirmar');
              } else {
                router.push('/faq');
              }
            }}
          />
        </View>

        {/* COMO FUNCIONA */}
        <SectionHeader
          title="Como funciona"
          subtitle="Doe em 4 passos, sem burocracia"
          icon="git-branch"
        />

        <View style={styles.stepsCard}>
          {passos.map((passo, index) => (
            <View
              key={passo.num}
              style={[styles.stepRow, index === passos.length - 1 && styles.stepRowLast]}
            >
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>{passo.num}</Text>
              </View>
              <View style={styles.stepInfo}>
                <View style={styles.stepTitleRow}>
                  <Ionicons name={passo.icon} size={14} color={GiveNetTheme.primaryLight} />
                  <Text style={styles.stepTitle}>{passo.titulo}</Text>
                </View>
                <Text style={styles.stepDesc}>{passo.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ONGs EM DESTAQUE */}
        <SectionHeader
          title="ONGs em destaque"
          subtitle="Causas que precisam do seu apoio"
          icon="heart"
          actionLabel="Ver todas"
          onActionPress={() => router.push('/(tabs)/ongs')}
        />

        {ongs.length === 0 ? (
          <View style={styles.emptyOngs}>
            <Ionicons name="business-outline" size={26} color={GiveNetTheme.textMuted} />
            <Text style={styles.emptyOngsTitle}>Carregando instituições parceiras</Text>
            <Text style={styles.emptyOngsText}>
              Puxe a tela para baixo para atualizar a lista de ONGs.
            </Text>
          </View>
        ) : (
          <View style={styles.ongsList}>
            {ongs.slice(0, 3).map((ong) => (
              <OngCard
                key={ong.id}
                ong={ong}
                onDoarPress={(selecionada) =>
                  router.push(`/(tabs)/doacao?ongId=${selecionada.id}` as any)
                }
              />
            ))}
          </View>
        )}

        {/* CENTRAL DE AJUDA */}
        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <View style={styles.helpIconBox}>
              <Ionicons name="chatbubble-ellipses" size={18} color={GiveNetTheme.primaryLight} />
            </View>
            <View style={styles.helpHeaderTexts}>
              <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
              <Text style={styles.helpSubtitle}>
                Consulte as perguntas frequentes ou fale com nosso assistente virtual.
              </Text>
            </View>
          </View>

          <View style={styles.helpActions}>
            <PressableScale
              onPress={() => router.push('/faq')}
              style={styles.helpPrimaryBtn}
              scaleTo={0.97}
            >
              <Ionicons name="help-circle-outline" size={15} color="#FFFFFF" />
              <Text style={styles.helpPrimaryText}>Perguntas frequentes</Text>
            </PressableScale>

            <PressableScale
              onPress={() => router.push('/sobre')}
              style={styles.helpSecondaryBtn}
              scaleTo={0.97}
            >
              <Text style={styles.helpSecondaryText}>Sobre o GiveNet</Text>
            </PressableScale>
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <Ionicons name="heart" size={13} color={GiveNetTheme.primaryLight} />
            <Text style={styles.footerBrand}>GiveNet</Text>
          </View>
          <Text style={styles.footerText}>Conectando solidariedade através da tecnologia.</Text>
        </View>
      </ScrollView>
    </View>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GiveNetTheme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    paddingBottom: TabBarSpace,
  },

  /* ---- Saudação ---- */
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: Glass.neutral,
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: Radius.lg,
    padding: Space.md,
    marginBottom: Space.lg,
  },
  greetingAvatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: GiveNetTheme.primaryDark,
    borderWidth: 2,
    borderColor: GiveNetTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  greetingTexts: {
    flex: 1,
  },
  greetingHello: {
    ...Type.subheading,
    color: GiveNetTheme.textPrimary,
  },
  greetingSub: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
  },

  /* ---- Hero ---- */
  hero: {
    borderRadius: Radius.xl,
    padding: Space.xl,
    borderWidth: 1,
    borderColor: Glass.borderPrimary,
    marginBottom: Space.xxl,
    overflow: 'hidden',
    ...Shadow.glow,
  },
  heroGlow: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
  },
  heroTitle: {
    ...Type.display,
    color: GiveNetTheme.textPrimary,
    lineHeight: 32,
    marginTop: Space.md,
  },
  heroTitleHighlight: {
    color: '#E9D5FF',
  },
  heroSubtitle: {
    ...Type.body,
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 19,
    marginTop: Space.sm,
    marginBottom: Space.lg,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'stretch',
  },
  heroPrimaryWrap: {
    flex: 1.3,
  },
  heroSecondaryWrap: {
    flex: 1,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
  },
  heroPrimaryText: {
    ...Type.subheading,
    color: GiveNetTheme.primaryDark,
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 52,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  heroSecondaryText: {
    ...Type.subheading,
    color: GiveNetTheme.textPrimary,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Glass.border,
    marginVertical: Space.lg,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetric: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricValue: {
    ...Type.heading,
    color: GiveNetTheme.textPrimary,
  },
  heroMetricLabel: {
    ...Type.caption,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    textAlign: 'center',
  },
  heroMetricSeparator: {
    width: 1,
    height: 26,
    backgroundColor: Glass.border,
  },

  /* ---- Ações rápidas ---- */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
    marginBottom: Space.xxl,
  },

  /* ---- Como funciona ---- */
  stepsCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: Space.xxxl,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.lg,
    borderBottomWidth: 1,
    borderBottomColor: GiveNetTheme.border,
  },
  stepRowLast: {
    borderBottomWidth: 0,
  },
  stepNumBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderWidth: 1,
    borderColor: Glass.borderPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    ...Type.bodyStrong,
    fontSize: 12,
    color: GiveNetTheme.primaryLight,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepTitle: {
    ...Type.bodyStrong,
    color: GiveNetTheme.textPrimary,
  },
  stepDesc: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  /* ---- ONGs em destaque ---- */
  ongsList: {
    marginBottom: Space.xxl,
  },
  emptyOngs: {
    alignItems: 'center',
    padding: Space.xl,
    gap: 6,
    marginBottom: Space.xxl,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  emptyOngsTitle: {
    ...Type.bodyStrong,
    color: GiveNetTheme.textPrimary,
  },
  emptyOngsText: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textMuted,
    textAlign: 'center',
  },

  /* ---- Central de ajuda ---- */
  helpCard: {
    padding: Space.lg,
    marginBottom: Space.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Glass.borderPrimary,
    backgroundColor: Glass.tint,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
  helpIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
    borderWidth: 1,
    borderColor: Glass.borderPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpHeaderTexts: {
    flex: 1,
  },
  helpTitle: {
    ...Type.heading,
    color: GiveNetTheme.textPrimary,
  },
  helpSubtitle: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  helpActions: {
    flexDirection: 'row',
    gap: Space.sm,
    marginTop: Space.lg,
  },
  helpPrimaryBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: GiveNetTheme.primary,
  },
  helpPrimaryText: {
    ...Type.caption,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  helpSecondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  helpSecondaryText: {
    ...Type.caption,
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
  },

  /* ---- Rodapé ---- */
  footer: {
    alignItems: 'center',
    paddingTop: Space.lg,
    borderTopWidth: 1,
    borderTopColor: GiveNetTheme.border,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerBrand: {
    ...Type.caption,
    fontWeight: '800',
    color: GiveNetTheme.textSecondary,
  },
  footerText: {
    ...Type.caption,
    fontSize: 10.5,
    fontWeight: '500',
    color: GiveNetTheme.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});