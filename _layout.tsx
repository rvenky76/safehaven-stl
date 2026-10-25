import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useStore } from '@/store/AppStore';
import { ThemeProvider, useTheme } from '@/ui/theme';

function ThemedApp() {
  const { settings, updateSettings } = useStore();
  const osScheme = useColorScheme(); // 'light' | 'dark' | null
  const resolved = settings.theme === 'system' ? (osScheme === 'light' ? 'light' : 'dark') : settings.theme;
  return (
    <ThemeProvider
      mode={resolved}
      onModeChange={(m) => updateSettings({ theme: m })}
    >
      <ThemedStack />
    </ThemeProvider>
  );
}

function ThemedStack() {
  const { colors, mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="center/[id]" options={{ title: 'Center' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}
