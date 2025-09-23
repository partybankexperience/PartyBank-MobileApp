import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import CustomText from "@/shared/text/CustomText";
import Button from "@/shared/button";
import { Inputfield } from "@/shared/inputfield";
import { router } from "expo-router";
import Colors from "@/constants/Colors";

const Mail = () => {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Focus the active input
    if (inputRefs.current[activeOTPIndex]) {
      inputRefs.current[activeOTPIndex]?.focus();
    }
  }, [activeOTPIndex]);

  useEffect(() => {
    if (otp.every((d) => d !== "") && !isSubmitting) {
      setIsSubmitting(true);
      // Auto-submit when all fields are filled
      setTimeout(() => {
        router.push("/");
      }, 500);
    }
  }, [otp]);

  const handleOnChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOTP = [...otp];
      newOTP[index] = text.substring(text.length - 1);
      setOtp(newOTP);

      // Move to next input if there's text, or previous if backspace
      if (text) {
        if (index < otp.length - 1) {
          setActiveOTPIndex(index + 1);
        }
      } else {
        if (index > 0) {
          setActiveOTPIndex(index - 1);
        }
      }
    }
  };

  const handleOnKeyDown = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      setActiveOTPIndex(index - 1);
    }
  };

  const handleInputFocus = (index: number) => {
    setActiveOTPIndex(index);
  };
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.image}
      />
      <View style={{ marginTop: 42, gap: 6 }}>
        <CustomText extrabold={true} variant="h2">
          Check Your Email
        </CustomText>
        <CustomText medium={true} variant="h5" style={{ maxWidth: 300 }}>
          We Sent an 4 Digit Code To
        </CustomText>
      </View>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={[
              styles.otpInput,
              activeOTPIndex === index && styles.otpInputFocused,
            ]}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            onChangeText={(text) => handleOnChange(text, index)}
            onKeyPress={(e) => handleOnKeyDown(e, index)}
            onFocus={() => handleInputFocus(index)}
            maxLength={1}
            keyboardType="number-pad"
            selectTextOnFocus
            autoFocus={index === 0}
          />
        ))}
      </View>
      <View style={{ marginTop: 12, gap: 6 }}>
        <View style={{ marginTop: 12 }}>
          <Button onPress={() => router.push("/forgetpassword/newpassword")}>
            Send
          </Button>
        </View>
      </View>
    </View>
  );
};

export default Mail;

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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
    gap: 10,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    color: Colors.light.baseblack,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  otpInputFocused: {
    borderColor: Colors.light.border,
    borderWidth: 2,
  },
});
