import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Doacao } from '@/types';
import { ModalQRCode } from './ModalQRCode';
import { ModalPinConfirmacao } from './ModalPinConfirmacao';

interface Props {
  doacao: Doacao;
  podeConfirmar?: boolean;
  onConfirmarPin?: (id: number, pin: string) => Promise<void>;
  onCancelar?: (id: number) => Promise<void>;
  onEditar?: (doacao: Doacao) => void;
}

export const CardDoacao: React.FC<Props> = ({
  doacao,
  podeConfirmar = false,
  onConfirmarPin,
  onCancelar,
  onEditar,
}) => {
  const [modalQRVisible, setModalQRVisible] = useState(false);
  const [modalPinVisible, setModalPinVisible] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const status = doacao.status?.toUpperCase() || 'AGENDADO';
  const isEntregue = status === 'DOACAO_ENTREGUE';
  const isCancelado = status === 'CANCELADO';
  const isAgendado = !isEntregue && !isCancelado;

  const nomeOng =
    typeof doacao.ong === 'object' ? doacao.ong?.nome : doacao.ong || 'ONG Parceira';

  const dataFormatada = doacao.data
    ? new Date(doacao.data).toLocaleDateString('pt-BR')
    : '—';

  const dataEntregaFormatada = doacao.dataEntrega
    ? new Date(doacao.dataEntrega).toLocaleString('pt-BR')
    : null;

  const handleConfirmarPin = async (pin: string) => {
    if (!onConfirmarPin) return;
    setLoadingConfirm(true);
    try {
      await onConfirmarPin(doacao.id, pin);
      setModalPinVisible(false);
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleCancelarPress = () => {
    Alert.alert(
      'Cancelar Doação',
      'Tem certeza de que deseja cancelar este agendamento de doação?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => onCancelar && onCancelar(doacao.id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Topo do Card */}
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <Text style={styles.donorName}>{doacao.nome}</Text>
          <View style={styles.ongBadgeRow}>
            <Ionicons name="business-outline" size={13} color={GiveNetTheme.textSecondary} />
            <Text style={styles.ongName}>{nomeOng}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            isEntregue && styles.statusBadgeSuccess,
            isCancelado && styles.statusBadgeDanger,
            isAgendado && styles.statusBadgeWarning,
          ]}
        >
          <Ionicons
            name={
              isEntregue
                ? 'checkmark-circle'
                : isCancelado
                  ? 'close-circle'
                  : 'time-outline'
            }
            size={13}
            color={
              isEntregue
                ? GiveNetTheme.success
                : isCancelado
                  ? GiveNetTheme.danger
                  : GiveNetTheme.primaryLight
            }
          />
          <Text
            style={[
              styles.statusText,
              isEntregue && { color: GiveNetTheme.success },
              isCancelado && { color: GiveNetTheme.danger },
              isAgendado && { color: GiveNetTheme.primaryLight },
            ]}
          >
            {isEntregue ? 'Entregue' : isCancelado ? 'Cancelada' : 'Agendada'}
          </Text>
        </View>
      </View>

      {/* Linha de Progresso Visual */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressDot,
              isCancelado
                ? styles.dotDanger
                : isEntregue
                  ? styles.dotSuccess
                  : styles.dotActive,
            ]}
          />
          <View
            style={[
              styles.progressLine,
              isCancelado
                ? styles.lineDanger
                : isEntregue
                  ? styles.lineSuccess
                  : styles.lineInactive,
            ]}
          />
          <View
            style={[
              styles.progressDot,
              isCancelado
                ? styles.dotDanger
                : isEntregue
                  ? styles.dotSuccess
                  : styles.dotInactive,
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text
            style={[
              styles.progressLabel,
              isCancelado ? styles.labelDanger : styles.labelActive,
            ]}
          >
            Registrada
          </Text>
          <Text
            style={[
              styles.progressLabel,
              isCancelado
                ? styles.labelDanger
                : isEntregue
                  ? styles.labelSuccess
                  : styles.labelInactive,
            ]}
          >
            Entregue
          </Text>
        </View>
      </View>

      {/* Grid de Detalhes */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>ITEM DOADO</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {doacao.itemDoado || doacao.itensTipo || 'Doação geral'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>DATA</Text>
          <Text style={styles.detailValue}>{dataFormatada}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>HORÁRIO</Text>
          <Text style={styles.detailValue}>{doacao.horario}h</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>CÓDIGO</Text>
          <Text style={styles.detailValue}>#{doacao.id}</Text>
        </View>
      </View>

      {/* Banner de Entrega Concluída */}
      {isEntregue && dataEntregaFormatada && (
        <View style={styles.deliveredBanner}>
          <Ionicons name="checkmark-done-circle" size={20} color={GiveNetTheme.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.deliveredTitle}>Doação confirmada com sucesso!</Text>
            <Text style={styles.deliveredSubtitle}>Recebida em {dataEntregaFormatada}</Text>
          </View>
        </View>
      )}

      {/* Caixa de PIN de Confirmação */}
      {isAgendado && doacao.pinConfirmacao && (
        <View style={styles.pinRow}>
          <View style={styles.pinInfo}>
            <Text style={styles.pinLabel}>PIN DE ENTREGA</Text>
            <Text style={styles.pinNumber}>{doacao.pinConfirmacao}</Text>
          </View>
          <TouchableOpacity
            style={styles.pinConfirmBtn}
            onPress={() => setModalPinVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="keypad" size={14} color="#FFFFFF" />
            <Text style={styles.pinConfirmBtnText}>Validar PIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botões de Ação */}
      {isAgendado && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.btnQr}
            onPress={() => setModalQRVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={16} color={GiveNetTheme.primaryLight} />
            <Text style={styles.btnQrText}>QR Code</Text>
          </TouchableOpacity>

          {onEditar && (
            <TouchableOpacity
              style={styles.btnActionSecondary}
              onPress={() => onEditar(doacao)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color={GiveNetTheme.textSecondary} />
              <Text style={styles.btnActionSecondaryText}>Editar</Text>
            </TouchableOpacity>
          )}

          {onCancelar && (
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={handleCancelarPress}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={15} color={GiveNetTheme.danger} />
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ModalQRCode
        visible={modalQRVisible}
        onClose={() => setModalQRVisible(false)}
        doacao={doacao}
      />

      <ModalPinConfirmacao
        visible={modalPinVisible}
        onClose={() => setModalPinVisible(false)}
        onConfirmar={handleConfirmarPin}
        loading={loadingConfirm}
        targetPin={doacao.pinConfirmacao}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleInfo: {
    flex: 1,
    marginRight: 10,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  ongBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ongName: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusBadgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 14,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    flex: 1,
    height: 3,
  },
  dotActive: {
    backgroundColor: GiveNetTheme.primaryLight,
  },
  dotSuccess: {
    backgroundColor: GiveNetTheme.success,
  },
  dotDanger: {
    backgroundColor: GiveNetTheme.danger,
  },
  dotInactive: {
    backgroundColor: GiveNetTheme.borderLight,
  },
  lineSuccess: {
    backgroundColor: GiveNetTheme.success,
  },
  lineDanger: {
    backgroundColor: GiveNetTheme.danger,
  },
  lineInactive: {
    backgroundColor: GiveNetTheme.borderLight,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  labelActive: {
    color: GiveNetTheme.primaryLight,
  },
  labelSuccess: {
    color: GiveNetTheme.success,
  },
  labelDanger: {
    color: GiveNetTheme.danger,
  },
  labelInactive: {
    color: GiveNetTheme.textMuted,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: GiveNetTheme.cardSecondary,
    borderRadius: 14,
    padding: 10,
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    width: '47%',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: GiveNetTheme.textMuted,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
    marginTop: 1,
  },
  deliveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  deliveredTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.success,
  },
  deliveredSubtitle: {
    fontSize: 11,
    color: GiveNetTheme.textMuted,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  pinInfo: {
    flexDirection: 'column',
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: GiveNetTheme.textSecondary,
    letterSpacing: 0.5,
  },
  pinNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E9D5FF',
    letterSpacing: 4,
  },
  pinConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  pinConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnQr: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  btnQrText: {
    color: GiveNetTheme.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  btnActionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 38,
    borderRadius: 10,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  btnActionSecondaryText: {
    color: GiveNetTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  btnCancel: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  btnCancelText: {
    color: GiveNetTheme.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
