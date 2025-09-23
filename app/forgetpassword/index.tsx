import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomText from "@/shared/text/CustomText";
import Button from "@/shared/button";
import { Inputfield } from "@/shared/inputfield";
import { router } from "expo-router";

const ForgetPassword = () => {
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
          Don’t Worry! please Enter Address Associated We’ll Send You Reset
          Instruction.
        </CustomText>
      </View>
      <View style={{ marginTop: 12, gap: 6 }}>
        <Inputfield
          placeholder="usename@gmail.com"
          label="Email"
          leftIcon={true}
          leftIconSource={require("@/assets/icon/envilope.png")}
        />
        <View style={{ marginTop: 12 }}>
          <Button onPress={() => router.push("/forgetpassword/mail")}>
            Send
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
  },
  image: {
    height: 87,
    width: 87,
    resizeMode: "contain",
  },
});
