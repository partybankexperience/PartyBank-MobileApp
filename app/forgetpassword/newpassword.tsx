import { Image, Pressable, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import CustomText from "@/shared/text/CustomText";
import { Inputfield } from "@/shared/inputfield";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/shared/button";
import { router } from "expo-router";

const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const renderEyeIcon = () => (
    <Ionicons
      name={showPassword ? "eye-off-outline" : "eye-outline"}
      size={24}
      color={Colors.light.baseblack}
    />
  );
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.image}
      />
      <View style={{ marginTop: 22, gap: 6 }}>
        <CustomText extrabold={true} variant="h2">
          Create New Password
        </CustomText>
        <CustomText medium={true} variant="h5">
          Your New Password Must Be Different From Previous Used Passwords.
        </CustomText>
      </View>
      <View style={{ marginTop: 12, gap: 6 }}>
        <Inputfield
          placeholder="*******"
          label="Password"
          value={password}
          onChangeText={setPassword}
          leftIcon={true}
          leftIconSource={require("@/assets/icon/padlock.png")}
          rightIcon={true}
          rightIconSource={renderEyeIcon()}
          onRightIconPress={togglePasswordVisibility}
          secureTextEntry={!showPassword}
        />
        <Inputfield
          placeholder="*******"
          label="Confirm Password"
          value={password}
          onChangeText={setPassword}
          leftIcon={true}
          leftIconSource={require("@/assets/icon/padlock.png")}
          secureTextEntry
        />

        <View style={{ marginTop: 12 }}>
          <Button onPress={() => router.push("/")}>Reset Password</Button>
        </View>
      </View>
    </View>
  );
};

export default NewPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  image: {
    height: 87,
    width: 87,
    resizeMode: "contain",
  },
});
