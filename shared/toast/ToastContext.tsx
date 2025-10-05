import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Colors from "@/constants/Colors";
import CustomText from "../text/CustomText";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto hide after duration
    setTimeout(() => {
      hideToast(id);
    }, duration);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View style={styles.container}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

// Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onHide: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  React.useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate out before removing
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }, toast.duration);

    return () => clearTimeout(timer);
  }, []);

  const getToastStyle = () => {
    switch (toast.type) {
      case "success":
        return [styles.toast, styles.successToast];
      case "error":
        return [styles.toast, styles.errorToast];
      case "warning":
        return [styles.toast, styles.warningToast];
      case "info":
      default:
        return [styles.toast, styles.infoToast];
    }
  };

  const getIcon = () => {
    // You can replace these with your own icons or icon library
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <Animated.View
      style={[
        getToastStyle(),
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <View style={styles.icon}>
          {/* You can replace this with actual icons from your icon library */}
          <CustomText style={styles.iconText}>{getIcon()}</CustomText>
        </View>
      </View>
      <View style={styles.messageContainer}>
        <CustomText style={styles.messageText}>{toast.message}</CustomText>
      </View>
      <View style={styles.closeContainer}>
        <View style={styles.closeButton} onTouchEnd={onHide}>
          <CustomText style={styles.closeText}>×</CustomText>
        </View>
      </View>
    </Animated.View>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 60,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successToast: {
    backgroundColor: Colors.light.green,
    borderLeftWidth: 4,
    borderLeftColor: "#1E7E1E",
  },
  errorToast: {
    backgroundColor: Colors.light.primary,
    borderLeftWidth: 4,
    borderLeftColor: "#B3152D",
  },
  warningToast: {
    backgroundColor: "#FFA500",
    borderLeftWidth: 4,
    borderLeftColor: "#CC8400",
  },
  infoToast: {
    backgroundColor: Colors.light.tint,
    borderLeftWidth: 4,
    borderLeftColor: "#1E6CAD",
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  messageContainer: {
    flex: 1,
  },
  messageText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  closeContainer: {
    marginLeft: 12,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 18,
  },
});
