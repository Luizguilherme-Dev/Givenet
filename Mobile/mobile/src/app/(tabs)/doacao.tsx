import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { CardDoacao } from '@/components/CardDoacao';
import { GiveNetTheme } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Ong, Doacao, DoacaoDTO } from '@/types';

export default function DoacaoScreen() {
  const router = useRouter();
  const { usuario, isAuthenticated, isAdmin, isOng } = useAuth();

  const [aba, setAba] = useState<'registrar' | 'agendamentos' | 'lista'>('registrar');
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [selectedOng, setSelectedOng] = useState<Ong | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [horario, setHorario] = useState('');
  const [itemDoado, setItemDoado] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const fetchOngs = async () => {
    try {
      const data = await ApiService.getOngs();
      setOngs(data);
      if (data.length > 0 && !selectedOng) {
        setSelectedOng(data[0]);
      }
    } catch (e) {
      console.error('Erro ao carregar ONGs:', e);
    }
  };

  const fetchDoacoes = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      const data = await ApiService.getDoacoesUsuario(usuario.id);
      setDoacoes(data || []);
    } catch (e) {
      console.error('Erro ao carregar doações do usuário:', e);
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    fetchOngs();
  }, []);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      fetchDoacoes();
    }
  }, [usuario, fetchDoacoes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOngs(), fetchDoacoes()]);
    setRefreshing(false);
  };

  const tiposAceitos = selectedOng
    ? Array.isArray(selectedOng.tiposAceitos)
      ? selectedOng.tiposAceitos
      : typeof selectedOng.tiposAceitos === 'string'
        ? (selectedOng.tiposAceitos as string).split(',').map((t) => t.trim())
        : ['Alimentos', 'Roupas']
    : [];

  const horariosDisponiveis = selectedOng
    ? Array.isArray(selectedOng.horarios)
      ? selectedOng.horarios
      : typeof selectedOng.horarios === 'string'
        ? (selectedOng.horarios as string).split(',').map((h) => h.trim())
        : ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
    : ['09:00', '10:00', '14:00', '15:00', '16:00'];

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Necessário',
        'Você precisa estar logado para agendar uma doação.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer Login', onPress: () => router.push('/login') },
        ]
      );
      return;
    }

    if (!nome.trim() || !email.trim()) {
      setFeedbackMsg({ text: 'Por favor preencha nome e e-mail.', ok: false });
      return;
    }

    if (!selectedOng) {
      setFeedbackMsg({ text: 'Por favor selecione uma ONG de destino.', ok: false });
      return;
    }

    if (!horario) {
      setFeedbackMsg({ text: 'Por favor selecione um horário de coleta.', ok: false });
      return;
    }

    setSubmitting(true);
    setFeedbackMsg(null);

    const payload: DoacaoDTO = {
      nome,
      email,
      ongId: selectedOng.id,
      horario,
      data: new Date().toISOString(),
      usuarioId: usuario!.id,
      itemDoado: itemDoado || undefined,
      itensTipo: itemDoado || undefined,
    };

    try {
      if (editandoId) {
        await ApiService.atualizarDoacao(editandoId, usuario!.id, payload);
        setFeedbackMsg({ text: '✅ Doação atualizada com sucesso!', ok: true });
        setEditandoId(null);
      } else {
        await ApiService.criarDoacao(payload);
        setFeedbackMsg({ text: '🎉 Doação registrada com sucesso!', ok: true });
      }

      setItemDoado('');
      setHorario('');
      await fetchDoacoes();

      setTimeout(() => {
        setAba('agendamentos');
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg({
        text: `❌ ${err.message || 'Erro ao registrar doação'}`,
        ok: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditar = (doacao: Doacao) => {
    setEditandoId(doacao.id);
    setNome(doacao.nome);
    setEmail(doacao.email);
    setHorario(doacao.horario);
    setItemDoado(doacao.itemDoado || '');
    if (typeof doacao.ong === 'object') {
      setSelectedOng(doacao.ong);
    } else {
      const found = ongs.find((o) => o.nome === doacao.ong);
      if (found) setSelectedOng(found);
    }
    setAba('registrar');
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
    }
    setItemDoado('');
    setHorario('');
  };

  const handleCancelarDoacao = async (id: number) => {
    if (!usuario?.id) return;
    try {
      await ApiService.cancelarDoacao(id, usuario.id);
      Alert.alert('Sucesso', 'Doação cancelada com sucesso!');
      fetchDoacoes();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível cancelar a doação.');
    }
  };

  const handleConfirmarPin = async (id: number, pin: string) => {
    try {
      await ApiService.confirmarEntrega(id, { pin });
      Alert.alert('Sucesso', 'Entrega confirmada com sucesso via PIN!');
      fetchDoacoes();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'PIN incorreto ou erro na confirmação.');
    }
  };

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
        {/* Título da Seção */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>
            {editandoId ? 'Editar Doação' : 'Doações'}
          </Text>
          <Text style={styles.pageSubtitle}>
            Transforme itens em esperança para quem precisa
          </Text>
        </View>

        {/* Botão Admin para Confirmar Doação */}
        {(isAdmin || isOng) && (
          <TouchableOpacity
            style={styles.adminBannerBtn}
            onPress={() => router.push('/confirmar')}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={18} color={GiveNetTheme.success} />
            <Text style={styles.adminBannerText}>
              Painel de Confirmação de Entregas (Admin)
            </Text>
            <Ionicons name="chevron-forward" size={16} color={GiveNetTheme.success} />
          </TouchableOpacity>
        )}

        {/* Abas Superiores */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, aba === 'registrar' && styles.tabButtonActive]}
            onPress={() => setAba('registrar')}
          >
            <Ionicons
              name={editandoId ? 'create-outline' : 'add-circle-outline'}
              size={16}
              color={aba === 'registrar' ? GiveNetTheme.textPrimary : GiveNetTheme.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                aba === 'registrar' && styles.tabButtonTextActive,
              ]}
            >
              {editandoId ? 'Editando' : 'Registrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, aba === 'agendamentos' && styles.tabButtonActive]}
            onPress={() => {
              setAba('agendamentos');
              fetchDoacoes();
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={aba === 'agendamentos' ? GiveNetTheme.textPrimary : GiveNetTheme.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                aba === 'agendamentos' && styles.tabButtonTextActive,
              ]}
            >
              Agendamentos {doacoes.length > 0 && `(${doacoes.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, aba === 'lista' && styles.tabButtonActive]}
            onPress={() => setAba('lista')}
          >
            <Ionicons
              name="list-outline"
              size={16}
              color={aba === 'lista' ? GiveNetTheme.textPrimary : GiveNetTheme.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                aba === 'lista' && styles.tabButtonTextActive,
              ]}
            >
              Histórico
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==== ABA 1: REGISTRAR ==== */}
        {aba === 'registrar' && (
          <View style={styles.formCard}>
            {!isAuthenticated && (
              <View style={styles.authNotice}>
                <Ionicons name="information-circle" size={20} color={GiveNetTheme.primaryLight} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.authNoticeTitle}>Faça login para doar</Text>
                  <Text style={styles.authNoticeSub}>
                    Para acompanhar o PIN e status da doação, entre na sua conta.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.authNoticeBtn}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.authNoticeBtnText}>Entrar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome do Doador</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={GiveNetTheme.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor={GiveNetTheme.textPlaceholder}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>
            </View>

            {/* E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail para Confirmação</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={GiveNetTheme.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={GiveNetTheme.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Seleção de ONG */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Selecione a ONG Destino</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ongChipsScroll}
              >
                {ongs.map((ong) => {
                  const isSelected = selectedOng?.id === ong.id;
                  return (
                    <TouchableOpacity
                      key={ong.id}
                      style={[
                        styles.ongSelectChip,
                        isSelected && {
                          borderColor: ong.cor || GiveNetTheme.primaryLight,
                          backgroundColor: 'rgba(124, 58, 237, 0.25)',
                        },
                      ]}
                      onPress={() => {
                        setSelectedOng(ong);
                        setHorario('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.ongSelectIcon}>{ong.icon || '🏢'}</Text>
                      <Text
                        style={[
                          styles.ongSelectText,
                          isSelected && styles.ongSelectTextActive,
                        ]}
                      >
                        {ong.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Itens aceitos pela ONG */}
            {selectedOng && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  O que a {selectedOng.nome} aceita (toque para selecionar):
                </Text>
                <View style={styles.chipsContainer}>
                  {tiposAceitos.map((tipo) => {
                    const isSelected = itemDoado.includes(tipo);
                    return (
                      <TouchableOpacity
                        key={tipo}
                        style={[
                          styles.itemChip,
                          isSelected && styles.itemChipActive,
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setItemDoado('');
                          } else {
                            setItemDoado(tipo);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.itemChipText,
                            isSelected && styles.itemChipTextActive,
                          ]}
                        >
                          {isSelected ? `✓ ${tipo}` : tipo}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Descrição do Item */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Detalhes dos Itens Doados</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="gift-outline" size={18} color={GiveNetTheme.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 2 caixas de agasalhos, 5kg de arroz..."
                  placeholderTextColor={GiveNetTheme.textPlaceholder}
                  value={itemDoado}
                  onChangeText={setItemDoado}
                />
              </View>
            </View>

            {/* Horário de Coleta */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Horário de Coleta / Entrega</Text>
              <View style={styles.chipsContainer}>
                {horariosDisponiveis.map((h) => {
                  const isSelected = horario === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.horarioChip,
                        isSelected && styles.horarioChipActive,
                      ]}
                      onPress={() => setHorario(isSelected ? '' : h)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={isSelected ? '#FFFFFF' : GiveNetTheme.textMuted}
                      />
                      <Text
                        style={[
                          styles.horarioChipText,
                          isSelected && styles.horarioChipTextActive,
                        ]}
                      >
                        {h}h
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {horario ? (
                <Text style={styles.horarioPreview}>
                  🕒 Coleta agendada para às {horario}h
                </Text>
              ) : null}
            </View>

            {/* Feedback Mensagem */}
            {feedbackMsg && (
              <View
                style={[
                  styles.feedbackBox,
                  feedbackMsg.ok ? styles.feedbackSuccess : styles.feedbackError,
                ]}
              >
                <Text
                  style={[
                    styles.feedbackText,
                    feedbackMsg.ok ? { color: GiveNetTheme.success } : { color: GiveNetTheme.danger },
                  ]}
                >
                  {feedbackMsg.text}
                </Text>
              </View>
            )}

            {/* Botão de Envio */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={editandoId ? 'save-outline' : 'heart'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.submitBtnText}>
                    {editandoId ? 'Salvar Alterações' : 'Registrar Doação'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {editandoId && (
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={handleCancelarEdicao}
              >
                <Text style={styles.cancelEditBtnText}>Cancelar Edição</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ==== ABA 2: MEUS AGENDAMENTOS ==== */}
        {aba === 'agendamentos' && (
          <View style={styles.agendamentosContainer}>
            {!isAuthenticated ? (
              <View style={styles.emptyCard}>
                <Ionicons name="lock-closed-outline" size={48} color={GiveNetTheme.primaryLight} />
                <Text style={styles.emptyTitle}>Faça login para ver agendamentos</Text>
                <Text style={styles.emptySubtitle}>
                  Entre na sua conta para acompanhar o status e o PIN de entrega das suas doações.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.emptyBtnText}>Fazer Login</Text>
                </TouchableOpacity>
              </View>
            ) : loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={GiveNetTheme.primaryLight} />
                <Text style={styles.loadingText}>Carregando suas doações...</Text>
              </View>
            ) : doacoes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="gift-outline" size={48} color={GiveNetTheme.primaryLight} />
                <Text style={styles.emptyTitle}>Nenhuma doação agendada</Text>
                <Text style={styles.emptySubtitle}>
                  Você ainda não possui doações registradas. Comece agora mesmo!
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => setAba('registrar')}
                >
                  <Text style={styles.emptyBtnText}>Registrar Primeira Doação</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.doacoesList}>
                {doacoes.map((doacao) => (
                  <CardDoacao
                    key={doacao.id}
                    doacao={doacao}
                    podeConfirmar={isAdmin || isOng}
                    onConfirmarPin={handleConfirmarPin}
                    onCancelar={handleCancelarDoacao}
                    onEditar={handleEditar}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ==== ABA 3: LISTA SIMPLES ==== */}
        {aba === 'lista' && (
          <View style={styles.agendamentosContainer}>
            {doacoes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="document-text-outline" size={48} color={GiveNetTheme.textMuted} />
                <Text style={styles.emptyTitle}>Histórico Vazio</Text>
                <Text style={styles.emptySubtitle}>
                  Nenhum registro encontrado no momento.
                </Text>
              </View>
            ) : (
              <View style={styles.simpleList}>
                {doacoes.map((d) => {
                  const nomeOng = typeof d.ong === 'object' ? d.ong?.nome : d.ong;
                  const isEntregue = d.status === 'DOACAO_ENTREGUE';
                  return (
                    <View key={d.id} style={styles.simpleCard}>
                      <View style={styles.simpleCardHeader}>
                        <Text style={styles.simpleCardTitle}>{d.nome}</Text>
                        <Text
                          style={[
                            styles.simpleCardStatus,
                            { color: isEntregue ? GiveNetTheme.success : GiveNetTheme.primaryLight },
                          ]}
                        >
                          {isEntregue ? 'Entregue' : d.status}
                        </Text>
                      </View>
                      <Text style={styles.simpleCardMeta}>ONG: {nomeOng}</Text>
                      <Text style={styles.simpleCardMeta}>Horário: {d.horario}h</Text>
                      {d.itemDoado && (
                        <Text style={styles.simpleCardMeta}>Item: {d.itemDoado}</Text>
                      )}
                      {d.pinConfirmacao && (
                        <Text style={styles.simpleCardPin}>
                          PIN: {d.pinConfirmacao}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
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
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
  },
  adminBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  adminBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.success,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: GiveNetTheme.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.textMuted,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  authNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  authNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  authNoticeSub: {
    fontSize: 11,
    color: GiveNetTheme.textSecondary,
  },
  authNoticeBtn: {
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  authNoticeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.textSecondary,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GiveNetTheme.inputBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
  },
  ongChipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  ongSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1.5,
    borderColor: GiveNetTheme.border,
  },
  ongSelectIcon: {
    fontSize: 16,
  },
  ongSelectText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontWeight: '700',
  },
  ongSelectTextActive: {
    color: GiveNetTheme.textPrimary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  itemChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderColor: GiveNetTheme.primaryLight,
  },
  itemChipText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontWeight: '600',
  },
  itemChipTextActive: {
    color: GiveNetTheme.textPrimary,
    fontWeight: '700',
  },
  horarioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  horarioChipActive: {
    backgroundColor: GiveNetTheme.primary,
    borderColor: GiveNetTheme.primaryLight,
  },
  horarioChipText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontWeight: '700',
  },
  horarioChipTextActive: {
    color: '#FFFFFF',
  },
  horarioPreview: {
    fontSize: 12,
    color: GiveNetTheme.primaryLight,
    fontWeight: '600',
    marginTop: 6,
  },
  feedbackBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  feedbackError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GiveNetTheme.primary,
    height: 48,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: GiveNetTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelEditBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginTop: 8,
  },
  cancelEditBtnText: {
    color: GiveNetTheme.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  agendamentosContainer: {
    gap: 12,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    color: GiveNetTheme.textSecondary,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyBtn: {
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  doacoesList: {
    gap: 14,
  },
  simpleList: {
    gap: 10,
  },
  simpleCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    gap: 4,
  },
  simpleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  simpleCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  simpleCardStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  simpleCardMeta: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
  },
  simpleCardPin: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.primaryLight,
    marginTop: 2,
  },
});
