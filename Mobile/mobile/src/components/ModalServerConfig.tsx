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
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalServerConfig: React.FC<Props> = ({ visible, onClose }) => {
  const { apiUrl, updateApiUrl } = useAuth();
  const [inputUrl, setInputUrl] = useState(apiUrl || ApiService.getBaseUrl());
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const presets = [
    { label: 'Wi-Fi Local (PC)', url: 'http://192.168.10.6:8080' },
    { label: 'Emulador Android', url: 'http://10.0.2.2:8080' },
    { label: 'Localhost / Web', url: 'http://localhost:8080' },
  ];

  const handleTest = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await ApiService.testConnection(inputUrl);
      setStatusMsg({ text: res.message, ok: res.ok });
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Erro ao testar conexão', ok: false });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setTesting(true);
    try {
      const res = await updateApiUrl(inputUrl);
      setStatusMsg({ text: res.message, ok: res.ok });
      if (res.ok) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Ionicons name="server-outline" size={22} color={GiveNetTheme.primaryLight} />
                  <Text style={styles.title}>Servidor Backend (GiveNet)</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={GiveNetTheme.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.description}>
                Configure o endereço do servidor Spring Boot da GiveNet para o aplicativo:
              </Text>

              {/* Presets */}
              <View style={styles.presetsContainer}>
                {presets.map((p) => (
                  <TouchableOpacity
                    key={p.url}
                    style={[
                      styles.presetChip,
                      inputUrl === p.url && styles.presetChipActive,
                    ]}
                    onPress={() => {
                      setInputUrl(p.url);
                      setStatusMsg(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        inputUrl === p.url && styles.presetChipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input URL */}
              <View style={styles.inputWrap}>
                <Ionicons name="link-outline" size={18} color={GiveNetTheme.textMuted} />
                <TextInput
                  style={styles.input}
                  value={inputUrl}
                  onChangeText={(val) => {
                    setInputUrl(val);
                    setStatusMsg(null);
                  }}
                  placeholder="http://192.168.10.6:8080"
                  placeholderTextColor={GiveNetTheme.textPlaceholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Status feedback */}
              {statusMsg && (
                <View
                  style={[
                    styles.statusBox,
                    statusMsg.ok ? styles.statusBoxSuccess : styles.statusBoxError,
                  ]}
                >
                  <Ionicons
                    name={statusMsg.ok ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={statusMsg.ok ? GiveNetTheme.success : GiveNetTheme.danger}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusMsg.ok ? GiveNetTheme.success : GiveNetTheme.danger },
                    ]}
                  >
                    {statusMsg.text}
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={handleTest}
                  disabled={testing}
                >
                  {testing ? (
                    <ActivityIndicator size="small" color={GiveNetTheme.textPrimary} />
                  ) : (
                    <>
                      <Ionicons name="pulse" size={16} color={GiveNetTheme.textPrimary} />
                      <Text style={styles.btnSecondaryText}>Testar</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSave}
                  disabled={testing}
                >
                  <Ionicons name="save-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.btnPrimaryText}>Salvar e Conectar</Text>
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
    backgroundColor: 'rgba(5, 2, 12, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 20,
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
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  presetChipActive: {
    borderColor: GiveNetTheme.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
  },
  presetChipText: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: GiveNetTheme.textPrimary,
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
    marginBottom: 14,
  },
  input: {
    flex: 1,
    height: 44,
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  statusBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusBoxError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  btnSecondaryText: {
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  btnPrimary: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.primary,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
