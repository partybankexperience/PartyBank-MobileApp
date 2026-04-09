import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "@/shared/toast/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Colors from "@/constants/Colors";
import { View } from "react-native";

const queryClient = new QueryClient();

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const insets = useSafeAreaInsets();

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.baseblack }}
      edges={["bottom", "left", "right"]}
    >
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View
        style={{ flex: 1, paddingTop: insets.top, backgroundColor: "#F8F9FC" }}
      >
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Slot />
          </ToastProvider>
        </QueryClientProvider>
      </View>
    </SafeAreaView>
  );
}
