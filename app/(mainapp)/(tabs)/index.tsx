import React, { useRef, useState, useEffect, useCallback, JSX } from "react";
import { CameraView, Camera, CameraType } from "expo-camera";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import CustomText from "@/shared/text/CustomText";
import Topbar from "@/shared/Topbar/topbar";
import Colors from "@/constants/Colors";
import { useScanVerify } from "@/api/services/hooks/useScan";
import { useToast } from "@/shared/toast/ToastContext";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Inputfield } from "@/shared/inputfield";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Button from "@/shared/button";
import { syncService } from "@/api/services/hooks/SyncService";
import { offlineScanService } from "@/api/services/hooks/OfflineScanService";
import { networkService } from "@/api/services/network/NetworkService";
import { databaseService } from "@/api/services/database/database";
import { EventDropdown } from "../component/event/EventDropdown";

export default function TabOneScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [scanResult, setScanResult] = useState<{
    isValid: boolean;
    message: string;
    display?: React.ReactNode;
    toastType: "success" | "error" | "info";
    icon: JSX.Element;
    data?: any;
  } | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [showPermissionUI, setShowPermissionUI] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { showToast } = useToast();
  const scanVerifyMutation = useScanVerify();

  // Handle sync function
  const handleSync = useCallback(async () => {

    if (!selectedEvent) {
      showToast("Please select an event first", "error");
      return;
    }

    setIsSyncing(true);
    try {
      showToast("Syncing data...", "info");
      const result = await syncService.syncAll(selectedEvent.id);

      if (result.validationData) {
        showToast("Event data synced successfully", "success");
      } else {
        showToast("Failed to sync event data", "error");
      }

      if (result.pendingScans.syncedCount > 0) {
        showToast(`Synced ${result.pendingScans.syncedCount} scans`, "success");
        setPendingSyncCount(0);
      } else if (result.pendingScans.failedCount > 0) {
        showToast(
          `Failed to sync ${result.pendingScans.failedCount} scans`,
          "error",
        );
      } else if (
        result.pendingScans.syncedCount === 0 &&
        result.pendingScans.failedCount === 0
      ) {
        showToast("No pending scans to sync", "info");
      }

      // Refresh sync status
      const status = await offlineScanService.getSyncStatus();
      setPendingSyncCount(status.pendingCount);
    } catch (error) {
      console.error("Sync error:", error);
      showToast("Failed to sync data", "error");
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, selectedEvent, showToast]);

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      const online = await networkService.checkConnectivity();
      setIsOnline(online);
    };

    checkNetwork();

    // Subscribe to network changes
    const unsubscribe = networkService.on(
      "connectivityChange",
      (online: boolean) => {
        setIsOnline(online);
        if (online && selectedEvent) {
          // Auto-sync when coming online
          handleSync();
        }
      },
    );

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedEvent, handleSync]);

  // Update pending sync count
  useEffect(() => {
    const updatePendingCount = async () => {
      const status = await offlineScanService.getSyncStatus();
      setPendingSyncCount(status.pendingCount);
    };

    updatePendingCount();

    // Refresh count periodically
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      queryClient.resetQueries({
        queryKey: ["events"],
      });
    }, [queryClient]),
  );

  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const subscriptions = [
      Keyboard.addListener("keyboardWillShow", keyboardWillShow),
      Keyboard.addListener("keyboardWillHide", keyboardWillHide),
      Keyboard.addListener("keyboardDidShow", keyboardWillShow),
      Keyboard.addListener("keyboardDidHide", keyboardWillHide),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  useEffect(() => {
    return () => {
      setIsScanning(false);
      setIsCameraReady(false);
    };
  }, []);

  useEffect(() => {
    setHasCameraPermission(null);
  }, []);

  const handleSelectEvent = async (event: any) => {
    setSelectedEvent(event);
    setScanResult(null);
    setScannedData("");
    setLastScannedCode("");

    // Download event validation data for offline use
    if (isOnline) {
      showToast("Downloading event data for offline use...", "info");
      const success = await syncService.downloadEventValidationData(event.id);
      if (success) {
        showToast("Event data downloaded successfully", "success");
      } else {
        showToast("Failed to download event data", "error");
      }
    } else {
      // Check if we have offline data for this event
      const offlineData = await databaseService.getEventValidationData(
        event.id,
      );
      if (offlineData) {
        showToast("Using offline event data", "info");
      } else {
        showToast("No offline data available for this event", "error");
      }
    }
  };

  const getResultConfig = (
    outcome: string,
    resultData?: any,
    isOfflineMode: boolean = false,
  ) => {
    switch (outcome) {
      case "ok":
        return {
          isValid: true,
          message: isOfflineMode ? "Valid Ticket" : "Valid Ticket",
          display: (
            <View style={[styles.resultDisplay, { gap: 10 }]}>
              <View style={[styles.resultDetailRow]}>
                <Image
                  source={require("@/assets/icon/accept.png")}
                  style={styles.statIcon}
                />
                <CustomText
                  style={[styles.resultValue, styles.validText]}
                  bold={true}
                >
                  {isOfflineMode ? "Valid Ticket" : "Valid Ticket"}
                </CustomText>
              </View>
              <Image
                source={require("@/assets/icon/straight.png")}
                style={{ width: 300, alignSelf: "center" }}
              />
              <View>
                <CustomText
                  style={styles.resultTitle}
                  bold={true}
                  centered={true}
                >
                  {" "}
                  Type: {resultData?.ticket?.ticketName}(
                  {resultData?.ticket?.ticketColor})
                </CustomText>
              </View>
            </View>
          ),
          toastType: "success" as const,
          icon: (
            <Ionicons
              name="checkmark-circle"
              size={40}
              color={Colors.light.green}
            />
          ),
        };
      case "already_scanned":
        return {
          isValid: false,
          message: "Already Scanned",
          display: (
            <View style={[styles.resultDisplay]}>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <View style={styles.infoBadge}>
                  <MaterialIcons
                    name="info"
                    size={20}
                    color={Colors.light.white}
                  />
                  <CustomText style={styles.infoBadgeText}>
                    This ticket was already scanned
                  </CustomText>
                </View>
              </View>
            </View>
          ),
          toastType: "info" as const,
          icon: (
            <MaterialIcons name="info" size={40} color={Colors.light.primary} />
          ),
        };
      case "invalid":
      default:
        return {
          isValid: false,
          message: "Invalid Ticket",
          display: (
            <View style={styles.resultDisplay}>
              <View style={[styles.resultDetailRow]}>
                <Image
                  source={require("@/assets/icon/cancel.png")}
                  style={styles.statIcon}
                />
                <CustomText style={[styles.resultValue, styles.errorText]}>
                  Invalid Ticket
                </CustomText>
              </View>
            </View>
          ),
          toastType: "error" as const,
          icon: (
            <MaterialIcons
              name="error"
              size={40}
              color={Colors.light.primary}
            />
          ),
        };
    }
  };

  const verifyScannedCode = async (scannedData: string) => {
    if (!selectedEvent) {
      showToast("Please select an event first", "error");
      return;
    }

    if (scannedData === lastScannedCode && isVerifying) {
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

      const ticketCode = parsedData.ticketCode || scannedData;

      let result;
      let isOfflineMode = false;

      // Check if online
      if (isOnline) {
        // Online mode - use normal endpoint
        try {
          const requestData = {
            eventId: selectedEvent.id,
            code: ticketCode,
            method: "qr" as const,
            timestamp: new Date().toISOString(),
            signature: parsedData.signature || "manual_scan_no_signature",
          };

          result = await scanVerifyMutation.mutateAsync(requestData);
        } catch (error: any) {
          
          const offlineResult = await offlineScanService.processOfflineScan(
            selectedEvent.id,
            ticketCode,
            "qr",
            "Gate A",
          );

          if (offlineResult.success) {
            result = {
              outcome: "ok",
              ticket: {
                ticketName:
                  offlineResult.data?.ticketInfo?.ticketName || "Unknown",
                ticketColor: "offline",
              },
            };
            isOfflineMode = true;

            // Update pending sync count after offline scan
            const status = await offlineScanService.getSyncStatus();
            setPendingSyncCount(status.pendingCount);
          } else {
            throw new Error(offlineResult.message);
          }
        }
      } else {
        // Offline mode - use local validation
        const offlineResult = await offlineScanService.processOfflineScan(
          selectedEvent.id,
          ticketCode,
          "qr",
          "Gate A",
        );

        if (offlineResult.success) {
          result = {
            outcome: "ok",
            ticket: {
              ticketName:
                offlineResult.data?.ticketInfo?.ticketName || "Unknown",
              ticketColor: "offline",
            },
          };
          isOfflineMode = true;

          // Update pending sync count after offline scan
          const status = await offlineScanService.getSyncStatus();
          setPendingSyncCount(status.pendingCount);
        } else {
          throw new Error(offlineResult.message);
        }
      }

      const resultConfig = getResultConfig(
        result.outcome,
        result,
        isOfflineMode,
      );

      setScanResult({
        isValid: resultConfig.isValid,
        message: resultConfig.message,
        display: resultConfig.display,
        toastType: resultConfig.toastType,
        icon: resultConfig.icon,
        data: result,
      });

      showToast(resultConfig.message, resultConfig.toastType);
    } catch (error: any) {
      console.error("Verification error:", error);

      const errorMessage = error.message || "Failed to verify ticket";

      const resultConfig = getResultConfig("invalid");

      setScanResult({
        isValid: false,
        message: errorMessage,
        display: resultConfig.display,
        toastType: resultConfig.toastType,
        icon: resultConfig.icon,
        data: null,
      });

      showToast(errorMessage, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const { status, canAskAgain } =
        await Camera.requestCameraPermissionsAsync();

      if (status === "granted") {
        setHasCameraPermission(true);
        setShowPermissionUI(false);
        setIsScanning(true);
        setIsCameraReady(false);
      } else {
        setHasCameraPermission(false);

        if (!canAskAgain) {
          Alert.alert(
            "Permission Required",
            "Camera permission has been permanently denied. Please enable it in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ],
          );
        } else {
          showToast("Camera permission denied", "error");
          setShowPermissionUI(true);
        }
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      showToast("Failed to request camera permission", "error");
      setShowPermissionUI(true);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const startScanning = async () => {
    if (!selectedEvent) {
      showToast("Please select an event first", "error");
      return;
    }

    if (hasCameraPermission === null) {
      await handleRequestPermission();
      return;
    }

    if (hasCameraPermission === false) {
      setShowPermissionUI(true);
      return;
    }

    if (hasCameraPermission === true) {
      setIsScanning(true);
      setIsCameraReady(false);
      setScannedData("");
      setScanResult(null);
      setLastScannedCode("");
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setIsCameraReady(false);
    setShowPermissionUI(false);
  };

  const isProcessingScanRef = useRef(false);

  const handleScanAlternative = useCallback(
    ({ data }: { data: string }) => {
      if (isProcessingScanRef.current || !isCameraReady) {
        return;
      }

      isProcessingScanRef.current = true;
      setScannedData(data);
      setIsScanning(false);
      setIsCameraReady(false);

      verifyScannedCode(data).finally(() => {
        isProcessingScanRef.current = false;
      });
    },
    [isCameraReady],
  );

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  const handleCameraMountError = useCallback((error: any) => {
    console.error("Camera mount error:", error);
    Alert.alert(
      "Camera Error",
      "Unable to start camera. Please try again or restart the app.",
      [{ text: "OK" }],
    );
    setIsScanning(false);
    setIsCameraReady(false);
    setShowPermissionUI(false);
  }, []);

  const handleManualVerification = async () => {
    if (!selectedEvent) {
      showToast("Please select an event first", "error");
      return;
    }

    if (!manualCode.trim()) {
      showToast("Please enter a ticket code", "error");
      return;
    }

    if (isVerifying) return;

    await verifyScannedCode(manualCode.trim());
    setManualCode("");
  };

  const handleInputFocus = () => {
    setTimeout(
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      },
      Platform.OS === "android" ? 300 : 100,
    );
  };

  // Determine which sync icon to show based on pending scans
  const getSyncIcon = () => {
    return pendingSyncCount > 0
      ? require("@/assets/icon/sync2.png")
      : require("@/assets/icon/sync.png");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Topbar>Ticket Scanning</Topbar>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          >
            <View style={{ paddingHorizontal: 16, flex: 1 }}>
              <View style={{ marginBottom: 20, width: "100%" }}>
                <CustomText style={styles.label}>Select Event</CustomText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <EventDropdown
                      selectedEvent={selectedEvent}
                      onSelectEvent={handleSelectEvent}
                      placeholder="Select an event"
                    />
                  </View>
                  <TouchableOpacity onPress={handleSync} disabled={isSyncing}>
                    <Image source={getSyncIcon()} style={styles.scannerImage} />
                    {pendingSyncCount > 0 && (
                      <View style={styles.badge}>
                        <CustomText style={styles.badgeText}>
                          {pendingSyncCount}
                        </CustomText>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Network Status Indicator */}
                <View style={styles.networkStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isOnline ? "#28A745" : "#E53935" },
                    ]}
                  />
                  <CustomText variant="caption" style={styles.statusText}>
                    {isOnline
                      ? "Online Mode"
                      : `Offline Mode${pendingSyncCount > 0 ? ` (${pendingSyncCount} pending syncs)` : ""}`}
                  </CustomText>
                  {isSyncing && (
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.primary}
                      style={styles.syncIndicator}
                    />
                  )}
                </View>
              </View>

              <View style={styles.scanContainer}>
                {showPermissionUI ? (
                  <View style={styles.permissionDeniedContainer}>
                    <MaterialIcons
                      name="no-photography"
                      size={100}
                      color={Colors.light.primary}
                    />
                    <CustomText style={styles.permissionDeniedTitle}>
                      Camera Access Required
                    </CustomText>
                    <CustomText style={styles.permissionDeniedText}>
                      Camera access is required to scan QR codes on event
                      tickets.
                      {isRequestingPermission
                        ? ""
                        : " Tap the button below to grant permission."}
                    </CustomText>

                    <TouchableOpacity
                      style={styles.permissionButton}
                      onPress={handleRequestPermission}
                      disabled={isRequestingPermission}
                    >
                      {isRequestingPermission ? (
                        <ActivityIndicator
                          color={Colors.light.white}
                          size="small"
                        />
                      ) : (
                        <CustomText style={styles.permissionButtonText}>
                          Grant Camera Permission
                        </CustomText>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : isScanning && hasCameraPermission === true ? (
                  <View style={styles.cameraWrapper}>
                    <View style={styles.cameraContainer}>
                      <CameraView
                        style={styles.camera}
                        ref={cameraRef}
                        onCameraReady={handleCameraReady}
                        onMountError={handleCameraMountError}
                        onBarcodeScanned={
                          scannedData || isVerifying || !isCameraReady
                            ? undefined
                            : handleScanAlternative
                        }
                        barcodeScannerSettings={{
                          barcodeTypes: ["qr"],
                        }}
                        facing={cameraType}
                        responsiveOrientationWhenOrientationLocked
                        ratio={Platform.OS === "ios" ? "16:9" : undefined}
                      />
                      <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.cornerTopLeft]} />
                        <View style={[styles.corner, styles.cornerTopRight]} />
                        <View
                          style={[styles.corner, styles.cornerBottomLeft]}
                        />
                        <View
                          style={[styles.corner, styles.cornerBottomRight]}
                        />
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
                      {scannedData
                        ? "Scan complete!"
                        : "Ready to scan QR codes"}
                    </CustomText>
                  </View>
                )}

                <View style={styles.manualEntryContainer}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputFieldContainer}>
                      <Inputfield
                        ref={inputRef}
                        placeholder="Enter ticket code e.g PB-358282"
                        value={manualCode}
                        onChangeText={setManualCode}
                        onFocus={handleInputFocus}
                        style={{ width: "90%" }}
                      />
                    </View>
                    <Button
                      buttonStyle={[
                        styles.manualVerifyButton,
                        (!manualCode.trim() || isVerifying) &&
                          styles.disabledButton,
                      ]}
                      onPress={() => handleManualVerification()}
                      disabled={!manualCode.trim() || isVerifying}
                    >
                      {isVerifying ? (
                        <ActivityIndicator
                          size="small"
                          color={Colors.light.white}
                        />
                      ) : (
                        <CustomText color={Colors.light.white} variant="h5">
                          Validate Code
                        </CustomText>
                      )}
                    </Button>
                  </View>
                </View>

                {!showPermissionUI && (
                  <>
                    {!isScanning ? (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={startScanning}
                        disabled={isVerifying}
                      >
                        <CustomText style={styles.actionButtonText}>
                          {scannedData ? "Scan Again" : "Start Scanning"}
                        </CustomText>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.stopButton]}
                        onPress={stopScanning}
                        disabled={isVerifying}
                      >
                        <CustomText style={styles.actionButtonText}>
                          {isVerifying ? "Verifying..." : "Stop Scanning"}
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {/* Scan Result Display */}
                {scanResult && (
                  <View style={styles.resultWrapper}>
                    <View style={styles.resultContainer}>
                      <View style={styles.resultDetails}>
                        {scanResult.display}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
    zIndex: 1,
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
  cameraLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  cameraLoadingText: {
    color: Colors.light.white,
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
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
    zIndex: 2,
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
  permissionDeniedContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: "100%",
    backgroundColor: Colors.light.grey100,
    borderRadius: 10,
    marginBottom: 25,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.light.grey,
  },
  permissionDeniedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  permissionDeniedText: {
    fontSize: 16,
    color: Colors.light.text2,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  permissionButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  resultWrapper: {
    width: "100%",
    marginTop: 20,
  },
  resultContainer: {
    backgroundColor: Colors.light.grey100,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resultDetails: {
    marginTop: 10,
  },
  resultDisplay: {
    width: "100%",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  resultDetailRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  validText: {
    color: Colors.light.green,
  },
  errorText: {
    color: Colors.light.primary,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoBadgeText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
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
  statIcon: {
    height: 23,
    width: 23,
    resizeMode: "contain",
    marginRight: 9,
  },
  manualEntryContainer: {
    width: "100%",
    marginBottom: 16,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  manualVerifyButton: {
    backgroundColor: Colors.light.primary,
    width: 120,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  inputFieldContainer: {
    flex: 1,
  },
  scannerImage: {
    height: hp("6%"),
    width: wp("15%"),
    resizeMode: "contain",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  networkStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.light.text2,
    fontSize: 12,
  },
  syncIndicator: {
    marginLeft: 8,
  },
});
