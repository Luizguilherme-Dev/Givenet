import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirmar: (pin: string) => Promise<void>;
  loading?: boolean;
  targetPin?: string;
}

export const ModalPinConfirmacao: React.FC<Props> = ({
  visible,
  onClose,
  onConfirmar,
  loading = false,
  targetPin,
}) => {
  const [pin, setPin] = useState('');

  const isComplete = pin.length === 4;
  const isMatch = targetPin ? pin === targetPin : true;

  const handleConfirmar = async () => {
    if (!isComplete) return;
    await onConfirmar(pin);
    setPin('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Ionicons name="keypad-outline" size={20} color={GiveNetTheme.primaryLight} />
                  <Text style={styles.title}>Confirmar Entrega via PIN</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setPin('');
                    onClose();
                  }}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color={GiveNetTheme.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Digite o PIN de 4 dígitos da doação para validar e confirmar a entrega na ONG:
              </Text>

              {/* PIN Digits visualization */}
              <View style={styles.pinDigitsRow}>
                {[0, 1, 2, 3].map((idx) => {
                  const digit = pin[idx] || '';
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.pinBox,
                        digit ? styles.pinBoxFilled : styles.pinBoxEmpty,
                        isComplete && targetPin && (isMatch ? styles.pinBoxSuccess : styles.pinBoxError),
                      ]}
                    >
                      <Text
                        style={[
                          styles.pinBoxText,
                          isComplete && targetPin && (isMatch ? styles.textSuccess : styles.textError),
                        ]}
                      >
                        {digit || '•'}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Input Invisível/Focado */}
              <TextInput
                style={styles.hiddenInput}
                value={pin}
                onChangeText={(val) => setPin(val.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />

              {isComplete && targetPin && !isMatch && (
                <Text style={styles.errorFeedback}>
                  ⚠️ PIN incorreto! Verifique o comprovante da doação.
                </Text>
              )}

              {isComplete && targetPin && isMatch && (
                <Text style={styles.successFeedback}>
                  ✅ PIN correto! Pronto para confirmar.
                </Text>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => {
                    setPin('');
                    onClose();
                  }}
                  disabled={loading}
                >
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btnConfirmar,
                    (!isComplete || (targetPin && !isMatch)) && styles.btnDisabled,
                  ]}
                  onPress={handleConfirmar}
                  disabled={loading || !isComplete || (targetPin ? !isMatch : false)}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                      <Text style={styles.btnConfirmarText}>Confirmar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
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
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  pinDigitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pinBox: {
    width: 54,
    height: 58,
    borderRadius: 14,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 2,
    borderColor: GiveNetTheme.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBoxEmpty: {
    borderColor: GiveNetTheme.border,
  },
  pinBoxFilled: {
    borderColor: GiveNetTheme.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  pinBoxSuccess: {
    borderColor: GiveNetTheme.success,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  pinBoxError: {
    borderColor: GiveNetTheme.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  pinBoxText: {
    fontSize: 24,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  textSuccess: {
    color: GiveNetTheme.success,
  },
  textError: {
    color: GiveNetTheme.danger,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0.01,
    width: 1,
    height: 1,
  },
  errorFeedback: {
    fontSize: 12,
    color: GiveNetTheme.danger,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  successFeedback: {
    fontSize: 12,
    color: GiveNetTheme.success,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnCancelar: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelarText: {
    color: GiveNetTheme.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  btnConfirmar: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.success,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnConfirmarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
