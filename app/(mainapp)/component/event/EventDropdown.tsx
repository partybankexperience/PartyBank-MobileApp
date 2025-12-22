import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import CustomText from "@/shared/text/CustomText";
import Colors from "@/constants/Colors";
import { useEvents } from "@/api/services/hooks/useEvents";

const { height: screenHeight } = Dimensions.get("window");

interface Event {
  id: string;
  name: string;
}

interface EventDropdownProps {
  selectedEvent: Event | null;
  onSelectEvent: (event: Event) => void;
  placeholder?: string;
}

export const EventDropdown: React.FC<EventDropdownProps> = ({
  selectedEvent,
  onSelectEvent,
  placeholder = "Select an event",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  // Flatten all events from all pages
  const allEvents = data?.pages.flatMap((page) => page.items) || [];

  const handleSelect = (event: Event) => {
    onSelectEvent(event);
    setModalVisible(false);
  };

  const loadMoreEvents = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
        <CustomText style={styles.loadingText}>
          Loading more events...
        </CustomText>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <CustomText style={styles.emptyText}>Loading events...</CustomText>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.emptyState}>
          <CustomText style={styles.errorText}>
            {error?.message || "Failed to load events"}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <CustomText style={styles.retryButtonText}>Try Again</CustomText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <CustomText style={styles.emptyText}>No events available</CustomText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        disabled={isLoading || isError}
      >
        <CustomText style={styles.selectedText}>
          {selectedEvent?.name ||
            (isLoading ? "Loading events..." : placeholder)}
        </CustomText>
        <AntDesign name="down" size={20} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>Select Event</CustomText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={flatListRef}
              data={allEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSelect(item)}
                >
                  <CustomText style={styles.optionText}>{item.name}</CustomText>
                </TouchableOpacity>
              )}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderFooter}
              onEndReached={loadMoreEvents}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading && !isFetchingNextPage}
                  onRefresh={refetch}
                  colors={[Colors.light.primary]}
                />
              }
              onLayout={() => {
                if (allEvents.length > 0) {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }
              }}
              style={styles.modalFlatList}
              contentContainerStyle={styles.modalContentContainer}
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  container: {
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: Colors.light.grey100,
  },
  selectedText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContainer: {
    height: screenHeight * 0.5,
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden" as const,
    marginTop: Platform.OS === "ios" ? 40 : 20, // Adjust based on platform
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.grey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.grey,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600" as const,
  },
  modalFlatList: {
    flex: 1,
  },
  modalContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  footerLoader: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.light.text2,
  },
  emptyState: {
    padding: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: 120,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text2,
    textAlign: "center" as const,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.primary,
    textAlign: "center" as const,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
};
