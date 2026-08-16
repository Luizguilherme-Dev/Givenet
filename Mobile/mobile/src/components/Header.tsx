import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { GiveNetTheme } from '@/constants/colors';
import { ModalServerConfig } from './ModalServerConfig';
import { ApiService } from '@/services/api';

export const Header: React.FC<{ title?: string; showBack?: boolean }> = ({
  title,
  showBack = false,
}) => {
  const router = useRouter();
  const { usuario, isAuthenticated, apiUrl } = useAuth();
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
      <View style={styles.container}>
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
                <Ionicons name="heart" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.brandTitle}>GiveNet</Text>
                <Text style={styles.brandSubtitle}>Plataforma de Doações</Text>
              </View>
            </TouchableOpacity>
          )}

          {title && <Text style={styles.headerTitle}>{title}</Text>}
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
    paddingVertical: 12,
    backgroundColor: GiveNetTheme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: GiveNetTheme.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GiveNetTheme.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GiveNetTheme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    color: GiveNetTheme.textSecondary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
    marginLeft: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  serverOnline: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  serverOffline: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  serverDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  serverText: {
    fontSize: 11,
    fontWeight: '700',
    color: GiveNetTheme.textSecondary,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: GiveNetTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  avatarButton: {
    padding: 2,
  },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GiveNetTheme.primaryDark,
    borderWidth: 2,
    borderColor: GiveNetTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
