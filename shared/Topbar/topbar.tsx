import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import CustomText from "../text/CustomText";

interface TopbarProps {
  children?: React.ReactNode;
  showBack?: boolean;
  showProfileIcon?: boolean;
}

const Topbar = ({ children, showBack = false, showProfileIcon = true }: TopbarProps) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBack && (
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <AntDesign name="arrow-left" size={22} color="#000" />
        </Pressable>
      )}

      <CustomText bold style={styles.headingText}>
        {children}
      </CustomText>
      {showProfileIcon && (
        <Pressable
          style={styles.rightContainer}
          onPress={() => router.push("/profile")}
        >
          <Image
            source={require("@/assets/images/profile.png")}
            style={styles.image}
          />
        </Pressable>
      )}
      
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
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },

  backButton: {
    marginRight: 8,
  },

  headingText: {
    fontSize: 20,
    flexShrink: 1,
  },

  rightContainer: {
    alignItems: "flex-end",
  },

  image: {
    height: 30,
    width: 30,
    resizeMode: "contain",
  },
});
