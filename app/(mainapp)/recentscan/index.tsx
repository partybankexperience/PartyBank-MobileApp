import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import Topbar from "@/shared/Topbar/topbar";
import CustomDropdown from "@/shared/dropdown/CustomDropdown";


type ScanItemProps = {
  title: string;
  status: "VALID" | "INVALID";
  time: string;
  image: any;
};

const ScanItem = ({ title, status, time, image }: ScanItemProps) => {
  const isValid = status === "VALID";

  return (
    <View style={styles.scanContainer}>
      <Image source={image} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <Text
          style={[styles.status, { color: isValid ? "#28A745" : "#E53935" }]}
        >
          {status}
        </Text>

        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
};

const DATA = [
  {
    id: "1",
    title: "Summer Party",
    status: "VALID",
    time: "2 Minutes ago (05/05/06 5:00pm)",
    image: require("@/assets/images/temp.png"),
  },
  {
    id: "2",
    title: "Masquerade Ball Party",
    status: "INVALID",
    time: "2 Minutes ago (05/05/06 5:00pm)",
    image: require("@/assets/images/temp.png"),
  },
  {
    id: "3",
    title: "Lagos Mainland Fest",
    status: "VALID",
    time: "2 Minutes ago (05/05/06 5:00pm)",
    image: require("@/assets/images/temp.png"),
  },
  {
    id: "4",
    title: "Lagos Mainland Fest",
    status: "VALID",
    time: "2 Minutes ago (05/05/06 5:00pm)",
    image: require("@/assets/images/temp.png"),
  },
];

/* =========================
   SCREEN
========================= */
const RecentScan = () => {
  return (
    <View style={styles.container}>
      <Topbar showBack showProfileIcon={false}>
        Scan History
      </Topbar>

      <View style={{ padding: 20 }}>
        <CustomDropdown
          placeholder="All"
          options={[
            { label: "All", value: "all" },
            { label: "Valid", value: "valid" },
            { label: "Invalid", value: "invalid" },
          ]}
          onChange={(val) => console.log(val)}
        />

        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ScanItem
              title={item.title}
              status={item.status as "VALID" | "INVALID"}
              time={item.time}
              image={item.image}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ marginTop: 20 }}
        />
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
  },

  image: {
    width: 55,
    height: 55,
    borderRadius: 10,
    marginRight: 12,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },

  status: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  time: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
