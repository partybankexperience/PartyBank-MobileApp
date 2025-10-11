import { Image, StyleSheet, View, Alert } from "react-native";
import React, { useState } from "react";
import CustomText from "@/shared/text/CustomText";
import Button from "@/shared/button";
import { Inputfield } from "@/shared/inputfield";
import { router } from "expo-router";
import { useResetPasswordInitiate } from "@/api/services/hooks/useAuth";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const resetPasswordMutation = useResetPasswordInitiate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSend = async () => {
    const error = validateEmail(email);
    setEmailError(error);

    if (error) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ email });

      // Navigate to next screen with email as parameter
      router.push({
        pathname: "/forgetpassword/mail",
        params: { email },
      });
    } catch (error) {
      // Error is already handled in the mutation by the toast
      // console.error("Reset password error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.image}
      />
      <View style={{ marginTop: 42, gap: 6 }}>
        <CustomText extrabold={true} variant="h2">
          Forgot Password ?
        </CustomText>
        <CustomText medium={true} variant="h5" style={{ maxWidth: 300 }}>
          Don't Worry! Please enter the email address associated with your
          account and we'll send you reset instructions.
        </CustomText>
      </View>
      <View style={{ marginTop: 12, gap: 6 }}>
        <Inputfield
          placeholder="username@gmail.com"
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError("");
          }}
          leftIcon={true}
          leftIconSource={require("@/assets/icon/envilope.png")}
          keyboardType="email-address"
        />
        <View style={{ marginTop: 12 }}>
          <Button
            onPress={handleSend}
            loading={resetPasswordMutation.isPending}
            disabled={resetPasswordMutation.isPending || !email}
          >
            {resetPasswordMutation.isPending ? "Sending..." : "Send"}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  image: {
    height: 87,
    width: 87,
    resizeMode: "contain",
  },
});
