import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { GiveNetTheme } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Doacao } from '@/types';

const extrairIdDoQrCode = (conteudo: string): number | null => {
  try {
    const url = new URL(conteudo);
    const caminho = url.pathname.replace(/\/+$/, '');
    const id = url.searchParams.get('qr');

    if (!caminho.endsWith('/confirmar-doacao') || !id || !/^\d+$/.test(id)) {
      return null;
    }

    const idNumerico = Number(id);
    return Number.isSafeInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
  } catch {
    return null;
  }
};

export default function ConfirmarScreen() {
  const router = useRouter();
  const { usuario, isAdmin, isOng, isLoading } = useAuth();
  const podeConfirmarEntrega = isAdmin || isOng;
  const [permissaoCamera, solicitarPermissaoCamera] = useCameraPermissions();

  const [doacaoId, setDoacaoId] = useState('');
  const [doacao, setDoacao] = useState<Doacao | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [filtrosBusca, setFiltrosBusca] = useState({
    nome: '',
    item: '',
    data: '',
    horario: '',
    id: '',
  });
  const [doacoesEncontradas, setDoacoesEncontradas] = useState<Doacao[]>([]);
  const [buscandoDoacoes, setBuscandoDoacoes] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [leitorAberto, setLeitorAberto] = useState(false);
  const qrEmProcessamento = useRef(false);

  useEffect(() => {
    if (!leitorAberto || Platform.OS === 'ios' || Platform.OS === 'web') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setLeitorAberto(false);
      return true;
    });

    return () => subscription.remove();
  }, [leitorAberto]);

  const abrirLeitorQr = async () => {
    let permissao = permissaoCamera;
    try {
      if (!permissao?.granted) {
        permissao = await solicitarPermissaoCamera();
      }
    } catch {
      Alert.alert(
        'Não foi possível acessar a câmera',
        'Permita o acesso à câmera para ler o QR Code.'
      );
      return;
    }

    if (!permissao?.granted) {
      Alert.alert(
        'Não foi possível acessar a câmera',
        'Permita o acesso à câmera para ler o QR Code.'
      );
      return;
    }

    qrEmProcessamento.current = false;
    setLeitorAberto(true);
  };

  const handleQrLido = async ({ data }: BarcodeScanningResult) => {
    if (qrEmProcessamento.current) return;
    qrEmProcessamento.current = true;
    setLeitorAberto(false);

    const id = extrairIdDoQrCode(data);
    if (!id) {
      Alert.alert('QR Code inválido', 'Não foi possível identificar a doação neste QR Code.');
      return;
    }

    setConfirmando(true);
    try {
      const doacaoConfirmada = await ApiService.confirmarEntrega(id, {});
      setDoacao(doacaoConfirmada);
      setDoacaoId(String(doacaoConfirmada.id));
      setPin('');
      setConcluido(true);
      Alert.alert('✅ Sucesso', 'Doação marcada como entregue com sucesso!');
    } catch (err: any) {
      const mensagem = err.message || 'Falha ao confirmar entrega.';
      if (mensagem.toLocaleLowerCase().includes('não encontrada')) {
        Alert.alert('QR Code inválido', mensagem);
      } else {
        Alert.alert('Erro', mensagem);
      }
    } finally {
      setConfirmando(false);
    }
  };

  const handleBuscar = async () => {
    if (!podeConfirmarEntrega) {
      Alert.alert('Acesso restrito', 'Somente ONGs e administradores podem validar entregas.');
      return;
    }

    if (!doacaoId.trim()) {
      Alert.alert('Atenção', 'Informe o ID da doação.');
      return;
    }

    setBuscando(true);
    setDoacao(null);
    setPin('');
    setConcluido(false);

    try {
      const data = await ApiService.getDoacao(Number(doacaoId), usuario?.id || 1);
      if (data.status === 'DOACAO_ENTREGUE') {
        Alert.alert('Aviso', 'Esta doação já foi confirmada anteriormente como entregue.');
      }
      setDoacao(data);
    } catch (err: any) {
      Alert.alert('Não encontrada', err.message || 'Doação não encontrada com este ID.');
    } finally {
      setBuscando(false);
    }
  };

  const handleBuscarDoacoes = async () => {
    if (!Object.values(filtrosBusca).some((valor) => valor.trim())) {
      Alert.alert('Atenção', 'Informe pelo menos um filtro para buscar doações.');
      return;
    }

    setBuscandoDoacoes(true);
    setBuscaRealizada(false);
    setDoacao(null);
    setDoacaoId('');
    setPin('');
    setConcluido(false);

    try {
      const dataBusca = filtrosBusca.data.trim().replace(
        /^(\d{2})\/(\d{2})\/(\d{4})$/,
        '$3-$2-$1'
      );
      const resultados = await ApiService.buscarDoacoes({
        ...filtrosBusca,
        data: dataBusca,
      });
      setDoacoesEncontradas(resultados);
      setBuscaRealizada(true);
    } catch (err: any) {
      setDoacoesEncontradas([]);
      Alert.alert('Erro na busca', err.message || 'Não foi possível buscar as doações.');
    } finally {
      setBuscandoDoacoes(false);
    }
  };

  const selecionarDoacao = (selecionada: Doacao) => {
    setDoacao(selecionada);
    setDoacaoId(String(selecionada.id));
    setPin('');
    setConcluido(false);
    if (selecionada.status === 'DOACAO_ENTREGUE') {
      Alert.alert('Aviso', 'Esta doação já foi confirmada anteriormente como entregue.');
    }
  };

  const alterarFiltroBusca = (campo: keyof typeof filtrosBusca, valor: string) => {
    setFiltrosBusca((atual) => ({ ...atual, [campo]: valor }));
  };

  const formatarDataBusca = (data?: string) => {
    if (!data) return '—';
    const [ano, mes, dia] = data.slice(0, 10).split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
  };

  const formatarStatusBusca = (status?: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'Agendada';
      case 'DOACAO_ENTREGUE':
        return 'Entregue';
      case 'CANCELADO':
        return 'Cancelada';
      default:
        return status || '—';
    }
  };

  const pinValido = doacao && pin.length === 4 && pin === doacao.pinConfirmacao;
  const pinErrado = doacao && pin.length === 4 && pin !== doacao.pinConfirmacao;

  const podeConfirmarSemPin = isAdmin || isOng;

  const handleConfirmarEntrega = async () => {
    if (!podeConfirmarEntrega) {
      Alert.alert('Acesso restrito', 'Somente ONGs e administradores podem confirmar entregas.');
      return;
    }

    if (!doacao) return;

    if (doacao.pinConfirmacao && !pinValido && !podeConfirmarSemPin) {
      Alert.alert('PIN Inválido', 'O PIN digitado não coincide com a doação.');
      return;
    }

    setConfirmando(true);

    try {
      await ApiService.confirmarEntrega(doacao.id, {
        pin: pin || undefined,
      });

      setConcluido(true);
      setDoacao((prev) => (prev ? { ...prev, status: 'DOACAO_ENTREGUE' } : null));
      Alert.alert('✅ Sucesso', 'Doação marcada como entregue com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao confirmar entrega.');
    } finally {
      setConfirmando(false);
    }
  };

  const handleNovaBusca = () => {
    setDoacaoId('');
    setDoacao(null);
    setPin('');
    setConcluido(false);
  };

  const nomeOng =
    typeof doacao?.ong === 'object' ? doacao?.ong?.nome : doacao?.ong || 'ONG Parceira';

  if (leitorAberto && Platform.OS !== 'web') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.cameraPreview}
          facing="back"
          active
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleQrLido}
          onMountError={({ message }) => {
            setLeitorAberto(false);
            Alert.alert('Não foi possível abrir a câmera', message);
          }}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraInstruction}>
            Posicione o QR Code da doação dentro da área de leitura.
          </Text>
          <View style={styles.cameraFrame} />
          <TouchableOpacity
            style={styles.cameraCloseButton}
            onPress={() => setLeitorAberto(false)}
          >
            <Text style={styles.cameraCloseButtonText}>Fechar câmera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={GiveNetTheme.primaryLight} />
      </View>
    );
  }

  if (!podeConfirmarEntrega) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={GiveNetTheme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Área restrita</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="lock-closed" size={24} color={GiveNetTheme.primaryLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Acesso restrito</Text>
            <Text style={styles.introSub}>
              Somente ONGs e administradores podem validar e confirmar entregas.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Topo / Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={GiveNetTheme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Confirmar Entrega</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="shield-checkmark" size={24} color={GiveNetTheme.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Validação de Entrega</Text>
            <Text style={styles.introSub}>
              Digite o ID da doação e valide pelo PIN de 4 dígitos informado pelo doador.
            </Text>
          </View>
        </View>

        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.qrScanButton}
            onPress={abrirLeitorQr}
            disabled={confirmando}
          >
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            <Text style={styles.qrScanButtonText}>Ler QR Code</Text>
          </TouchableOpacity>
        )}

        <View style={styles.searchCard}>
          <Text style={styles.searchSectionTitle}>Buscar doações</Text>
          <TextInput
            style={styles.searchFilterInput}
            placeholder="Nome do doador"
            placeholderTextColor={GiveNetTheme.textPlaceholder}
            value={filtrosBusca.nome}
            onChangeText={(valor) => alterarFiltroBusca('nome', valor)}
          />
          <TextInput
            style={styles.searchFilterInput}
            placeholder="Item doado"
            placeholderTextColor={GiveNetTheme.textPlaceholder}
            value={filtrosBusca.item}
            onChangeText={(valor) => alterarFiltroBusca('item', valor)}
          />
          <View style={styles.filterRow}>
            <TextInput
              style={[styles.searchFilterInput, styles.filterInputHalf]}
              placeholder="Data (DD/MM/AAAA)"
              placeholderTextColor={GiveNetTheme.textPlaceholder}
              value={filtrosBusca.data}
              onChangeText={(valor) => alterarFiltroBusca('data', valor)}
              inputMode="numeric"
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[styles.searchFilterInput, styles.filterInputHalf]}
              placeholder="Horário"
              placeholderTextColor={GiveNetTheme.textPlaceholder}
              value={filtrosBusca.horario}
              onChangeText={(valor) => alterarFiltroBusca('horario', valor)}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <TextInput
            style={styles.searchFilterInput}
            placeholder="ID da doação"
            placeholderTextColor={GiveNetTheme.textPlaceholder}
            value={filtrosBusca.id}
            onChangeText={(valor) => alterarFiltroBusca('id', valor.replace(/\D/g, ''))}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={[styles.searchBtn, styles.filterSearchBtn]}
            onPress={handleBuscarDoacoes}
            disabled={buscandoDoacoes}
          >
            {buscandoDoacoes ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="search" size={16} color="#FFFFFF" />
                <Text style={styles.searchBtnText}>Buscar doações</Text>
              </>
            )}
          </TouchableOpacity>

          {buscaRealizada && (
            <View style={styles.searchResults}>
              <Text style={styles.searchSectionTitle}>
                {doacoesEncontradas.length
                  ? `Resultados encontrados (${doacoesEncontradas.length})`
                  : 'Nenhuma doação encontrada'}
              </Text>
              {doacoesEncontradas.map((resultado) => (
                <View key={resultado.id} style={styles.searchResultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>Doação #{resultado.id}</Text>
                    <Text style={styles.searchResultStatus}>
                      {formatarStatusBusca(resultado.status)}
                    </Text>
                  </View>
                  <Text style={styles.searchResultText}>Doador: {resultado.nome || '—'}</Text>
                  <Text style={styles.searchResultText}>
                    Item: {resultado.itemDoado || resultado.itensTipo || '—'}
                  </Text>
                  <Text style={styles.searchResultText}>
                    Data: {formatarDataBusca(resultado.data)} · Horário: {resultado.horario || '—'}
                  </Text>
                  <TouchableOpacity
                    style={styles.selectDonationBtn}
                    onPress={() => selecionarDoacao(resultado)}
                  >
                    <Text style={styles.selectDonationBtnText}>Selecionar doação</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Busca por ID */}
        <View style={styles.searchCard}>
          <Text style={styles.fieldLabel}>ID da Doação</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: 1, 2, 10..."
              placeholderTextColor={GiveNetTheme.textPlaceholder}
              value={doacaoId}
              onChangeText={(v) => {
                setDoacaoId(v.replace(/\D/g, ''));
                setDoacao(null);
                setPin('');
              }}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[styles.searchBtn, !doacaoId && styles.searchBtnDisabled]}
              onPress={handleBuscar}
              disabled={buscando || !doacaoId}
            >
              {buscando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search" size={16} color="#FFFFFF" />
                  <Text style={styles.searchBtnText}>Buscar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Dados da Doação Encontrada */}
        {doacao && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Doação #{doacao.id}</Text>
              <View
                style={[
                  styles.statusTag,
                  doacao.status === 'DOACAO_ENTREGUE'
                    ? styles.statusTagSuccess
                    : styles.statusTagWarning,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    doacao.status === 'DOACAO_ENTREGUE'
                      ? { color: GiveNetTheme.success }
                      : { color: GiveNetTheme.primaryLight },
                  ]}
                >
                  {doacao.status === 'DOACAO_ENTREGUE' ? 'ENTREGUE' : 'AGENDADO'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Doador:</Text>
                <Text style={styles.detailVal}>{doacao.nome}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>E-mail:</Text>
                <Text style={styles.detailVal}>{doacao.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>ONG Destino:</Text>
                <Text style={styles.detailVal}>{nomeOng}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Horário:</Text>
                <Text style={styles.detailVal}>{doacao.horario}h</Text>
              </View>
              {doacao.itemDoado && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Item doado:</Text>
                  <Text style={styles.detailVal}>{doacao.itemDoado}</Text>
                </View>
              )}
              {doacao.pinConfirmacao && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>PIN Esperado:</Text>
                  <Text style={[styles.detailVal, styles.pinHighlight]}>
                    {doacao.pinConfirmacao}
                  </Text>
                </View>
              )}
            </View>

            {/* Input do PIN para confirmação */}
            {doacao.status !== 'DOACAO_ENTREGUE' && (
              <View style={styles.pinSection}>
                <Text style={styles.pinSectionTitle}>Digite o PIN de 4 dígitos:</Text>

                <View style={styles.pinBoxesRow}>
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = pin[idx] || '';
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.pinDigitBox,
                          digit ? styles.pinDigitFilled : styles.pinDigitEmpty,
                          pinValido && styles.pinDigitSuccess,
                          pinErrado && styles.pinDigitError,
                        ]}
                      >
                        <Text style={styles.pinDigitText}>{digit || '•'}</Text>
                      </View>
                    );
                  })}
                </View>

                <TextInput
                  style={styles.hiddenPinInput}
                  value={pin}
                  onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  autoFocus
                />

                {pinErrado && (
                  <Text style={styles.pinErrorText}>
                    ⚠️ O PIN digitado não confere com a doação.
                  </Text>
                )}

                {pinValido && (
                  <Text style={styles.pinSuccessText}>
                    ✓ PIN correto! Pronto para confirmar.
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmActionBtn,
                    (!pinValido && !podeConfirmarSemPin) && styles.confirmActionBtnDisabled,
                  ]}
                  onPress={handleConfirmarEntrega}
                  disabled={confirmando || (!pinValido && !podeConfirmarSemPin)}
                >
                  {confirmando ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.confirmActionBtnText}>Confirmar Entrega</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Banner de Concluído */}
            {concluido && (
              <View style={styles.concluidoCard}>
                <Ionicons name="checkmark-circle" size={32} color={GiveNetTheme.success} />
                <Text style={styles.concluidoTitle}>Entrega Confirmada!</Text>
                <Text style={styles.concluidoSub}>
                  A doação foi registrada como entregue no sistema GiveNet.
                </Text>
                <TouchableOpacity style={styles.btnOutra} onPress={handleNovaBusca}>
                  <Text style={styles.btnOutraText}>Validar Outra Doação</Text>
                </TouchableOpacity>
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
    paddingBottom: 40,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  introSub: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  qrScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: GiveNetTheme.primary,
    marginBottom: 16,
  },
  qrScanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFill,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 48,
  },
  cameraInstruction: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: 12,
    borderRadius: 12,
  },
  cameraFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cameraCloseButton: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderColor: GiveNetTheme.borderLight,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cameraCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: 16,
  },
  searchSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    marginBottom: 10,
  },
  searchFilterInput: {
    height: 44,
    backgroundColor: GiveNetTheme.inputBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: GiveNetTheme.textPrimary,
    fontSize: 14,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterInputHalf: {
    flex: 1,
  },
  filterSearchBtn: {
    justifyContent: 'center',
    marginTop: 2,
  },
  searchResults: {
    borderTopWidth: 1,
    borderTopColor: GiveNetTheme.border,
    marginTop: 16,
    paddingTop: 14,
    gap: 10,
  },
  searchResultCard: {
    backgroundColor: GiveNetTheme.cardSecondary,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  searchResultStatus: {
    color: GiveNetTheme.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  searchResultText: {
    color: GiveNetTheme.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  selectDonationBtn: {
    alignItems: 'center',
    backgroundColor: GiveNetTheme.primary,
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 8,
  },
  selectDonationBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.textSecondary,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    backgroundColor: GiveNetTheme.inputBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: GiveNetTheme.textPrimary,
    fontSize: 15,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.primary,
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusTagSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusTagWarning: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailsList: {
    backgroundColor: GiveNetTheme.cardSecondary,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailKey: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
  },
  pinHighlight: {
    color: GiveNetTheme.primaryLight,
    letterSpacing: 2,
    fontSize: 14,
    fontWeight: '900',
  },
  pinSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pinSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: GiveNetTheme.textSecondary,
    marginBottom: 12,
  },
  pinBoxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  pinDigitBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitEmpty: {
    borderColor: GiveNetTheme.border,
  },
  pinDigitFilled: {
    borderColor: GiveNetTheme.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  pinDigitSuccess: {
    borderColor: GiveNetTheme.success,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  pinDigitError: {
    borderColor: GiveNetTheme.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  pinDigitText: {
    fontSize: 22,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  hiddenPinInput: {
    position: 'absolute',
    opacity: 0.01,
    width: 1,
    height: 1,
  },
  pinErrorText: {
    color: GiveNetTheme.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  pinSuccessText: {
    color: GiveNetTheme.success,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  confirmActionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: GiveNetTheme.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  confirmActionBtnDisabled: {
    opacity: 0.4,
  },
  confirmActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  concluidoCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 10,
  },
  concluidoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: GiveNetTheme.success,
    marginTop: 8,
  },
  concluidoSub: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  btnOutra: {
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnOutraText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
