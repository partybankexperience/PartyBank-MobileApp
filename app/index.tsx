import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { Redirect } from "expo-router";

const SplashScreen = () => {
  const router = useRouter();
  const [redirect, setRedirect] = React.useState(false);

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // console.error(`Error fetching latest Expo update: ${error}`);
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
    const timer = setTimeout(() => {
      setRedirect(true);
      router.push("/login");
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
