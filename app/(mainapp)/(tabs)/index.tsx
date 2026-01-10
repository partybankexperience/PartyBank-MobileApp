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
} from "react-native";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import CustomText from "@/shared/text/CustomText";
import Topbar from "@/shared/Topbar/topbar";
import Colors from "@/constants/Colors";
import { useScanVerify } from "@/api/services/hooks/useScan";
import { useToast } from "@/shared/toast/ToastContext";
import { EventDropdown } from "../component/event/EventDropdown";

export default function TabOneScreen() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    isValid: boolean;
    message: string;
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

  useEffect(() => {
    return () => {
      setIsScanning(false);
      setIsCameraReady(false);
    };
  }, []);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
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

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const { status, canAskAgain } =
        await Camera.requestCameraPermissionsAsync();

      if (status === "granted") {
        setHasCameraPermission(true);
        setShowPermissionUI(false);
        // showToast("Camera permission granted", "success");
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
            ]
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
    [isCameraReady]
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
      [{ text: "OK" }]
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
          ]
        );
      }

      setIsScanning(false);
      setIsCameraReady(false);
      setShowPermissionUI(false);
    },
    [hasCameraPermission]
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
                  onError={handleCameraError}
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
});
