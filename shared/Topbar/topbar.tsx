import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import CustomText from "../text/CustomText";

interface TopbarProps {
  children?: React.ReactNode;
  showBack?: boolean;
  showProfileIcon?: boolean;
  onBackPress?: () => void;
}

const Topbar = ({
  children,
  showBack = false,
  showProfileIcon = true,
  onBackPress,
}: TopbarProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={10}
          >
            <AntDesign name="arrow-left" size={22} color="#000" />
          </Pressable>
        )}
        <CustomText bold style={styles.headingText}>
          {children}
        </CustomText>
      </View>

      {showProfileIcon && (
        <Pressable
          style={styles.rightContainer}
          // onPress={() => router.push("/profile")}
        >
          {/* <Image
            source={require("@/assets/icon/noti.png")}
            style={styles.image}
          /> */}
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
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    height: 40,
    width: 40,
    resizeMode: "contain",
  },
});
