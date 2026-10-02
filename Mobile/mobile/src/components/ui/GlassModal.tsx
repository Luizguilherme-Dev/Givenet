import React from 'react';
import {
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Glass, Radius, Shadow, Type } from '@/constants/design';
import { Platform } from 'react-native';

/** Blur real no iOS; no Android mantém a superfície translúcida sem blurTarget. */
const supportsBlur = Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 31);

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Conteúdo rolável opcional */
  scrollable?: boolean;
}

/**
 * Modal base com glassmorphism discreto.
 *
 * ⚠️ Componente de apresentação: `visible` e `onClose` são repassados
 * exatamente como recebidos pelos modais existentes. Nenhuma lógica muda.
 */
export const GlassModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  style,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, style]}>
              {/* Camada de vidro: blur onde disponível, translucidez como base */}
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {supportsBlur ? (
                  <BlurView
                    intensity={Glass.intensity}
                    tint="dark"
                    blurMethod={Platform.OS === 'android' ? Glass.androidMethod : undefined}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <View style={[StyleSheet.absoluteFill, styles.glassTint]} />
                <View style={styles.glassSheen} />
              </View>

              {(title || subtitle) && (
                <View style={styles.header}>
                  <View style={styles.headerTexts}>
                    {title ? <Text style={styles.title}>{title}</Text> : null}
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                  </View>
                  <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.closeBtn}>
                      <Ionicons name="close" size={18} color={GiveNetTheme.textSecondary} />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )}

              {children}
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
    backgroundColor: Glass.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Glass.border,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 18, 48, 0.72)',
    ...Shadow.raised,
  },
  glassTint: {
    backgroundColor: 'rgba(26, 18, 48, 0.55)',
  },
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    ...Type.heading,
    fontSize: 17,
    color: GiveNetTheme.textPrimary,
  },
  subtitle: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});