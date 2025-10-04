import React, { useRef, useState, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import CustomText from "@/shared/text/CustomText";
import Topbar from "@/shared/Topbar/topbar";
import Colors from "@/constants/Colors";

const events = [
  "Masquerade Ball",
  "House Party",
  "Nightlife",
  "Rhythms of Youth",
];

export default function TabOneScreen() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(
    "House Party"
  );
  const [isOpen, setIsOpen] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef(null);

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

  const handleSelect = (event: string) => {
    setSelectedEvent(event);
    setIsOpen(false);
  };

  const handleScan = ({ data }: { data: string }) => {
    setScannedData(data);
    setIsScanning(false);
    alert(`QR Code Content: ${data}`);
  };

  const startScanning = async () => {
    // Check if we already have permission
    if (permission?.granted) {
      setIsScanning(true);
      setScannedData("");
      return;
    }

    // Request permission if not granted
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
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsOpen(!isOpen)}
            activeOpacity={0.7}
          >
            <CustomText style={styles.selectedText}>{selectedEvent}</CustomText>
            <AntDesign name={isOpen ? "up" : "down"} size={20} color="#333" />
          </TouchableOpacity>

          {/* Dropdown List - Positioned absolutely so it doesn't affect layout */}
          {isOpen && (
            <View style={styles.dropdownList}>
              <FlatList
                data={events}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item)}
                  >
                    <CustomText style={styles.optionText}>{item}</CustomText>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
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
                !permission.granted && styles.disabledButton,
              ]}
              onPress={startScanning}
              disabled={!permission.granted && !permission.canAskAgain}
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
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: Colors.light.white,
    maxHeight: 200,
    overflow: "hidden",
    marginTop: 4,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1001,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.grey,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
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
});
