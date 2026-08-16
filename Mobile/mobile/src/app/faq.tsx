import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { FAQ_LIST } from '@/constants/data';

export default function FaqScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFaqs = FAQ_LIST.filter(
    (f) =>
      f.pergunta.toLowerCase().includes(search.toLowerCase()) ||
      f.resposta.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={GiveNetTheme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Perguntas Frequentes</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Informativo */}
        <View style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="help-circle" size={32} color={GiveNetTheme.primaryLight} />
          </View>
          <Text style={styles.headerTitle}>Central de Ajuda</Text>
          <Text style={styles.headerSubtitle}>
            Tire todas as suas dúvidas sobre doações, agendamentos, PIN e ONGs parceiras
          </Text>
        </View>

        {/* Busca */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={GiveNetTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar dúvida..."
            placeholderTextColor={GiveNetTheme.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={GiveNetTheme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista Accordion */}
        <View style={styles.faqList}>
          {filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => toggleAccordion(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestionText}>{faq.pergunta}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isExpanded ? GiveNetTheme.primaryLight : GiveNetTheme.textMuted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswerText}>{faq.resposta}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Card de Contato com Assistente */}
        <View style={styles.assistantCard}>
          <Ionicons name="chatbubbles" size={28} color={GiveNetTheme.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.assistantTitle}>Ainda tem dúvidas?</Text>
            <Text style={styles.assistantSub}>
              Fale diretamente com nosso Assistente Virtual GiveNet.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.assistantBtn}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Text style={styles.assistantBtnText}>Abrir Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GiveNetTheme.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GiveNetTheme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: GiveNetTheme.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GiveNetTheme.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.borderLight,
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: GiveNetTheme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
  },
  faqList: {
    gap: 10,
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: GiveNetTheme.textPrimary,
    lineHeight: 20,
  },
  faqAnswerBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: GiveNetTheme.cardSecondary,
  },
  faqAnswerText: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    lineHeight: 20,
  },
  assistantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    borderRadius: 18,
    padding: 16,
  },
  assistantTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
  },
  assistantSub: {
    fontSize: 11.5,
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
  },
  assistantBtn: {
    backgroundColor: GiveNetTheme.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  assistantBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
