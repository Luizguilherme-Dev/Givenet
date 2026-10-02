import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';

export type StatusKey = 'agendado' | 'entregue' | 'cancelado' | 'desconhecido';

const MAP: Record<StatusKey, { label: string; fg: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
  agendado: {
    label: 'Aguardando entrega',
    fg: GiveNetTheme.warning,
    bg: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.34)',
    icon: 'time-outline',
  },
  entregue: {
    label: 'Entrega confirmada',
    fg: GiveNetTheme.success,
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.34)',
    icon: 'checkmark-circle',
  },
  cancelado: {
    label: 'Cancelada',
    fg: GiveNetTheme.danger,
    bg: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.34)',
    icon: 'close-circle',
  },
  desconhecido: {
    label: 'Em andamento',
    fg: GiveNetTheme.textSecondary,
    bg: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.14)',
    icon: 'ellipse-outline',
  },
};

/**
 * Traduz o status que JÁ VEM da API para uma apresentação visual.
 * ⚠️ Não altera, renomeia nem cria status — apenas mapeia o valor existente.
 */
export function resolveStatusKey(rawStatus?: string): StatusKey {
  const status = (rawStatus || '').toUpperCase();
  if (status === 'DOACAO_ENTREGUE') return 'entregue';
  if (status === 'CANCELADO') return 'cancelado';
  if (status === 'AGENDADO') return 'agendado';
  return 'desconhecido';
}

interface Props {
  status?: string;
  /** Exibe o texto "cru" da API em vez do rótulo amigável */
  raw?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pílula de status visual (amarelo = pendente, verde = sucesso, vermelho = cancelado). */
export const StatusPill: React.FC<Props> = ({ status, raw = false, style }) => {
  const key = resolveStatusKey(status);
  const cfg = MAP[key];

  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }, style]}>
      <Ionicons name={cfg.icon} size={13} color={cfg.fg} />
      <Text style={[styles.text, { color: cfg.fg }]} numberOfLines={1}>
        {raw ? status || '—' : cfg.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  text: {
    ...Type.caption,
    fontWeight: '800',
  },
});