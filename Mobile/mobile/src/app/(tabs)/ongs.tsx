import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { OngCard } from '@/components/OngCard';
import { GiveNetTheme } from '@/constants/colors';
import { ApiService } from '@/services/api';
import { Ong } from '@/types';

export default function OngsScreen() {
  const router = useRouter();
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = [
    'Todas',
    'Alimentos',
    'Roupas',
    'Educação',
    'Reabilitação',
    'Meio Ambiente',
  ];

  const fetchOngs = async () => {
    try {
      const data = await ApiService.getOngs();
      setOngs(data);
    } catch (e) {
      console.error('Erro ao buscar ONGs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOngs();
    setRefreshing(false);
  };

  const filteredOngs = ongs.filter((ong) => {
    const matchesSearch =
      ong.nome.toLowerCase().includes(search.toLowerCase()) ||
      (ong.sobre && ong.sobre.toLowerCase().includes(search.toLowerCase())) ||
      (ong.sede && ong.sede.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'Todas') return true;

    const tipos = Array.isArray(ong.tiposAceitos)
      ? ong.tiposAceitos.join(' ').toLowerCase()
      : typeof ong.tiposAceitos === 'string'
        ? (ong.tiposAceitos as string).toLowerCase()
        : '';

    const sobre = (ong.sobre || '').toLowerCase();
    const atuacao = (ong.atuacao || []).join(' ').toLowerCase();

    return (
      tipos.includes(selectedCategory.toLowerCase()) ||
      sobre.includes(selectedCategory.toLowerCase()) ||
      atuacao.includes(selectedCategory.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={GiveNetTheme.primaryLight}
            colors={[GiveNetTheme.primaryLight]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Título da Página */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>ONGs Parceiras</Text>
          <Text style={styles.pageSubtitle}>
            Organizações verificadas que transformam realidades no Brasil
          </Text>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={GiveNetTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ONG por nome, cidade ou causa..."
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

        {/* Categorias / Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  isSelected && styles.catChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    isSelected && styles.catChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Lista de ONGs */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={GiveNetTheme.primaryLight} />
            <Text style={styles.loadingText}>Carregando instituições parceiras...</Text>
          </View>
        ) : filteredOngs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={48} color={GiveNetTheme.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma ONG encontrada</Text>
            <Text style={styles.emptySubtitle}>
              Tente buscar por outro termo ou selecione a categoria "Todas".
            </Text>
          </View>
        ) : (
          <View style={styles.ongsList}>
            {filteredOngs.map((ong) => (
              <OngCard
                key={ong.id}
                ong={ong}
                onDoarPress={() => router.push('/(tabs)/doacao')}
                onDetalhesPress={(o) => router.push(`/ong/${o.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GiveNetTheme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: GiveNetTheme.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: GiveNetTheme.textSecondary,
    marginTop: 2,
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: GiveNetTheme.textPrimary,
    fontSize: 13,
  },
  categoriesScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 2,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: GiveNetTheme.cardBackground,
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
  },
  catChipActive: {
    backgroundColor: GiveNetTheme.primary,
    borderColor: GiveNetTheme.primaryLight,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: GiveNetTheme.textSecondary,
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    color: GiveNetTheme.textSecondary,
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: GiveNetTheme.cardBackground,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GiveNetTheme.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GiveNetTheme.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: GiveNetTheme.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  ongsList: {
    gap: 4,
  },
});
