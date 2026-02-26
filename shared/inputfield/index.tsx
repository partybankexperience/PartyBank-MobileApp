import React, { useState } from "react";
import {
  Image,
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../text/CustomText";
import Colors from "@/constants/Colors";

interface InputfieldProps {
  placeholder?: string;
  type?: string;
  label?: string;
  className?: string;
  value?: string;
  onKeyDown?: (event: any) => void;
  onFocus?: (event: any) => void;
  autoFocus?: boolean;
  onChangeText?: (value: string) => void;
  readonly?: boolean;
  onPaste?: (e: any) => void;
  maxLength?: number;
  id?: string;
  disabled?: boolean;
  pattern?: string;

  // Individual icon props
  leftIcon?: boolean;
  leftIconSource?: any;
  onLeftIconPress?: () => void;
  rightIcon?: boolean;
  rightIconSource?: any;
  onRightIconPress?: () => void;

  // Backward compatibility with old single icon props
  icon?: boolean;
  iconSource?: any;
  iconPosition?: "left" | "right";
  onIconPress?: () => void;

  secureTextEntry?: boolean;
  onBlur?: (event: any) => void;
  style?: TextStyle | undefined;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: boolean;
}

const Inputfield = React.forwardRef<TextInput, InputfieldProps>(
  (
    {
      placeholder,
      label,
      value,
      onFocus,
      autoFocus,
      onChangeText,
      readonly,
      maxLength,
      disabled,

      // New dual icon props
      leftIcon,
      leftIconSource,
      onLeftIconPress,
      rightIcon,
      rightIconSource,
      onRightIconPress,

      // Backward compatibility with old props
      icon,
      iconSource,
      iconPosition = "right",
      onIconPress,

      secureTextEntry,
      onBlur,
      style,
      multiline,
      keyboardType,
      error,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // For backward compatibility, map old props to new ones
    const effectiveLeftIcon = leftIcon || (icon && iconPosition === "left");
    const effectiveLeftIconSource =
      leftIconSource || (iconPosition === "left" ? iconSource : null);
    const effectiveLeftOnIconPress =
      onLeftIconPress || (iconPosition === "left" ? onIconPress : undefined);

    const effectiveRightIcon = rightIcon || (icon && iconPosition === "right");
    const effectiveRightIconSource =
      rightIconSource || (iconPosition === "right" ? iconSource : null);
    const effectiveRightOnIconPress =
      onRightIconPress || (iconPosition === "right" ? onIconPress : undefined);

    const handleFocus = (event: any) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: any) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    // Function to render an icon
    const renderIcon = (
      iconSource: any,
      position: "left" | "right",
      onPress?: () => void
    ) => {
      if (!iconSource) return null;

      // Check if iconSource is a React element
      if (React.isValidElement(iconSource)) {
        const iconElement = (
          <View
            style={[
              styles.iconContainer,
              position === "left"
                ? styles.leftIconContainer
                : styles.rightIconContainer,
            ]}
          >
            {iconSource}
          </View>
        );

        if (onPress) {
          return (
            <TouchableOpacity
              onPress={onPress}
              style={[
                styles.iconContainer,
                position === "left"
                  ? styles.leftIconContainer
                  : styles.rightIconContainer,
              ]}
            >
              {iconSource}
            </TouchableOpacity>
          );
        }

        return iconElement;
      }

      // Otherwise, treat it as an image source
      const iconElement = (
        <View
          style={[
            styles.iconContainer,
            position === "left"
              ? styles.leftIconContainer
              : styles.rightIconContainer,
          ]}
        >
          <Image source={iconSource} style={styles.icon} />
        </View>
      );

      if (onPress) {
        return (
          <TouchableOpacity
            onPress={onPress}
            style={[
              styles.iconContainer,
              position === "left"
                ? styles.leftIconContainer
                : styles.rightIconContainer,
            ]}
          >
            <Image source={iconSource} style={styles.icon} />
          </TouchableOpacity>
        );
      }

      return iconElement;
    };

    return (
      <View>
        {label && (
          <View style={styles.labelContainer}>
            <CustomText bold={true} style={styles.label}>
              {label}
            </CustomText>
          </View>
        )}
        <View style={styles.inputWrapper}>
          {effectiveLeftIcon &&
            effectiveLeftIconSource &&
            renderIcon(
              effectiveLeftIconSource,
              "left",
              effectiveLeftOnIconPress
            )}

          <TextInput
            style={[
              styles.input,
              effectiveLeftIcon &&
                effectiveLeftIconSource &&
                styles.inputWithLeftIcon,
              effectiveRightIcon &&
                effectiveRightIconSource &&
                styles.inputWithRightIcon,
              effectiveLeftIcon &&
                effectiveLeftIconSource &&
                effectiveRightIcon &&
                effectiveRightIconSource &&
                styles.inputWithBothIcons,
              isFocused && styles.inputFocused,
              error && styles.inputError,
              style,
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.text2}
            value={value}
            ref={ref}
            editable={!readonly && !disabled}
            onFocus={handleFocus}
            autoFocus={autoFocus}
            onChangeText={onChangeText}
            autoCapitalize="none"
            maxLength={maxLength}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            multiline={multiline}
            onBlur={handleBlur}
            {...rest}
          />

          {effectiveRightIcon &&
            effectiveRightIconSource &&
            renderIcon(
              effectiveRightIconSource,
              "right",
              effectiveRightOnIconPress
            )}
        </View>
      </View>
    );
  }
);

Inputfield.displayName = "Inputfield";

export { Inputfield };

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: Colors.light.text2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  leftIconContainer: {
    left: 12,
  },
  rightIconContainer: {
    right: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: "RedHatDisplay-Medium",
    color: Colors.light.baseblack,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputWithLeftIcon: {
    paddingLeft: 44,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  inputWithBothIcons: {
    paddingLeft: 44,
    paddingRight: 44,
  },
  inputFocused: {
    borderColor: Colors.light.baseblack,
  },
  inputError: {
    borderColor: Colors.light.primary,
  },
});
