import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useTheme } from '@/ui/theme';

function icon(symbol: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ fontSize: 20, color }}>{symbol}</Text>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Find help', tabBarLabel: 'Find', tabBarIcon: icon('🏠') }}
      />
      <Tabs.Screen
        name="about"
        options={{ title: 'About', tabBarLabel: 'About', tabBarIcon: icon('ℹ️') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarLabel: 'Settings', tabBarIcon: icon('⚙️') }}
      />
    </Tabs>
  );
}
