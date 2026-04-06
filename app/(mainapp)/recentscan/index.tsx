import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import Topbar from "@/shared/Topbar/topbar";
import CustomDropdown from "@/shared/dropdown/CustomDropdown";
import { useEvents } from "@/api/services/hooks/useEvents";
import { useScanHistory } from "@/api/services/hooks/useScanHistory";
import { formatDistanceToNow } from "date-fns";
import { ScanItemProps } from "@/api/services/type";
import CustomText from "@/shared/text/CustomText";

const ScanItem = ({
  code,
  outcome,
  scannedAt,
  ticketName,
  bannerImage,
}: ScanItemProps) => {
  const formattedDate = new Date(scannedAt).toLocaleString();

  const getStatusInfo = () => {
    switch (outcome) {
      case "ok":
        return { text: "Valid", color: "#28A745" };
      case "already_scanned":
        return { text: "Scanned Already", color: "#FF9800" };
      default:
        return { text: "Invalid", color: "#E53935" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.scanContainer}>
      <Image source={{ uri: bannerImage }} style={styles.image} />

      <View style={styles.content}>
        <CustomText bold numberOfLines={1}>
          {ticketName}
        </CustomText>

        <CustomText numberOfLines={1}>{code}</CustomText>
        <CustomText
          bold
          variant="caption"
          style={[{ color: statusInfo.color }]}
        >
          {statusInfo.text}
        </CustomText>

        <CustomText variant="h6">{formattedDate}</CustomText>
      </View>
    </View>
  );
};


const RecentScan = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  const {
    data: eventsData,
    fetchNextPage: fetchNextEvents,
    hasNextPage: hasNextEvents,
    isFetchingNextPage: isFetchingNextEvents,
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
    error: errorEvents,
    refetch: refetchEvents,
  } = useEvents();

  const {
    data: scanHistoryData,
    fetchNextPage: fetchNextScanHistory,
    hasNextPage: hasNextScanHistory,
    isFetchingNextPage: isFetchingNextScanHistory,
    isLoading: isLoadingScanHistory,
    isError: isErrorScanHistory,
    error: errorScanHistory,
    refetch: refetchScanHistory,
  } = useScanHistory(selectedEvent === "all" ? null : selectedEvent);

  // Transform events data into dropdown options
  const eventOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [
      { label: "All Events", value: "all" },
    ];

    if (eventsData?.pages) {
      eventsData.pages.forEach((page) => {
        page.items.forEach((event) => {
          options.push({
            label: event.name,
            value: event.id,
          });
        });
      });
    }

    return options;
  }, [eventsData]);

  // Flatten all scan history items from all pages
  const scanHistoryItems = useMemo(() => {
    if (!scanHistoryData?.pages) return [];
    return scanHistoryData.pages.flatMap((page) => page.items);
  }, [scanHistoryData]);

  const handleEventChange = (value: string) => {
    setSelectedEvent(value);

    // Log the selected event details
    if (value === "all") {
    } else {
      const selectedEventObj = eventsData?.pages
        ?.flatMap((page) => page.items)
        .find((event) => event.id === value);
    }
  };

  const handleRefresh = useCallback(() => {
    refetchScanHistory();
  }, [refetchScanHistory]);

  const handleLoadMore = () => {
    if (hasNextScanHistory && !isFetchingNextScanHistory) {
      fetchNextScanHistory();
    }
  };

  // Show loading state for events
  if (isLoadingEvents) {
    return (
      <View style={styles.container}>
        <Topbar showBack showProfileIcon={false}>
          Scan History
        </Topbar>
        <View style={styles.centerContainer}>
          <CustomText>Loading events...</CustomText>
        </View>
      </View>
    );
  }

  // Show error state for events
  if (isErrorEvents) {
    return (
      <View style={styles.container}>
        <Topbar showBack showProfileIcon={false}>
          Scan History
        </Topbar>
        <View style={styles.centerContainer}>
          <CustomText>Error loading events: {errorEvents?.message}</CustomText>
          <CustomText onPress={() => refetchEvents()} style={styles.retryText}>
            Tap to retry
          </CustomText>
        </View>
      </View>
    );
  }

  // Show error state for scan history
  if (isErrorScanHistory) {
    return (
      <View style={styles.container}>
        <Topbar showBack showProfileIcon={false}>
          Scan History
        </Topbar>
        <View style={{ padding: 20, flex: 1 }}>
          <CustomDropdown
            placeholder="Select Event"
            options={eventOptions}
            value={selectedEvent}
            onChange={handleEventChange}
          />
          <View style={styles.centerContainer}>
            <CustomText>
              Error loading scan history: {errorScanHistory?.message}
            </CustomText>
            <CustomText
              onPress={() => refetchScanHistory()}
              style={styles.retryText}
            >
              Tap to retry
            </CustomText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Topbar showBack showProfileIcon={false}>
        Scan History
      </Topbar>

      <View style={{ padding: 20, flex: 1 }}>
        <CustomDropdown
          placeholder="Select Event"
          options={eventOptions}
          value={selectedEvent}
          onChange={handleEventChange}
        />

        {isLoadingScanHistory ? (
          <View style={styles.centerContainer}>
            <CustomText>Loading scan history...</CustomText>
          </View>
        ) : scanHistoryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>
              No scan history found
            </CustomText>
          </View>
        ) : (
          <FlatList
            data={scanHistoryItems}
            keyExtractor={(item, index) => `${item.event.id}-${item.code}-${index}`}
            renderItem={({ item }) => (
              <ScanItem
                code={item.code}
                outcome={item.outcome}
                scannedAt={item.scannedAt}
                ticketName={item.ticket.ticketName}
                holder={item.ticket.holder}
                bannerImage={item.event.bannerImage}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ marginTop: 20, paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingScanHistory}
                onRefresh={handleRefresh}
                colors={["#007AFF"]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              hasNextScanHistory && isFetchingNextScanHistory ? (
                <View style={styles.loadMoreContainer}>
                  <CustomText style={styles.loadingMoreText}>
                    Loading more...
                  </CustomText>
                </View>
              ) : null
            }
          />
        )}

        {/* Show events pagination indicator */}
        {hasNextEvents && (
          <View style={styles.loadMoreContainer}>
            <CustomText
              onPress={() => fetchNextEvents()}
              style={styles.loadMoreText}
            >
              {isFetchingNextEvents
                ? "Loading more events..."
                : "Load more events"}
            </CustomText>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecentScan;

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scanContainer: {
    flexDirection: "row",
    marginBottom: 18,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },

  image: {
    width: 125,
    height: 85,
    borderRadius: 10,
    marginRight: 12,
    objectFit: "fill",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },

  holder: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
    marginBottom: 2,
  },

  code: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },

  status: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  gate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  retryText: {
    marginTop: 10,
    color: "#007AFF",
    textDecorationLine: "underline",
  },

  loadMoreContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  loadMoreText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },

  loadingMoreText: {
    color: "#888",
    fontSize: 14,
    fontStyle: "italic",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});
