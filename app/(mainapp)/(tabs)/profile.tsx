import { tokenService } from "@/api/services/apiService";
import { databaseService } from "@/api/services/database/database";
import { useAuth } from "@/api/services/hooks/useAuth";
import { User } from "@/api/services/type";
import Colors from "@/constants/Colors";
import CustomText from "@/shared/text/CustomText";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";

const Profile = () => {
  const [isClearing, setIsClearing] = useState(false);
  const { getUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        } else {
          const directUser = await tokenService.getUser();

          if (directUser) {
            setUser(directUser);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  const clearAllLocalData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const success = await databaseService.clearAllData();

      if (success) {
        return true;
      } else {
        console.error("Failed to clear database data");
        return false;
      }
    } catch (error) {
      console.error("Error clearing local data:", error);
      return false;
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? This will clear all locally stored scan data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);

            try {
              const cleared = await clearAllLocalData();

              if (cleared) {
                await tokenService.clearTokens();
                router.replace("/login");
              } else {
                Alert.alert(
                  "Error",
                  "Failed to clear local data. Please try again.",
                  [{ text: "OK" }],
                );
                setIsClearing(false);
              }
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert(
                "Error",
                "An error occurred during logout. Please try again.",
                [{ text: "OK" }],
              );
              setIsClearing(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Header */}
        <CustomText bold>Profile</CustomText>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={require("@/assets/images/user.png")}
              style={styles.avatar}
            />
          </View>

          {/* User Info */}
          <CustomText bold>
            {user?.fullName || "User name not available"}
          </CustomText>
          <CustomText>{user?.email || "Email not available"}</CustomText>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
          disabled={isClearing}
        >
          {isClearing ? (
            <ActivityIndicator color="#7C3AED" size="small" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="logout"
                size={24}
                color={Colors.light.primary}
              />
              <CustomText color={Colors.light.primary} bold>
                {" "}
                Logout
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const PURPLE = "#7C3AED";
const RED = "#EF4444";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    alignItems: "center",
    marginTop: 16,
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    borderColor: "#E5E7EB",
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 100,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "400",
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    color: "#7C3AED",
    fontWeight: "500",
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
});
