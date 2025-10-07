import { Image, StyleSheet, View, Alert } from "react-native";
import React, { useState } from "react";
import CustomText from "@/shared/text/CustomText";
import { Inputfield } from "@/shared/inputfield";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/shared/button";
import { router, useLocalSearchParams } from "expo-router";
import { useResetPasswordSubmit } from "@/api/services/hooks/useAuth";

const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const { email } = useLocalSearchParams();

  const resetPasswordMutation = useResetPasswordSubmit();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const renderEyeIcon = (show: boolean) => (
    <Ionicons
      name={show ? "eye-off-outline" : "eye-outline"}
      size={24}
      color={Colors.light.baseblack}
    />
  );

  const handleResetPassword = async () => {
    const passwordValidationError = validatePassword(password);
    const confirmPasswordValidationError =
      validateConfirmPassword(confirmPassword);

    setPasswordError(passwordValidationError);
    setConfirmPasswordError(confirmPasswordValidationError);

    if (passwordValidationError || confirmPasswordValidationError) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        email: email as string,
        password: password,
        confirmPassword: confirmPassword,
      });

      // Navigate to login screen on success
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      // Error is already handled in the mutation by the toast
      console.error("Reset password error:", error);
    }
  };

  const isFormValid =
    password && confirmPassword && !passwordError && !confirmPasswordError;

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
        <CustomText medium={true} variant="h5" style={styles.subtitle}>
          Your new password must be different from previously used passwords.
        </CustomText>
      </View>
      <View style={{ marginTop: 12, gap: 6 }}>
        <Inputfield
          placeholder="Enter new password"
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError("");
          }}
          leftIcon={true}
          leftIconSource={require("@/assets/icon/padlock.png")}
          rightIcon={true}
          rightIconSource={renderEyeIcon(showPassword)}
          onRightIconPress={togglePasswordVisibility}
          secureTextEntry={!showPassword}
        />

        <Inputfield
          placeholder="Confirm new password"
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError("");
          }}
          leftIcon={true}
          leftIconSource={require("@/assets/icon/padlock.png")}
          rightIcon={true}
          rightIconSource={renderEyeIcon(showConfirmPassword)}
          onRightIconPress={toggleConfirmPasswordVisibility}
          secureTextEntry={!showConfirmPassword}
        />

        <View style={{ marginTop: 12 }}>
          <Button
            onPress={handleResetPassword}
            loading={resetPasswordMutation.isPending}
            disabled={
              resetPasswordMutation.isPending || !password || !confirmPassword
            }
          >
            {resetPasswordMutation.isPending
              ? "Resetting..."
              : "Reset Password"}
          </Button>
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
  subtitle: {
    maxWidth: 300,
    lineHeight: 20,
  },
  requirementsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.light.grey100,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: Colors.light.text,
  },
  requirement: {
    fontSize: 12,
    color: Colors.light.text2,
    marginBottom: 2,
  },
  requirementMet: {
    color: Colors.light.green,
    fontWeight: "500",
  },
  backToLogin: {
    textAlign: "center",
    color: Colors.light.primary,
    textDecorationLine: "underline",
    marginTop: 16,
    fontSize: 14,
  },
});
