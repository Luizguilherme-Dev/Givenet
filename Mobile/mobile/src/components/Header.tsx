import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GiveNetTheme } from '@/constants/colors';
import { Glass, Radius, Shadow, Type } from '@/constants/design';
import { ModalServerConfig } from './ModalServerConfig';
import { ApiService } from '@/services/api';

/** Blur real no iOS; no Android mantém a superfície translúcida sem blurTarget. */
const supportsBlur = Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 31);

export const Header: React.FC<{ title?: string; showBack?: boolean }> = ({
  title,
  showBack = false,
}) => {
  const router = useRouter();
  const { usuario, isAuthenticated, apiUrl } = useAuth();
  const insets = useSafeAreaInsets();
  const [modalServerVisible, setModalServerVisible] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function checkServer() {
      const res = await ApiService.testConnection();
      if (mounted) {
        setServerOnline(res.ok);
      }
    }
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [apiUrl]);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        {/* Camada glass discreta */}
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
        </View>

        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={GiveNetTheme.textPrimary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.8}
            >
              <View style={styles.logoBadge}>
                <Image
                  source={require('@/img/GivenetLogo.jpg')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.brandTitle}>GiveNet</Text>
                <Text style={styles.brandSubtitle}>Plataforma de Doações</Text>
              </View>
            </TouchableOpacity>
          )}

          {title && <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>}
        </View>

        <View style={styles.rightSection}>
          {/* Indicador de Status do Backend / Config de IP */}
          <TouchableOpacity
            style={[
              styles.serverBadge,
              serverOnline === true && styles.serverOnline,
              serverOnline === false && styles.serverOffline,
            ]}
            onPress={() => setModalServerVisible(true)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.serverDot,
                {
                  backgroundColor:
                    serverOnline === true
                      ? GiveNetTheme.success
                      : serverOnline === false
                        ? GiveNetTheme.danger
                        : GiveNetTheme.warning,
                },
              ]}
            />
            <Text style={styles.serverText}>API</Text>
          </TouchableOpacity>

          {/* Botão de Perfil / Login */}
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => router.push('/(tabs)/perfil')}
              activeOpacity={0.8}
            >
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarText}>
                  {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ModalServerConfig
        visible={modalServerVisible}
        onClose={() => setModalServerVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(18, 11, 34, 0.82)',
    borderBottomWidth: 1,
    borderBottomColor: Glass.border,
  },
  glassTint: {
    backgroundColor: 'rgba(15, 9, 31, 0.45)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: Glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.glow,
  },
  logoImage: {
    width: 34,
    height: 34,
    borderRadius: 11,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    ...Type.caption,
    fontSize: 10,
    fontWeight: '600',
    color: GiveNetTheme.textSecondary,
  },
  headerTitle: {
    ...Type.subheading,
    color: GiveNetTheme.textPrimary,
    marginLeft: 4,
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: Glass.border,
  },
  serverOnline: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  serverOffline: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  serverDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  serverText: {
    ...Type.caption,
    fontWeight: '800',
    color: GiveNetTheme.textSecondary,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    minHeight: 38,
    ...Shadow.glow,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  avatarButton: {
    padding: 2,
  },
  avatarBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: GiveNetTheme.primaryDark,
    borderWidth: 2,
    borderColor: GiveNetTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
});
