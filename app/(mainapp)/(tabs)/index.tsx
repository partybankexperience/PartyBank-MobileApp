import React, { useRef, useState, useEffect, useCallback, JSX } from "react";
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
import {
  AntDesign,
  FontAwesome,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import CustomText from "@/shared/text/CustomText";
import Topbar from "@/shared/Topbar/topbar";
import Colors from "@/constants/Colors";
import { useEvents } from "@/api/services/hooks/useEvents";
import { useScanVerify } from "@/api/services/hooks/useScan";
import { useToast } from "@/shared/toast/ToastContext";

const { height: screenHeight } = Dimensions.get("window");

export default function TabOneScreen() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    isValid: boolean;
    message: string;
    icon: JSX.Element;
    data?: any;
  } | null>(null);
  const cameraRef = useRef(null);
  const flatListRef = useRef<FlatList>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");

  const { showToast } = useToast();
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

  const scanVerifyMutation = useScanVerify();

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
      setSelectedEvent(allEvents[0]);
    }
  }, [allEvents, selectedEvent]);

  const handleSelect = (event: any) => {
    setSelectedEvent(event);
    setModalVisible(false);
    setScanResult(null);
    setScannedData("");
    setLastScannedCode("");
  };

  const getResultConfig = (outcome: string) => {
    switch (outcome) {
      case "ok":
        return {
          isValid: true,
          message: "Valid Ticket",
          icon: (
            <Ionicons
              name="checkmark-circle"
              size={40}
              color={Colors.light.green}
            />
          ),
          toastType: "success" as const,
        };
      case "already_scanned":
        return {
          isValid: false,
          message: "Already Scanned",
          icon: (
            <MaterialIcons name="info" size={40} color={Colors.light.primary} />
          ),
          toastType: "info" as const,
        };
      case "invalid":
      default:
        return {
          isValid: false,
          message: "Invalid Ticket",
          icon: (
            <MaterialIcons
              name="error"
              size={40}
              color={Colors.light.primary}
            />
          ),
          toastType: "error" as const,
        };
    }
  };

  const verifyScannedCode = async (scannedData: string) => {
    if (!selectedEvent) {
      showToast("Please select an event first", "error");
      return;
    }

    if (scannedData === lastScannedCode && isVerifying) {
      // console.log("Duplicate scan detected, skipping...");
      return;
    }

    setIsVerifying(true);
    setScanResult(null);
    setLastScannedCode(scannedData);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(scannedData);
      } catch (error) {
        parsedData = {
          ticketCode: scannedData,
          signature: "manual_scan_no_signature",
        };
      }

      const requestData = {
        eventId: selectedEvent.id,
        code: parsedData.ticketCode || scannedData,
        method: "qr" as const,
        timestamp: new Date().toISOString(),
        signature: parsedData.signature || "manual_scan_no_signature",
      };

      // console.log("Sending verification request:", requestData);

      const result = await scanVerifyMutation.mutateAsync(requestData);
      // console.log("Verification result:", result);

      const resultConfig = getResultConfig(result.outcome);

      setScanResult({
        isValid: resultConfig.isValid,
        message: resultConfig.message,
        icon: resultConfig.icon,
        data: result,
      });

      showToast(resultConfig.message, resultConfig.toastType);
    } catch (error: any) {
      console.error("Verification error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify ticket";

      const resultConfig = getResultConfig("invalid");

      setScanResult({
        isValid: false,
        message: resultConfig.message,
        icon: resultConfig.icon,
        data: null,
      });

      showToast(errorMessage, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScan = ({ data }: { data: string }) => {
    if (isVerifying || data === lastScannedCode) {
      return;
    }

    setScannedData(data);
    setIsScanning(false);
    verifyScannedCode(data);
  };

  const startScanning = async () => {
    if (!selectedEvent) {
      showToast("Please select an event first", "error");
      return;
    }

    if (permission?.granted) {
      setIsScanning(true);
      setScannedData("");
      setScanResult(null);
      setLastScannedCode("");
      return;
    }

    try {
      const permissionResponse = await requestPermission();
      if (permissionResponse.granted) {
        setIsScanning(true);
        setScannedData("");
        setScanResult(null);
        setLastScannedCode("");
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

  const isProcessingScanRef = useRef(false);

  const handleScanAlternative = ({ data }: { data: string }) => {
    if (isProcessingScanRef.current) {
      // console.log("Scan already in progress, ignoring...");
      return;
    }

    isProcessingScanRef.current = true;
    setScannedData(data);
    setIsScanning(false);
    // console.log("Scanned QR Code Data:", data);
    verifyScannedCode(data).finally(() => {
      isProcessingScanRef.current = false;
    });
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
                {selectedEvent?.name ||
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
                        onPress={() => handleSelect(item)}
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
                  onBarcodeScanned={
                    scannedData || isVerifying
                      ? undefined
                      : handleScanAlternative
                  }
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

                {/* Verification Overlay */}
                {isVerifying && (
                  <View style={styles.verificationOverlay}>
                    <ActivityIndicator
                      size="large"
                      color={Colors.light.white}
                    />
                    <CustomText style={styles.verificationText}>
                      Verifying Ticket...
                    </CustomText>
                  </View>
                )}
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
              disabled={isVerifying}
            >
              <CustomText style={styles.actionButtonText}>
                {isVerifying ? "Verifying..." : "Stop Scanning"}
              </CustomText>
            </TouchableOpacity>
          )}

          {/* Scan Result Display */}
          {scanResult && (
            <View style={styles.resultContainer}>
              <View style={styles.resultIconContainer}>{scanResult.icon}</View>
              <CustomText style={styles.resultText}>
                {scanResult.message}
              </CustomText>
            </View>
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
  eventDate: {
    fontSize: 12,
    color: Colors.light.text2,
    marginTop: 4,
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
  verificationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationText: {
    color: Colors.light.white,
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
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
    padding: 20,
  },
  placeholderText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.light.baseblack,
    textAlign: "center",
  },
  resultContainer: {
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.light.grey100,
    borderWidth: 2,
    borderColor: Colors.light.grey,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resultIconContainer: {
    marginBottom: 12,
  },
  resultText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.light.text,
    marginBottom: 8,
  },
  resultDetails: {
    alignItems: "center",
    marginTop: 8,
  },
  resultDetailText: {
    fontSize: 14,
    color: Colors.light.text2,
    textAlign: "center",
    marginBottom: 4,
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
