import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

export interface CustomTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "caption";
  bold?: boolean;
  extrabold?: boolean;
  medium?: boolean;
  color?: string;
  centered?: boolean;
  left?: boolean;
  right?: boolean;
  numberOfLines?: number;
}

const CustomText: React.FC<CustomTextProps> = ({
  variant = "body",
  bold = false,
  extrabold = false,
  medium = false,
  color = "#000",
  centered = false,
  left = false,
  right = false,
  style,
  numberOfLines,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        extrabold
          ? styles.extrabold
          : bold
          ? styles.bold
          : medium
          ? styles.medium
          : styles.regular,
        { color },
        centered && styles.centered,
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode="tail"
      allowFontScaling={false}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: "RedHatDisplay-Regular",
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    lineHeight: 22,
  },
  h5: {
    fontSize: 14,
    lineHeight: 20,
  },
  h6: {
    fontSize: 12,
    lineHeight: 18,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  regular: {
    fontFamily: "RedHatDisplay-Regular",
  },
  bold: {
    fontFamily: "RedHatDisplay-Bold",
  },
  extrabold: {
    fontFamily: "RedHatDisplay-ExtraBold",
  },
  medium: {
    fontFamily: "RedHatDisplay-Medium",
  },
  centered: {
    textAlign: "center",
  },
});

export default CustomText;
