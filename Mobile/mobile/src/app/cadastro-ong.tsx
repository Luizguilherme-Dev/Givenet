import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GiveNetTheme } from '@/constants/colors';
import { ApiService } from '@/services/api';

type SolicitacaoOng = {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  responsavelNome: string;
  senha: string;
  tiposAceitos: string;
  horarios: string;
};

type CampoSolicitacao = {
  name: keyof Omit<SolicitacaoOng, 'senha'>;
  label: string;
  placeholder: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  required?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength: number;
  digitsOnly?: boolean;
};

const campos: CampoSolicitacao[] = [
  {
    name: 'nome',
    label: 'Nome da organização',
    placeholder: 'Ex: Associação Esperança',
    icon: 'business-outline',
    required: true,
    maxLength: 100,
  },
  {
    name: 'cnpj',
    label: 'CNPJ',
    placeholder: '00.000.000/0000-00',
    icon: 'document-text-outline',
    keyboardType: 'phone-pad',
    maxLength: 14,
    digitsOnly: true,
  },
  {
    name: 'email',
    label: 'E-mail institucional',
    placeholder: 'contato@organizacao.org',
    icon: 'mail-outline',
    required: true,
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    maxLength: 150,
  },
  {
    name: 'telefone',
    label: 'Telefone',
    placeholder: '(11) 98765-4321',
    icon: 'call-outline',
    keyboardType: 'phone-pad',
    maxLength: 11,
    digitsOnly: true,
  },
  {
    name: 'endereco',
    label: 'Endereço',
    placeholder: 'Rua, número, bairro e cidade',
    icon: 'location-outline',
    maxLength: 255,
  },
  {
    name: 'responsavelNome',
    label: 'Nome do responsável',
    placeholder: 'Nome completo',
    icon: 'person-outline',
    required: true,
    maxLength: 100,
  },
  {
    name: 'tiposAceitos',
    label: 'Tipos de doação aceitos',
    placeholder: 'Ex: alimentos, roupas, materiais escolares',
    icon: 'gift-outline',
    maxLength: 255,
  },
  {
    name: 'horarios',
    label: 'Horários de atendimento',
    placeholder: 'Ex: segunda a sexta, das 9h às 17h',
    icon: 'time-outline',
    maxLength: 255,
  },
];

const formularioInicial: SolicitacaoOng = {
  nome: '',
  cnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  responsavelNome: '',
  senha: '',
  tiposAceitos: '',
  horarios: '',
};

export default function CadastroOngScreen() {
  const router = useRouter();
  const [form, setForm] = useState<SolicitacaoOng>(formularioInicial);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const alterar = (name: keyof SolicitacaoOng, value: string) => {
    setForm((atual) => ({ ...atual, [name]: name === 'senha' ? value.trim() : value }));
    setFeedback(null);
  };

  const enviar = async () => {
    if (!form.nome.trim() || !form.email.trim() || !form.responsavelNome.trim() || !form.senha) {
      setFeedback('Preencha os campos obrigatórios.');
      return;
    }
    if (form.senha.length < 6) {
      setFeedback('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      await ApiService.solicitarCadastroOng({
        ...form,
        nome: form.nome.trim(),
        email: form.email.trim(),
        responsavelNome: form.responsavelNome.trim(),
        cnpj: form.cnpj.trim(),
        telefone: form.telefone.trim(),
        endereco: form.endereco.trim(),
        tiposAceitos: form.tiposAceitos.trim(),
        horarios: form.horarios.trim(),
      });
      setEnviado(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível enviar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Solicitação enviada!</Text>
          <Text style={styles.subtitle}>
            Recebemos os dados da sua organização. A solicitação será analisada em até 3 dias úteis.
            Você poderá acessar a plataforma após a aprovação.
          </Text>
          <TouchableOpacity style={styles.submitBtn} onPress={() => router.replace('/login')}>
            <Text style={styles.submitBtnText}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            <Ionicons name="business" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Cadastro de ONG</Text>
          <Text style={styles.subtitle}>
            Envie os dados da sua organização para iniciar a análise.
          </Text>
        </View>

        <View style={styles.card}>
          {feedback && (
            <View style={styles.feedbackBox}>
              <Ionicons name="alert-circle" size={18} color={GiveNetTheme.danger} />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}

          {campos.map((campo) => (
            <View style={styles.inputGroup} key={campo.name}>
              <Text style={styles.inputLabel}>
                {campo.label}{campo.required ? ' *' : ''}
              </Text>
              <View style={styles.inputWrap}>
                <Ionicons name={campo.icon} size={18} color={GiveNetTheme.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder={campo.placeholder}
                  placeholderTextColor={GiveNetTheme.textPlaceholder}
                  value={form[campo.name]}
                  onChangeText={(value) =>
                    alterar(
                      campo.name,
                      campo.digitsOnly
                        ? value.replace(/\D/g, '').slice(0, campo.maxLength)
                        : value
                    )
                  }
                  keyboardType={campo.keyboardType || 'default'}
                  autoCapitalize={campo.autoCapitalize || 'sentences'}
                  autoCorrect={campo.name !== 'email'}
                  maxLength={campo.maxLength}
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Crie a senha de acesso (mínimo 6 caracteres) *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={GiveNetTheme.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Usada após a aprovação"
                placeholderTextColor={GiveNetTheme.textPlaceholder}
                value={form.senha}
                onChangeText={(value) => alterar('senha', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                maxLength={72}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={GiveNetTheme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={enviar}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Enviar solicitação</Text>
            )}
          </TouchableOpacity>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui acesso? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.footerLink}>Entrar</Text>
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
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
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
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: GiveNetTheme.danger,
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
    minHeight: 46,
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
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
  successCard: {
    margin: 24,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GiveNetTheme.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
