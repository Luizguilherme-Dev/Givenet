import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Radius, Type } from '@/constants/design';

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Mensagem de erro (exibida em vermelho) */
  error?: string | null;
  /** Texto auxiliar exibido abaixo do campo */
  hint?: string;
  /** Destaque verde de sucesso */
  success?: boolean;
  /** Campo válido/ativo (feedback visual de foco) */
  focused?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightSlot?: React.ReactNode;
}

/**
 * Campo de texto estilizado (Material 3 + glass sutil).
 *
 * ⚠️ Repassa TODOS os props para o TextInput original (value, onChangeText,
 * keyboardType, secureTextEntry, maxLength...). Nenhum comportamento muda.
 */
export const TextField: React.FC<Props> = ({
  label,
  icon,
  error,
  hint,
  success = false,
  focused = false,
  containerStyle,
  rightSlot,
  style,
  ...rest
}) => {
  const borderColor = error
    ? GiveNetTheme.danger
    : success
      ? GiveNetTheme.success
      : focused
        ? GiveNetTheme.inputFocusBorder
        : GiveNetTheme.inputBorder;

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.wrap,
          { borderColor },
          focused && styles.wrapFocused,
          error ? styles.wrapError : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={error ? GiveNetTheme.danger : focused ? GiveNetTheme.primaryLight : GiveNetTheme.textMuted}
          />
        ) : null}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={GiveNetTheme.textPlaceholder}
          {...rest}
        />

        {rightSlot}
      </View>

      {error ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle" size={12} color={GiveNetTheme.danger} />
          <Text style={[styles.feedbackText, { color: GiveNetTheme.danger }]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...Type.caption,
    fontWeight: '800',
    color: GiveNetTheme.textSecondary,
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GiveNetTheme.inputBackground,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  wrapFocused: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  wrapError: {
    backgroundColor: 'rgba(239, 68, 68, 0.07)',
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: GiveNetTheme.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  feedbackText: {
    ...Type.caption,
    fontWeight: '700',
    flex: 1,
  },
  hint: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textMuted,
    marginTop: 6,
  },
});