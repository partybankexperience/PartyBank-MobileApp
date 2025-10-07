import { Image, StyleSheet, TextInput, View, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import CustomText from "@/shared/text/CustomText";
import Button from "@/shared/button";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import { useVerifyOtp } from "@/api/services/hooks/useAuth";

const Mail = () => {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isOtpComplete, setIsOtpComplete] = useState(false);

  const { email } = useLocalSearchParams();
  const verifyOtpMutation = useVerifyOtp();

  useEffect(() => {
    // Focus the active input
    if (inputRefs.current[activeOTPIndex]) {
      inputRefs.current[activeOTPIndex]?.focus();
    }
  }, [activeOTPIndex]);

  useEffect(() => {
    // Check if OTP is complete (all 4 digits filled)
    const complete = otp.every((digit) => digit !== "");
    setIsOtpComplete(complete);
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

  const handleVerifyOtp = async () => {
    if (!isOtpComplete) {
      Alert.alert("Incomplete OTP", "Please enter all 4 digits of the OTP.");
      return;
    }

    const otpString = otp.join("");

    try {
      await verifyOtpMutation.mutateAsync({
        email: email as string,
        otp: otpString,
      });

      // Navigate to new password screen on success
      router.push({
        pathname: "/forgetpassword/newpassword",
        params: {
          email: email as string,
          otp: otpString,
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);
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
          Check Your Email
        </CustomText>
        <CustomText medium={true} variant="h5" style={{ maxWidth: 300 }}>
          We sent a 4-digit code to your mail
        </CustomText>
   
      </View>

      {/* OTP Input Section */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={[
              styles.otpInput,
              activeOTPIndex === index && styles.otpInputFocused,
              digit !== "" && styles.otpInputFilled,
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

      {/* Action Buttons */}
      <View style={{ marginTop: 12, gap: 16 }}>
        <Button
          onPress={handleVerifyOtp}
          loading={verifyOtpMutation.isPending}
          disabled={verifyOtpMutation.isPending || !isOtpComplete}
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
        </Button>
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
  emailText: {
    color: Colors.light.primary,
    marginTop: 4,
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
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  otpInputFilled: {
    borderColor: Colors.light.green,
    backgroundColor: Colors.light.grey100,
  },
  resendText: {
    textAlign: "center",
    color: Colors.light.text2,
    fontSize: 14,
  },
  resendLink: {
    color: Colors.light.primary,
    textDecorationLine: "underline",
  },
});
