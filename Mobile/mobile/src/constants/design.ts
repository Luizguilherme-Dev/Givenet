import { Platform } from 'react-native';
import { GiveNetTheme } from '@/constants/colors';

/**
 * Design tokens do redesign mobile do GiveNet.
 *
 * ⚠️ Camada PURAMENTE VISUAL.
 * Nenhuma constante aqui altera dados, rotas, endpoints, requisições,
 * autenticação ou regras de negócio. São apenas valores de estilo.
 */

/** Espaçamento (escala de 4pt — confortável para telas pequenas). */
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Raios de canto arredondados (Material 3 friendly). */
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

/** Tipografia. */
export const Type = {
  display: { fontSize: 26, fontWeight: '900' as const, letterSpacing: -0.4 },
  title: { fontSize: 20, fontWeight: '900' as const, letterSpacing: -0.2 },
  heading: { fontSize: 16, fontWeight: '800' as const },
  subheading: { fontSize: 14, fontWeight: '800' as const },
  body: { fontSize: 13, fontWeight: '500' as const },
  bodyStrong: { fontSize: 13, fontWeight: '700' as const },
  caption: { fontSize: 11.5, fontWeight: '600' as const },
  label: { fontSize: 10.5, fontWeight: '800' as const, letterSpacing: 0.6 },
} as const;

/** Áreas de toque confortáveis (mínimo recomendado 44pt). */
export const Touch = {
  min: 44,
  button: 50,
} as const;

/** Sombras suaves (mantidas discretas por performance em Android modesto). */
export const Shadow = {
  none: {},
  soft: Platform.select({
    ios: {
      shadowColor: '#05020C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
    },
    android: { elevation: 3 },
    default: {},
  })!,
  raised: Platform.select({
    ios: {
      shadowColor: '#05020C',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 18,
    },
    android: { elevation: 6 },
    default: {},
  })!,
  glow: Platform.select({
    ios: {
      shadowColor: GiveNetTheme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
    },
    android: { elevation: 8 },
    default: {},
  })!,
} as const;

/** Durações de animação (curtas = sensação de app nativo e leve). */
export const Motion = {
  fast: 120,
  base: 180,
  slow: 320,
  success: 520,
} as const;

/**
 * Camada "glass" — translúcida e sutil.
 * Usada APENAS em cards especiais, bottom nav, modais, elementos flutuantes.
 */
export const Glass = {
  /** Fundo translúcido claro (destaques) */
  tint: 'rgba(124, 58, 237, 0.16)',
  /** Fundo translúcido neutro (superfícies) */
  neutral: 'rgba(255, 255, 255, 0.055)',
  /** Borda sutil superior */
  border: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  /** Borda roxa sutil */
  borderPrimary: 'rgba(139, 92, 246, 0.38)',
  /** Overlay de modais */
  overlay: 'rgba(6, 3, 15, 0.72)',
  /** Intensidade padrão de blur (baixa = leve) */
  intensity: 28,
  /** Usa translucidez no Android até os componentes receberem um blurTarget configurado. */
  androidMethod: 'none' as const,
} as const;

/** Cores semânticas de status — mapeadas a partir dos status existentes do backend. */
export const StatusColors = {
  agendado: {
    fg: GiveNetTheme.warning,
    bg: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.34)',
  },
  entregue: {
    fg: GiveNetTheme.success,
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.34)',
  },
  cancelado: {
    fg: GiveNetTheme.danger,
    bg: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.34)',
  },
} as const;

/** Padding inferior para conteúdo que fica acima da bottom navigation. */
export const TabBarSpace = 96;