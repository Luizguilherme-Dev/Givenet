import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { GiveNetTheme } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Doacao } from '@/types';
import { ModalServerConfig } from '@/components/ModalServerConfig';

export default function PerfilScreen() {
  const router = useRouter();
  const { usuario, isAuthenticated, isAdmin, isOng, logout } = useAuth();
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);

  const carregarDados = async () => {
    if (!usuario?.id) return;
    try {
      const data = await ApiService.getDoacoesUsuario(usuario.id);
      setDoacoes(data || []);
    } catch (e) {
      console.error('Erro ao buscar dados do perfil:', e);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [usuario?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sair da Conta', 'Deseja realmente sair da sua conta GiveNet?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim, Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  // ONGs únicas apoiadas
  const ongsApoiadas = [
    ...new Set(
      doacoes
        .map((d) => (typeof d.ong === 'object' ? d.ong?.nome : d.ong))
        .filter(Boolean)
    ),
  ];

  const ultimaDoacao =
    doacoes.length > 0
      ? new Date(doacoes[doacoes.length - 1].data).toLocaleDateString('pt-BR')
      : '—';

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
        {isAuthenticated ? (
          <>
            {/* Header do Usuário */}
            <View style={styles.userCard}>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarBigText}>
                  {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>

              <View style={styles.userInfoCol}>
                <Text style={styles.userName}>{usuario?.nome}</Text>
                <Text style={styles.userEmail}>{usuario?.email}</Text>
                {usuario?.telefone && (
                  <Text style={styles.userPhone}>📞 {usuario.telefone}</Text>
                )}

                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {isAdmin ? 'ADMINISTRADOR' : isOng ? 'REPRESENTANTE ONG' : 'DOADOR'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Estatísticas do Usuário */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{doacoes.length}</Text>
                <Text style={styles.statLabel}>Doações feitas</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{ongsApoiadas.length}</Text>
                <Text style={styles.statLabel}>ONGs apoiadas</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{ultimaDoacao}</Text>
                <Text style={styles.statLabel}>Última doação</Text>
              </View>
            </View>

            {/* ONGs Apoiadas */}
            {ongsApoiadas.length > 0 && (
              <View style={styles.sectionBox}>
                <Text style={styles.sectionBoxTitle}>💜 Causas que você apoiou</Text>
                <View style={styles.ongsTags}>
                  {ongsApoiadas.map((nome, idx) => (
                    <View key={idx} style={styles.ongTag}>
                      <Text style={styles.ongTagText}>{nome}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestIconBox}>
              <Ionicons name="person-circle-outline" size={64} color={GiveNetTheme.primaryLight} />
            </View>
            <Text style={styles.guestTitle}>Bem-vindo ao GiveNet</Text>
            <Text style={styles.guestSub}>
              Crie uma conta ou entre para acompanhar suas doações e gerenciar coletas.
            </Text>
            <View style={styles.guestActions}>
              <TouchableOpacity
                style={styles.guestBtnPrimary}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.guestBtnPrimaryText}>Entrar na Conta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestBtnSecondary}
                onPress={() => router.push('/cadastro')}
              >
                <Text style={styles.guestBtnSecondaryText}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Menu de Opções / Ações */}
        <View style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>GERAL</Text>

          {(isAdmin || isOng) && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/confirmar')}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="shield-checkmark" size={18} color={GiveNetTheme.success} />
              </View>
              <View style={styles.menuItemTextCol}>
                <Text style={styles.menuItemTitle}>Validar e Confirmar Entregas</Text>
                <Text style={styles.menuItemSub}>Painel do Administrador e ONG</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={GiveNetTheme.textMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/doacao')}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
              <Ionicons name="heart" size={18} color={GiveNetTheme.primaryLight} />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={styles.menuItemTitle}>Minhas Doações</Text>
              <Text style={styles.menuItemSub}>Histórico e agendamentos</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={GiveNetTheme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setServerModalVisible(true)}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(6, 182, 212, 0.2)' }]}>
              <Ionicons name="server-outline" size={18} color={GiveNetTheme.accent} />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={styles.menuItemTitle}>Configuração do Servidor API</Text>
              <Text style={styles.menuItemSub}>Alterar IP do backend Spring Boot</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={GiveNetTheme.textMuted} />
          </TouchableOpacity>

          <Text style={[styles.menuSectionTitle, { marginTop: 16 }]}>INFORMAÇÕES & AJUDA</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/faq')}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Ionicons name="help-circle-outline" size={18} color={GiveNetTheme.warning} />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={styles.menuItemTitle}>Perguntas Frequentes (FAQ)</Text>
              <Text style={styles.menuItemSub}>Tire suas dúvidas sobre coletas e ONGs</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={GiveNetTheme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/sobre')}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
              <Ionicons name="information-circle-outline" size={18} color={GiveNetTheme.secondary} />
            </View>
            <View style={styles.menuItemTextCol}>
              <Text style={styles.menuItemTitle}>Sobre a GiveNet</Text>
              <Text style={styles.menuItemSub}>Nossa missão, valores e impacto</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={GiveNetTheme.textMuted} />
          </TouchableOpacity>

          {isAuthenticated && (
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <Ionicons name="log-out-outline" size={18} color={GiveNetTheme.danger} />
              </View>
              <View style={styles.menuItemTextCol}>
                <Text style={[styles.menuItemTitle, { color: GiveNetTheme.danger }]}>
                  Sair da Conta
                </Text>
                <Text style={styles.menuItemSub}>Desconectar seu usuário do app</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={GiveNetTheme.danger} />
            </TouchableOpacity>
          )}
        </View>

        {/* Versão do Aplicativo */}
        <View style={styles.appVersionBox}>
          <Text style={styles.appVersionText}>GiveNet Mobile • Versão 1.0.0 (Expo v57)</Text>
          <Text style={styles.appVersionSub}>Backend Spring Boot • SQL Server</Text>
        </View>
      </ScrollView>

      <ModalServerConfig
        visible={serverModalVisible}
        onClose={() => setServerModalVisible(false)}
      />
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    marginBottom: 16,
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GiveNetTheme.primaryDark,
    borderWidth: 3,
    borderColor: GiveNetTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBigText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    marginTop: 1,
  },
  userPhone: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: GiveNetTheme.primaryLight,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: GiveNetTheme.primaryLight,
  },
  statLabel: {
    fontSize: 10,
    color: GiveNetTheme.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: 16,
  },
  sectionBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    marginBottom: 10,
  },
  ongsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ongTag: {
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ongTagText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontWeight: '700',
  },
  guestCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: 16,
  },
  guestIconBox: {
    marginBottom: 10,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  guestSub: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  guestActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  guestBtnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  guestBtnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnSecondaryText: {
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  menuSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: GiveNetTheme.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 35, 92, 0.4)',
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 6,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
  },
  menuItemSub: {
    fontSize: 11,
    color: GiveNetTheme.textMuted,
    marginTop: 1,
  },
  appVersionBox: {
    alignItems: 'center',
    marginTop: 24,
  },
  appVersionText: {
    fontSize: 11,
    fontWeight: '600',
    color: GiveNetTheme.textMuted,
  },
  appVersionSub: {
    fontSize: 10,
    color: GiveNetTheme.textPlaceholder,
    marginTop: 2,
  },
});
