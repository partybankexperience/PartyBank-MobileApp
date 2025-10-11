import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { View } from "@/components/Themed";
import Topbar from "@/shared/Topbar/topbar";
import { useEffect, useRef } from "react";
import CustomText from "@/shared/text/CustomText";
import Colors from "@/constants/Colors";

import { useToast } from "@/shared/toast/ToastContext";
import { usePendingEvents } from "@/api/services/hooks/usePendingEvent";
import PendingEventDetails from "../component/event/PendingEvent";

export default function Profile() {
  const { showToast } = useToast();
  const errorToastShownRef = useRef(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = usePendingEvents();

  useEffect(() => {
    if (isError && !errorToastShownRef.current) {
      showToast(`No events found`, "warning");
      errorToastShownRef.current = true;
    }

    // Reset the ref when we're no longer in error state
    if (!isError) {
      errorToastShownRef.current = false;
    }
  }, [isError]);

  // Flatten all pages data into a single array
  const allEvents = data?.pages.flatMap((page) => page.items) || [];

  return (
    <View style={styles.container}>
      <Topbar>Pending Event List</Topbar>
      <FlatList
        data={allEvents}
        keyExtractor={(event) => event.id.toString()}
        renderItem={({ item }) => (
          <PendingEventDetails event={item} refetch={refetch} />
        )}
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
                <CustomText>Loading Pending events...</CustomText>
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
            {!isLoading && allEvents.length === 0 && (
              <View style={styles.emptyContainer}>
                <CustomText>No pending events found</CustomText>
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
