import { useColorScheme } from "@/components/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";

const Approute = ({}) => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="forgetpassword/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="forgetpassword/mail"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="newpassword/mail"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(mainapp)/(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
};

export default Approute;
