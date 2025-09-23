import React, { useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StyleSheet, View, TouchableOpacity, FlatList } from "react-native";
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
    if (!permission?.granted) {
      await requestPermission();
    }
    setIsScanning(true);
    setScannedData("");
  };

  return (
    <View style={styles.container}>
      <Topbar>Ticket Scanning</Topbar>
      <View style={{ paddingHorizontal: 16 }}>
        <CustomText style={styles.label}>Select Event</CustomText>

        {/* Selected Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.7}
        >
          <CustomText style={styles.selectedText}>{selectedEvent}</CustomText>
          <AntDesign name={isOpen ? "up" : "down"} size={20} color="#333" />
        </TouchableOpacity>

        <View style={styles.scanContainer}>
          {isScanning ? (
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

              {/* Dropdown List - Positioned absolutely to overlay camera */}
              {isOpen && (
                <View style={styles.dropdownListOverlay}>
                  <FlatList
                    data={events}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => handleSelect(item)}
                      >
                        <CustomText style={styles.optionText}>
                          {item}
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
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

          {!isScanning ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={startScanning}
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
    zIndex: 10, // Ensure dropdown button is above other elements
  },
  selectedText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownListOverlay: {
    position: "absolute",
    top: 0, // Position at the top of the camera container
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: Colors.light.grey100,
    maxHeight: 200,
    overflow: "hidden",
    zIndex: 20, // Higher z-index to ensure it overlays the camera
    elevation: 20, // For Android
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
    alignItems: "center",
    paddingBottom: 30,
    marginTop: 12,
  },
  cameraContainer: {
    width: "100%",
    height: 300,
    marginBottom: 25,
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
    // borderWidth: 2,
    // borderColor: Colors.light.primary,
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
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
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
