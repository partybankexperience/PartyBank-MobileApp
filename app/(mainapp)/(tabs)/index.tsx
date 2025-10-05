import React, { useRef, useState, useEffect, useCallback } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import CustomText from "@/shared/text/CustomText";
import Topbar from "@/shared/Topbar/topbar";
import Colors from "@/constants/Colors";
import { useEvents } from "@/api/services/hooks/useEvents";

const { height: screenHeight } = Dimensions.get("window");

export default function TabOneScreen() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef(null);
  const flatListRef = useRef<FlatList>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  // Check camera permission status
  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera permissions in your device settings to use the QR scanner.",
        [{ text: "OK" }]
      );
    }
  }, [permission]);

  // Set first event as selected when data loads
  useEffect(() => {
    if (allEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(allEvents[0].name);
    }
  }, [allEvents, selectedEvent]);

  const handleSelect = (eventName: string) => {
    setSelectedEvent(eventName);
    setIsOpen(false);
  };

  const handleScan = ({ data }: { data: string }) => {
    setScannedData(data);
    setIsScanning(false);
    alert(`QR Code Content: ${data}`);
  };

  const startScanning = async () => {
    if (permission?.granted) {
      setIsScanning(true);
      setScannedData("");
      return;
    }

    try {
      const permissionResponse = await requestPermission();
      if (permissionResponse.granted) {
        setIsScanning(true);
        setScannedData("");
      } else {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to scan QR codes.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      Alert.alert("Error", "Failed to access camera. Please try again.", [
        { text: "OK" },
      ]);
    }
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

  // Show loading while checking permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <Topbar>Ticket Scanning</Topbar>
        <View style={styles.centerContent}>
          <CustomText>Checking camera permissions...</CustomText>
        </View>
      </View>
    );
  }

  // Show permission denied message if we can't ask again
  if (!permission.granted && !permission.canAskAgain) {
    return (
      <View style={styles.container}>
        <Topbar>Ticket Scanning</Topbar>
        <View style={styles.centerContent}>
          <CustomText style={styles.permissionText}>
            Camera permission is required to scan QR codes. Please enable it in
            your device settings.
          </CustomText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Topbar>Ticket Scanning</Topbar>
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        <CustomText style={styles.label}>Select Event</CustomText>

        {/* Dropdown Container */}
        <View style={styles.dropdownContainer}>
          <>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
              disabled={isLoading || isError}
            >
              <CustomText style={styles.selectedText}>
                {selectedEvent ||
                  (isLoading ? "Loading events..." : "Select an event")}
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
                    <CustomText style={styles.modalTitle}>
                      Select Event
                    </CustomText>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <AntDesign name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={allEvents}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                          handleSelect(item.name);
                          setModalVisible(false);
                        }}
                      >
                        <CustomText style={styles.optionText}>
                          {item.name}
                        </CustomText>
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
                    style={styles.modalFlatList}
                    contentContainerStyle={styles.modalContentContainer}
                  />
                </View>
              </View>
            </Modal>
          </>
        </View>

        <View style={styles.scanContainer}>
          {isScanning && permission.granted ? (
            <View style={styles.cameraWrapper}>
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  ref={cameraRef}
                  onBarcodeScanned={scannedData ? undefined : handleScan}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                />
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.scanPlaceholder}>
              <FontAwesome
                name="camera"
                size={100}
                color={Colors.light.baseblack}
              />
              <CustomText style={styles.placeholderText}>
                {scannedData ? "Scan complete!" : "Ready to scan QR codes"}
              </CustomText>
              {!permission.granted && (
                <CustomText style={styles.permissionHint}>
                  Camera permission required
                </CustomText>
              )}
            </View>
          )}

          {!isScanning ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                (!permission.granted || !selectedEvent) &&
                  styles.disabledButton,
              ]}
              onPress={startScanning}
              disabled={
                (!permission.granted && !permission.canAskAgain) ||
                !selectedEvent
              }
            >
              <CustomText style={styles.actionButtonText}>
                {scannedData ? "Scan Again" : "Start Scanning"}
              </CustomText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={() => setIsScanning(false)}
            >
              <CustomText style={styles.actionButtonText}>
                Stop Scanning
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownContainer: {
    zIndex: 1000,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  scanContainer: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 30,
  },
  cameraWrapper: {
    width: "100%",
    height: 300,
    marginBottom: 25,
  },
  cameraContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  scanFrame: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: Colors.light.primary,
  },
  cornerTopLeft: {
    top: -19,
    left: -19,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    top: -19,
    right: -19,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    bottom: -19,
    left: -19,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    bottom: -19,
    right: -19,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  scanPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: "100%",
    backgroundColor: Colors.light.white,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: Colors.light.baseblack,
  },
  placeholderText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.light.baseblack,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: Colors.light.baseblack,
    textAlign: "center",
    lineHeight: 24,
  },
  permissionHint: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.light.baseblack,
    textAlign: "center",
    fontStyle: "italic",
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: Colors.light.grey,
    opacity: 0.6,
  },
  stopButton: {
    backgroundColor: Colors.light.baseblack,
  },
  actionButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.light.text2,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text2,
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.primary,
    textAlign: "center",
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
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: screenHeight * 0.5,
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.grey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  modalFlatList: {
    flex: 1,
  },
  modalContentContainer: {
    flexGrow: 1,
  },
});
