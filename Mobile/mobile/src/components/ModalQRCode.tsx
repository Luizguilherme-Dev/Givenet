import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Doacao } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  doacao: Doacao | null;
}

export const ModalQRCode: React.FC<Props> = ({ visible, onClose, doacao }) => {
  if (!doacao) return null;

  const nomeOng =
    typeof doacao.ong === 'object' ? doacao.ong?.nome : doacao.ong || 'ONG Parceira';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Comprovante de Entrega</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={GiveNetTheme.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Apresente este código na ONG no momento da entrega da doação:
              </Text>

              {/* QR Container Visual */}
              <View style={styles.qrBox}>
                <View style={styles.qrInner}>
                  <Ionicons name="qr-code" size={160} color="#1A0533" />
                </View>
                <Text style={styles.qrMeta}>
                  Doação #{doacao.id} • {nomeOng}
                </Text>
              </View>

              {/* PIN Box */}
              {doacao.pinConfirmacao && (
                <View style={styles.pinBox}>
                  <Text style={styles.pinLabel}>PIN DE CONFIRMAÇÃO</Text>
                  <Text style={styles.pinValue}>{doacao.pinConfirmacao}</Text>
                </View>
              )}

              <View style={styles.detailsBox}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailBold}>Doador: </Text>
                  {doacao.nome}
                </Text>
                {doacao.itemDoado && (
                  <Text style={styles.detailText}>
                    <Text style={styles.detailBold}>Item: </Text>
                    {doacao.itemDoado}
                  </Text>
                )}
                <Text style={styles.detailText}>
                  <Text style={styles.detailBold}>Horário agendado: </Text>
                  {doacao.horario}h
                </Text>
              </View>

              <TouchableOpacity style={styles.closeActionBtn} onPress={onClose}>
                <Text style={styles.closeActionText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 2, 12, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: GiveNetTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  qrInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  qrMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A0533',
    marginTop: 6,
  },
  pinBox: {
    width: '100%',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: GiveNetTheme.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pinValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#E9D5FF',
    letterSpacing: 8,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: GiveNetTheme.cardSecondary,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
  },
  detailBold: {
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
  },
  closeActionBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
