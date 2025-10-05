import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "@/shared/toast/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "RedHatDisplay-Regular": require("../assets/fonts/RedHatDisplay-Regular.ttf"),
    "RedHatDisplay-Bold": require("../assets/fonts/RedHatDisplay-Bold.ttf"),
    "RedHatDisplay-Medium": require("../assets/fonts/RedHatDisplay-Medium.ttf"),
    "RedHatDisplay-ExtraBold": require("../assets/fonts/RedHatDisplay-ExtraBold.ttf"),
  });
  useEffect(() => {
    async function hideSplash() {
      await SplashScreen.hideAsync();
    }

    hideSplash();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <StatusBar style="dark" backgroundColor="#fff" />
          <Slot />
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaView>
  );
}
