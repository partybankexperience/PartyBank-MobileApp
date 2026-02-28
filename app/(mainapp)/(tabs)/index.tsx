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
} from "react-native";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import CustomText from "@/shared/text/CustomText";
import Topbar from "@/shared/Topbar/topbar";
import Colors from "@/constants/Colors";
import { useScanVerify } from "@/api/services/hooks/useScan";
import { useToast } from "@/shared/toast/ToastContext";
import { EventDropdown } from "../component/event/EventDropdown";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

export default function TabOneScreen() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  const { showToast } = useToast();
  const scanVerifyMutation = useScanVerify();

  useFocusEffect(
    React.useCallback(() => {
      queryClient.resetQueries({
        queryKey: ["events"],
      });
    }, [queryClient]),
  );

  useEffect(() => {
    return () => {
      setIsScanning(false);
      setIsCameraReady(false);
    };
  }, []);

  useEffect(() => {
    setHasCameraPermission(null);
  }, []);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setScanResult(null);
    setScannedData("");
    setLastScannedCode("");
  };

  const getResultConfig = (outcome: string, resultData?: any) => {
    switch (outcome) {
      case "ok":
        return {
          isValid: true,
          message: "Valid Ticket",
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
                  Valid Ticket
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
                  Type: {resultData?.ticket?.ticketName || "Unknown"}(
                  {resultData?.ticket?.ticketColor || "none"})
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

      const requestData = {
        eventId: selectedEvent.id,
        code: parsedData.ticketCode || scannedData,
        method: "qr" as const,
        timestamp: new Date().toISOString(),
        signature: parsedData.signature || "manual_scan_no_signature",
      };

      const result = await scanVerifyMutation.mutateAsync(requestData);
      const resultConfig = getResultConfig(result.outcome, result);

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

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify ticket";

      const resultConfig = getResultConfig("invalid");

      setScanResult({
        isValid: false,
        message: resultConfig.message,
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
        // Start scanning after permission is granted
        setIsScanning(true);
        setIsCameraReady(false);
      } else {
        setHasCameraPermission(false);

        if (!canAskAgain) {
          // Guide user to app settings
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
    // Check if event is selected before proceeding
    if (!selectedEvent) {
      showToast("Please select an event first", "error");
      return;
    }

    // Request camera permission ONLY when user taps the button
    if (hasCameraPermission === null) {
      await handleRequestPermission();
      return;
    }

    if (hasCameraPermission === false) {
      setShowPermissionUI(true);
      return;
    }

    // If we have permission, start scanning
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

  // Handle camera ready event
  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  // Handle camera mount error
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

  // Handle iPad-specific camera issues
  const handleCameraError = useCallback(
    (error: any) => {
      console.error("Camera error:", error);

      if (Platform.OS === "ios") {
        Alert.alert(
          "Camera Unavailable",
          "The camera is currently unavailable. Please try again or check if another app is using the camera.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Try Again",
              onPress: () => {
                setIsScanning(false);
                setShowPermissionUI(false);
                setTimeout(() => {
                  if (hasCameraPermission) {
                    setIsScanning(true);
                  }
                }, 500);
              },
            },
          ],
        );
      }

      setIsScanning(false);
      setIsCameraReady(false);
      setShowPermissionUI(false);
    },
    [hasCameraPermission],
  );

  // Show initial UI (no permission check on load)
  return (
    <View style={styles.container}>
      <Topbar>Ticket Scanning</Topbar>
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        <View style={{ marginBottom: 20, width: "100%" }}>
          <CustomText style={styles.label}>Select Event</CustomText>
          <EventDropdown
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEvent}
            placeholder="Select an event"
          />
        </View>

        <View style={styles.scanContainer}>
          {/* Camera Permission Denied UI - Shows only when needed */}
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
                Camera access is required to scan QR codes on event tickets.
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
                  <ActivityIndicator color={Colors.light.white} size="small" />
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
            </View>
          )}

          {/* Action Buttons */}
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
                <View style={styles.resultDetails}>{scanResult.display}</View>
              </View>
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
  // Result Display Styles
  resultWrapper: {
    width: "100%",
    marginTop: 20,
  },
  resultContainer: {
    backgroundColor: Colors.light.grey100,
    // borderRadius: 12,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    // marginBottom: 15,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  validMessage: {
    color: Colors.light.green,
  },
  errorMessage: {
    color: Colors.light.primary,
  },
  resultDetails: {
    marginTop: 10,
  },
  // Display Component Styles
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
  resultLabel: {
    fontSize: 14,
    color: Colors.light.text2,
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    // flex: 1,
    // textAlign: "right",
  },
  validText: {
    color: Colors.light.green,
    // fontWeight: "bold",
  },
  warningText: {
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  errorText: {
    color: Colors.light.primary,
    // fontWeight: "bold",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  successBadgeText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    // marginTop: 15,
    // alignSelf: "flex-start",
  },
  infoBadgeText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  errorTips: {
    marginTop: 15,
    paddingLeft: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.light.text2,
    marginLeft: 8,
    flex: 1,
  },
  detailsButton: {
    marginTop: 15,
    paddingVertical: 8,
    alignItems: "center",
  },
  detailsButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  permissionText: {
    fontSize: 16,
    color: Colors.light.baseblack,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
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
  statIcon: {
    height: 23,
    width: 23,
    resizeMode: "contain",
    marginRight: 9,
  },
});
