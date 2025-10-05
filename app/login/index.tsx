import { Image, Pressable, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import CustomText from "@/shared/text/CustomText";
import { Inputfield } from "@/shared/inputfield";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/shared/button";
import { router } from "expo-router";
import { useLogin } from "@/api/services/hooks/useAuth";
import { useToast } from "@/shared/toast/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

  const loginMutation = useLogin();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    if (!email || !password) {
      showToast("Login successful!", "error");
      return;
    }

    loginMutation.mutate({ email, password });
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
      <View style={{ marginTop: 12, gap: 6 }}>
        <CustomText extrabold={true} variant="h1">
          Login !
        </CustomText>
        <CustomText bold={true} variant="h5">
          Please Enter Your Details.
        </CustomText>
      </View>
      <View style={{ marginTop: 12, gap: 6 }}>
        <Inputfield
          placeholder="username@gmail.com"
          label="Email"
          value={email}
          onChangeText={setEmail}
          leftIcon={true}
          leftIconSource={require("@/assets/icon/envilope.png")}
          keyboardType="email-address"
        />

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

        <Pressable
          style={{ alignSelf: "flex-end" }}
          onPress={() => router.push("/forgetpassword")}
        >
          <CustomText bold={true} color={Colors.light.primary}>
            Forgot Password ?
          </CustomText>
        </Pressable>

        <View style={{ marginTop: 12 }}>
          <Button
            onPress={handleLogin}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Log In"}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default Login;

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
