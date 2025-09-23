import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { View } from "@/components/Themed";
import Topbar from "@/shared/Topbar/topbar";
import { useState } from "react";
import CustomText from "@/shared/text/CustomText";
import Colors from "@/constants/Colors";
import EventDetails from "../component/event/EventDetails";

export default function EventTab() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "UPCOMING" | "PAST">(
    "ACTIVE"
  );

  const handleTabChange = (tab: "ACTIVE" | "UPCOMING" | "PAST") => {
    setActiveTab(tab);
  };
  return (
    <View style={styles.container}>
      <Topbar>Event List</Topbar>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ACTIVE" && styles.activeTab]}
            onPress={() => handleTabChange("ACTIVE")}
          >
            <CustomText
              bold={true}
              style={[
                styles.tabText,
                activeTab === "ACTIVE" && styles.activeTabText,
              ]}
            >
              Active
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "UPCOMING" && styles.activeTab]}
            onPress={() => handleTabChange("UPCOMING")}
          >
            <CustomText
              bold={true}
              style={[
                styles.tabText,
                activeTab === "UPCOMING" && styles.activeTabText,
              ]}
            >
              Upcoming
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "PAST" && styles.activeTab]}
            onPress={() => handleTabChange("PAST")}
          >
            <CustomText
              bold={true}
              style={[
                styles.tabText,
                activeTab === "PAST" && styles.activeTabText,
              ]}
            >
              Past
            </CustomText>
          </TouchableOpacity>
        </View>
        <EventDetails />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: Colors.light.grey,
    backgroundColor: Colors.light.white,
    // borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.light.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    // gap: 20,
    borderRadius: 5,
    marginTop: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.light.grey,
    borderBottomColor: Colors.light.grey,
    // backgroundColor: Colors.light.baseblack,
  },
});
