import React, { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import CustomText from "../text/CustomText";
import Colors from "@/constants/Colors";

interface ButtonProps {
  onPress?: () => void;
  mode?: string;
  children: React.ReactNode;
  disabled?: boolean;
  buttonStyle?: object;
}

const Button: FC<ButtonProps> = ({
  onPress,
  mode = "pill",
  children,
  disabled,
  buttonStyle,
}) => {
  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          buttonStyle,
          mode === "pill" && styles.pill,
          mode === "flat" && styles.flat,
          mode === "normal" && styles.normal,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
        disabled={disabled}
      >
        <CustomText
          bold={true}
          style={[
            styles.buttonText,
            mode === "pill" && styles.pillText,
            mode === "flat" && styles.flatText,
            mode === "normal" && styles.normalText,
          ]}
        >
          {children}
        </CustomText>
      </Pressable>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.primary,
    width: "100%",
    height: 52,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.light.background,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.65,
  },
  flat: {
    backgroundColor: Colors.light.primary,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  flatText: {
    color: Colors.light.baseblack,
  },
  disabled: {
    opacity: 0.5,
  },
  pill: {
    backgroundColor: Colors.light.primary,
    borderColor: "transparent",
  },
  pillText: {
    color: Colors.light.white,
  },
  normal: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  normalText: {
    color: Colors.light.primary,
  },
});
