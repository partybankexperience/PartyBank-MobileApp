import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { View } from "@/components/Themed";
import Topbar from "@/shared/Topbar/topbar";
import { useState } from "react";
import CustomText from "@/shared/text/CustomText";
import Colors from "@/constants/Colors";
import EventDetails from "../component/event/EventDetails";
import { useEvents } from "@/api/services/hooks/useEvents";

export default function EventTab() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "UPCOMING" | "PAST">(
    "ACTIVE"
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useEvents();

  const handleTabChange = (tab: "ACTIVE" | "UPCOMING" | "PAST") => {
    setActiveTab(tab);
  };

  // Flatten all pages data into a single array
  const allEvents = data?.pages.flatMap((page) => page.items) || [];

  // Filter events based on active tab and timingStatus
  const filteredEvents = allEvents.filter((event) => {
    const status = event.timingStatus.toLowerCase();
    switch (activeTab) {
      case "ACTIVE":
        return status === "active";
      case "UPCOMING":
        return status === "upcoming";
      case "PAST":
        return status === "past";
      default:
        return true;
    }
  });

  // Handle error state
  if (isError) {
    Alert.alert("Error", error?.message || "Failed to load events");
  }

  return (
    <View style={styles.container}>
      <Topbar>Event List</Topbar>
      <FlatList
        ListHeaderComponent={
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "ACTIVE" && styles.activeTab]}
              onPress={() => handleTabChange("ACTIVE")}
            >
              <CustomText
                bold={true}
                style={[
                  styles.tabText,
                  activeTab === "ACTIVE" && styles.activeTabText,
                ]}
              >
                Active
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "UPCOMING" && styles.activeTab]}
              onPress={() => handleTabChange("UPCOMING")}
            >
              <CustomText
                bold={true}
                style={[
                  styles.tabText,
                  activeTab === "UPCOMING" && styles.activeTabText,
                ]}
              >
                Upcoming
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "PAST" && styles.activeTab]}
              onPress={() => handleTabChange("PAST")}
            >
              <CustomText
                bold={true}
                style={[
                  styles.tabText,
                  activeTab === "PAST" && styles.activeTabText,
                ]}
              >
                Past
              </CustomText>
            </TouchableOpacity>
          </View>
        }
        data={filteredEvents}
        keyExtractor={(event) => event.id.toString()}
        renderItem={({ item }) => <EventDetails event={item} />}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <>
            {/* Loading state */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <CustomText>Loading events...</CustomText>
              </View>
            )}

            {/* Error state with retry button */}
            {isError && (
              <View style={styles.errorContainer}>
                <CustomText>Failed to load events</CustomText>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => refetch()}
                >
                  <CustomText color={Colors.light.white}>Retry</CustomText>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <CustomText>Loading more events...</CustomText>
              </View>
            )}

            {/* Empty state */}
            {!isLoading && filteredEvents.length === 0 && (
              <View style={styles.emptyContainer}>
                <CustomText>No {activeTab.toLowerCase()} events found</CustomText>
              </View>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: Colors.light.grey,
    backgroundColor: Colors.light.white,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.light.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderRadius: 5,
    marginTop: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.light.grey,
    borderBottomColor: Colors.light.grey,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  loadingMoreContainer: {
    padding: 10,
    alignItems: "center",
    gap: 10,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
});
