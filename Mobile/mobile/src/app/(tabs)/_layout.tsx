import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GiveNetTheme } from '@/constants/colors';
import { Glass, Radius, Shadow } from '@/constants/design';
import { TabBarIcon } from '@/components/ui';

/**
 * Bottom navigation moderna (Material 3 + glass discreto).
 *
 * ⚠️ As MESMAS cinco rotas continuam registradas com os MESMOS `name`,
 * os MESMOS títulos e os MESMOS ícones (apenas variantes focused/outline).
 * Nada foi criado, removido ou renomeado.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: GiveNetTheme.textMuted,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingHorizontal: 8,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            {Platform.OS !== 'web' ? (
              <BlurView
                intensity={Glass.intensity}
                tint="dark"
                blurMethod={Platform.OS === 'android' ? Glass.androidMethod : undefined}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={[StyleSheet.absoluteFill, styles.glassTint]} />
            <View style={styles.sheen} />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="doacao"
        options={{
          title: 'Doação',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ongs"
        options={{
          title: 'ONGs',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'business' : 'business-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Assistente',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Glass.border,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 11, 34, 0.86)',
    ...Shadow.raised,
  },
  glassTint: {
    backgroundColor: 'rgba(18, 11, 34, 0.55)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
});
