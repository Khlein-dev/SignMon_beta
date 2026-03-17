import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>

        {/* TABS ROUTE */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="lessons/lesson1" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson2" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson3" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson4" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson5" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson6" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson7" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson8" options={{ headerShown: false }} />

      
        <Stack.Screen name="lessons/quiz/quiz1" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/quiz/quiz2" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/quiz/quiz3" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/quiz/quiz4" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/quiz/quiz5" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/quiz/quiz6" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/quiz/quiz7" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/quiz/quiz8" options={{ headerShown: false }} />

        {/* MODAL */}
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />

      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}