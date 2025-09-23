import { Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "../text/CustomText";

interface TopbarProps {
  children?: React.ReactNode;
}

const Topbar = ({ children, }: TopbarProps) => {
  const router = useRouter();

  const handleGoback = () => {
    router.back();
  };

  return (
    <View style={styles.header}>
      <CustomText bold={true} style={styles.headingText}>
        {children}
      </CustomText>

      <View style={styles.rightContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.image}
        />
      </View>
    </View>
  );
};

export default Topbar;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },

  rightContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  headingText: {
    textAlign: "center",
    fontSize: 20,
    flexShrink: 1, // Prevents text from overflowing
  },
  image: {
    height: 30,
    width: 30,
    resizeMode: "contain",
  },
});
