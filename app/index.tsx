import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { useAuth } from "@/api/services/hooks/useAuth";

const SplashScreen = () => {
  const router = useRouter();
  const { getToken } = useAuth();

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        await onFetchUpdateAsync();
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    checkForUpdates();
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await getToken();
        console.log("Token exists:", token);

        if (!token) {
          router.replace("/login");
        } else {
          router.replace("/(mainapp)/(tabs)");
        }
      } catch (error) {
        console.error("Error checking token:", error);
        router.replace("/login");
      }
    };

    const timer = setTimeout(() => {
      checkAuthentication();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splash.png")}
        resizeMode="cover"
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
});

export default SplashScreen;
