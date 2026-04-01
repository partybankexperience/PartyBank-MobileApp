import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import EmptyRecentScanState from "../component/emptystate/EmptyRecentScanState";
import Colors from "@/constants/Colors";
import CustomText from "@/shared/text/CustomText";
import EmptyPendingEvent from "../component/emptystate/EmptyPendingEvent";
import ScannedCard from "../component/home/card";
import { router } from "expo-router";
import RecentScanState from "../component/datastate/RecentScanState";
import { useScanHistory } from "@/api/services/hooks/useScanHistory";
import PendingEventState from "../component/datastate/PendingEventState";
import { usePendingEvents } from "@/api/services/hooks/usePendingEvent";
import { useAuth } from "@/api/services/hooks/useAuth";
import { User } from "@/api/services/type";
import { tokenService } from "@/api/services/apiService";

const App = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { getUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const getGreeting = useMemo(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good afternoon";
    } else if (currentHour >= 17 && currentHour < 21) {
      return "Good evening";
    } else {
      return "Good night";
    }
  }, []);

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

  const {
    data: scanHistoryData,
    isLoading: isLoadingScanHistory,
    refetch: refetchScanHistory,
  } = useScanHistory(null);

  const {
    data: pendingEventsData,
    isLoading: isLoadingPendingEvents,
    refetch: refetchPendingEvents,
  } = usePendingEvents();

  // Get all scan history items
  const scanHistoryItems =
    scanHistoryData?.pages?.flatMap((page) => page.items) || [];
  const hasScans = scanHistoryItems.length > 0;

  // Get pending events
  const allPendingEvents =
    pendingEventsData?.pages?.flatMap((page) => page.items) || [];
  const hasPendingEvents = allPendingEvents.length > 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchScanHistory(), refetchPendingEvents()]);
    setRefreshing(false);
  }, [refetchScanHistory, refetchPendingEvents]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <CustomText variant="h5" color={Colors.light.text2} bold>
              {getGreeting},
            </CustomText>
            <CustomText bold variant="h3">
              {user?.fullName || "User name not available"}
            </CustomText>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Image
                source={require("@/assets/icon/noti.png")}
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Scanned Section */}
        <View>
          <ScannedCard />
        </View>

        {/* Events List Section */}
        <View style={styles.sectionHeader}>
          <CustomText bold>Recent Scans</CustomText>
          <TouchableOpacity onPress={() => router.push("/recentscan")}>
            <CustomText color={Colors.light.primary} variant="h5">
              View All
            </CustomText>
          </TouchableOpacity>
        </View>
        <View style={styles.eventCard}>
          {isLoadingScanHistory && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : hasScans ? (
            <RecentScanState />
          ) : (
            <EmptyRecentScanState />
          )}
        </View>

        {/* Pending Events Section */}
        <View style={styles.sectionHeader}>
          <CustomText bold>Pending Events</CustomText>
          <TouchableOpacity onPress={()=> router.push('/profile')}>
            <CustomText color={Colors.light.primary} variant="h5">
              View All
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.eventCard}>
          {isLoadingPendingEvents && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : hasPendingEvents ? (
            <PendingEventState />
          ) : (
            <EmptyPendingEvent />
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  image: {
    height: 40,
    width: 40,
    resizeMode: "contain",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  eventCard: {
    borderColor: Colors.light.grey,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 150,
  },
  bottomPadding: {
    height: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default App;
