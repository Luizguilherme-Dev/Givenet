import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function CadastroScreen() {
  const router = useRouter();
  const { cadastrar, login } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !telefone.trim() || !senha.trim()) {
      setFeedback({ text: 'Por favor, preencha todos os campos.', ok: false });
      return;
    }

    if (senha !== confirmarSenha) {
      setFeedback({ text: 'As senhas informadas não coincidem!', ok: false });
      return;
    }

    if (senha.length < 6) {
      setFeedback({ text: 'A senha deve ter no mínimo 6 caracteres.', ok: false });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha: senha.trim(),
        telefone: telefone.trim(),
        role: 'USER',
      });

      setFeedback({ text: '🎉 Conta criada com sucesso! Entrando...', ok: true });

      // Auto-login
      try {
        await login(email.trim(), senha.trim());
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1200);
      } catch {
        setTimeout(() => {
          router.replace('/login');
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({
        text: err.message || 'Erro ao realizar cadastro. Tente novamente.',
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={GiveNetTheme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="person-add" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Criar sua Conta</Text>
          <Text style={styles.subtitle}>
            Junte-se a nós e faça parte desta corrente do bem
          </Text>
        </View>

        <View style={styles.card}>
          {feedback && (
            <View
              style={[
                styles.feedbackBox,
                feedback.ok ? styles.feedbackSuccess : styles.feedbackError,
              ]}
            >
              <Ionicons
                name={feedback.ok ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={feedback.ok ? GiveNetTheme.success : GiveNetTheme.danger}
              />
              <Text
                style={[
                  styles.feedbackText,
                  { color: feedback.ok ? GiveNetTheme.success : GiveNetTheme.danger },
                ]}
              >
                {feedback.text}
              </Text>
            </View>
          )}

          {/* Nome Completo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={GiveNetTheme.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Maria da Silva"
                placeholderTextColor={GiveNetTheme.textPlaceholder}
                value={nome}
                onChangeText={(val) => {
                  setNome(val);
                  setFeedback(null);
                }}
              />
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-mail</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={GiveNetTheme.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={GiveNetTheme.textPlaceholder}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setFeedback(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Telefone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefone / WhatsApp</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={GiveNetTheme.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="(11) 98765-4321"
                placeholderTextColor={GiveNetTheme.textPlaceholder}
                value={telefone}
                onChangeText={(val) => {
                  setTelefone(val);
                  setFeedback(null);
                }}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha (mínimo 6 caracteres)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={GiveNetTheme.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Crie sua senha"
                placeholderTextColor={GiveNetTheme.textPlaceholder}
                value={senha}
                onChangeText={(val) => {
                  setSenha(val);
                  setFeedback(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={GiveNetTheme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={GiveNetTheme.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Repita sua senha"
                placeholderTextColor={GiveNetTheme.textPlaceholder}
                value={confirmarSenha}
                onChangeText={(val) => {
                  setConfirmarSenha(val);
                  setFeedback(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCadastro}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Criar Minha Conta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui cadastro? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GiveNetTheme.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GiveNetTheme.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
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
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
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
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 46,
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: GiveNetTheme.textMuted,
  },
  footerLink: {
    fontSize: 13,
    color: GiveNetTheme.primaryLight,
    fontWeight: '800',
  },
});
