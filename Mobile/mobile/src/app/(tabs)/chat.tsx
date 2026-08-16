import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { GiveNetTheme } from '@/constants/colors';
import { ApiService } from '@/services/api';
import { ChatMessage } from '@/types';

const RESPOSTAS_SISTEMA: Record<string, string> = {
  roupas: '👕 Nossas ONGs parceiras WWF Brasil, Cáritas e Instituto Ayrton Senna aceitam roupas e agasalhos em bom estado! Você pode agendar a coleta na aba Doação.',
  alimentos: '🥫 Aceitamos alimentos não perecíveis como arroz, feijão, macarrão, óleo e leite em pó. A Cáritas e a WWF são ótimas opções!',
  aacd: '🦽 A AACD é especializada em reabilitação física e aceita cadeiras de rodas, muletas, andadores e equipamentos ortopédicos.',
  pin: '🔢 O PIN de confirmação é um código de 4 dígitos gerado ao registrar sua doação. Ele é usado na entrega para validar o status como Entregue.',
  coleta: '🕒 As coletas podem ser agendadas de segunda a sábado em horários das 08h às 18h diretamente no formulário de doação.',
};

const RESPOSTAS_PADRAO = [
  'Olá! Posso ajudar com informações sobre doações, horários e ONGs parceiras.',
  'Para agendar uma doação, basta acessar a aba Doação e escolher a ONG de sua preferência.',
  'Todas as doações no GiveNet possuem código PIN e comprovante com QR Code.',
  'Caso precise de ajuda com um agendamento específico, você pode consultar a aba Doação > Agendamentos.',
  'Obrigado por apoiar causas sociais através da GiveNet! Cada gesto transforma vidas.',
];

export default function ChatScreen() {
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [digitando, setDigitando] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sugestoes = [
    'O que posso doar?',
    'Como funciona o PIN?',
    'Quais ONGs aceitam roupas?',
    'Como agendar a coleta?',
  ];

  const carregarMensagens = async () => {
    try {
      const data = await ApiService.getChatMensagens();
      if (data && data.length > 0) {
        setMensagens(data);
      } else {
        setMensagens([
          {
            id: 1,
            usuario: 'sistema',
            mensagem:
              'Olá! Sou o Assistente Virtual GiveNet 🤖💜 Como posso te ajudar hoje com suas doações?',
            data: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMensagens([
        {
          id: 1,
          usuario: 'sistema',
          mensagem:
            'Olá! Sou o Assistente Virtual GiveNet 🤖💜 Como posso te ajudar hoje com suas doações?',
          data: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    carregarMensagens();
  }, []);

  const enviarMensagem = async (textoParaEnviar?: string) => {
    const texto = (textoParaEnviar || inputMsg).trim();
    if (!texto || enviando) return;

    setInputMsg('');
    setEnviando(true);

    const novaMsgUsuario: ChatMessage = {
      id: Date.now(),
      usuario: 'paciente',
      mensagem: texto,
      data: new Date().toISOString(),
    };

    setMensagens((prev) => [...prev, novaMsgUsuario]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Salva no backend
      await ApiService.enviarChatMensagem(texto, 'paciente');
    } catch (e) {
      console.warn('Erro ao sincronizar mensagem com backend:', e);
    }

    setDigitando(true);

    // Resposta inteligente
    setTimeout(async () => {
      let resposta = '';
      const lower = texto.toLowerCase();

      if (lower.includes('roupa') || lower.includes('agasalho')) {
        resposta = RESPOSTAS_SISTEMA.roupas;
      } else if (lower.includes('alimento') || lower.includes('comida') || lower.includes('arroz')) {
        resposta = RESPOSTAS_SISTEMA.alimentos;
      } else if (lower.includes('aacd') || lower.includes('cadeira') || lower.includes('muleta')) {
        resposta = RESPOSTAS_SISTEMA.aacd;
      } else if (lower.includes('pin') || lower.includes('codigo') || lower.includes('qr')) {
        resposta = RESPOSTAS_SISTEMA.pin;
      } else if (lower.includes('coleta') || lower.includes('horario') || lower.includes('agendar')) {
        resposta = RESPOSTAS_SISTEMA.coleta;
      } else {
        resposta = RESPOSTAS_PADRAO[Math.floor(Math.random() * RESPOSTAS_PADRAO.length)];
      }

      const novaMsgSistema: ChatMessage = {
        id: Date.now() + 1,
        usuario: 'sistema',
        mensagem: resposta,
        data: new Date().toISOString(),
      };

      setMensagens((prev) => [...prev, novaMsgSistema]);
      setDigitando(false);
      setEnviando(false);

      try {
        await ApiService.enviarChatMensagem(resposta, 'sistema');
      } catch (e) {
        // silencioso
      }

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 700);
  };

  return (
    <View style={styles.container}>
      <Header title="Assistente GiveNet" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {mensagens.map((msg) => {
            const isUser = msg.usuario === 'paciente' || msg.usuario === 'usuario';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowSystem,
                ]}
              >
                {!isUser && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleSystem,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleAuthor,
                      isUser ? styles.authorUser : styles.authorSystem,
                    ]}
                  >
                    {isUser ? 'Você' : 'Assistente GiveNet'}
                  </Text>

                  <Text
                    style={[
                      styles.bubbleText,
                      isUser ? styles.textUser : styles.textSystem,
                    ]}
                  >
                    {msg.mensagem}
                  </Text>

                  <Text style={styles.bubbleTime}>
                    {new Date(msg.data).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}

          {digitando && (
            <View style={[styles.messageRow, styles.messageRowSystem]}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.bubble, styles.bubbleSystem]}>
                <Text style={styles.typingText}>Digitando...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Sugestões Rápidas */}
        <View style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {sugestoes.map((sug, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => enviarMensagem(sug)}
                disabled={enviando || digitando}
              >
                <Text style={styles.suggestionText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Barra de Entrada de Mensagem */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Digite sua dúvida sobre doações..."
            placeholderTextColor={GiveNetTheme.textPlaceholder}
            value={inputMsg}
            onChangeText={setInputMsg}
            multiline
            maxLength={300}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputMsg.trim() || enviando) && styles.sendBtnDisabled,
            ]}
            onPress={() => enviarMensagem()}
            disabled={!inputMsg.trim() || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GiveNetTheme.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 10,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowSystem: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: GiveNetTheme.primary,
    borderBottomRightRadius: 4,
  },
  bubbleSystem: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    borderBottomLeftRadius: 4,
  },
  bubbleAuthor: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 3,
  },
  authorUser: {
    color: '#E9D5FF',
  },
  authorSystem: {
    color: GiveNetTheme.primaryLight,
  },
  bubbleText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textSystem: {
    color: GiveNetTheme.textPrimary,
  },
  bubbleTime: {
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingText: {
    fontSize: 12,
    color: GiveNetTheme.textSecondary,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingVertical: 6,
    backgroundColor: GiveNetTheme.background,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: GiveNetTheme.cardSecondary,
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  suggestionText: {
    color: GiveNetTheme.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: GiveNetTheme.cardBackground,
    borderTopWidth: 1,
    borderTopColor: GiveNetTheme.border,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    backgroundColor: GiveNetTheme.inputBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GiveNetTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
