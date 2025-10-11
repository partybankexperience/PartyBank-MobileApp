import { Stack } from "expo-router";

const Rootlayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ticket/index" options={{ headerShown: false }} />
      <Stack.Screen name="profile/index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Rootlayout;
