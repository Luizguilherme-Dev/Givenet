import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GiveNetTheme } from '@/constants/colors';
import { Motion, Radius, Type } from '@/constants/design';

export type ProgressState = 'done' | 'current' | 'pending' | 'error';

export interface ProgressStep {
  key: string;
  label: string;
  caption?: string;
  icon: keyof typeof Ionicons.glyphMap;
  state: ProgressState;
}

interface Props {
  steps: ProgressStep[];
}

const STATE_COLOR: Record<ProgressState, string> = {
  done: GiveNetTheme.success,
  current: GiveNetTheme.warning,
  pending: GiveNetTheme.textMuted,
  error: GiveNetTheme.danger,
};

/**
 * Timeline / status tracker visual.
 *
 * ⚠️ Recebe apenas `steps` já calculados pelo chamador a partir dos status
 * existentes. Não lê, escreve ou altera nenhuma regra de negócio.
 */
export const ProgressStepper: React.FC<Props> = ({ steps }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: Motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, steps]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const color = STATE_COLOR[step.state];
        const nextColor = isLast ? color : STATE_COLOR[steps[index + 1].state];

        return (
          <View key={step.key} style={styles.row}>
            {/* Coluna do marcador + linha */}
            <View style={styles.railCol}>
              <View
                style={[
                  styles.dot,
                  { borderColor: color },
                  step.state === 'done' && { backgroundColor: color },
                  step.state === 'current' && styles.dotCurrent,
                  step.state === 'error' && { backgroundColor: color },
                ]}
              >
                {step.state === 'done' || step.state === 'error' ? (
                  <Ionicons
                    name={step.state === 'done' ? 'checkmark' : 'close'}
                    size={11}
                    color="#0B0618"
                  />
                ) : (
                  <View style={[styles.dotCore, { backgroundColor: color }]} />
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        step.state === 'done' ? color : 'rgba(255, 255, 255, 0.09)',
                    },
                  ]}
                >
                  {step.state === 'done' && nextColor !== color ? null : null}
                </View>
              )}
            </View>

            {/* Conteúdo do passo */}
            <View style={[styles.content, !isLast && styles.contentSpaced]}>
              <View style={styles.contentTop}>
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor:
                        step.state === 'pending' ? 'rgba(255, 255, 255, 0.05)' : `${color}22`,
                      borderColor: step.state === 'pending' ? 'rgba(255, 255, 255, 0.08)' : `${color}55`,
                    },
                  ]}
                >
                  <Ionicons
                    name={step.icon}
                    size={13}
                    color={step.state === 'pending' ? GiveNetTheme.textMuted : color}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        step.state === 'pending' ? GiveNetTheme.textMuted : GiveNetTheme.textPrimary,
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {step.caption ? <Text style={styles.caption}>{step.caption}</Text> : null}
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  railCol: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dotCurrent: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  dotCore: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  line: {
    flex: 1,
    width: 2,
    borderRadius: 2,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 1,
  },
  contentSpaced: {
    paddingBottom: 16,
  },
  contentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Type.bodyStrong,
    flex: 1,
  },
  caption: {
    ...Type.caption,
    fontWeight: '500',
    color: GiveNetTheme.textMuted,
    marginTop: 3,
    marginLeft: 32,
  },
});