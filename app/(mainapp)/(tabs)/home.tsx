import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import EmptyRecentScanState from "../component/emptystate/EmptyRecentScanState";
import Colors from "@/constants/Colors";
import CustomText from "@/shared/text/CustomText";
import EmptyPendingEvent from "../component/emptystate/EmptyPendingEvent";
import ScannedCard from "../component/home/card";
import { router } from "expo-router";

const App = () => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <CustomText variant="h5">Good morning,</CustomText>
            <CustomText bold variant="h3">
              Donald Jones
            </CustomText>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity >
              <Image
                source={require("@/assets/icon/noti.png")}
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Scanned Section */}
        <View>
          <ScannedCard />
        </View>

        {/* Events List Section */}
        <View style={styles.sectionHeader}>
          <CustomText bold>Recent Scans</CustomText>
          <TouchableOpacity onPress={()=> router.push('/recentscan') }>
            <CustomText color={Colors.light.primary} variant="h5">
              View All
            </CustomText>
          </TouchableOpacity>
        </View>
        <View style={styles.eventCard}>
          <EmptyRecentScanState />
        </View>

        {/* Pending Events Section */}
        <View style={styles.sectionHeader}>
          <CustomText bold>Pending Events</CustomText>
          <TouchableOpacity>
            <CustomText color={Colors.light.primary} variant="h5">
              View All
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.eventCard}>
          <EmptyPendingEvent />
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },

  image: {
    height: 40,
    width: 40,
    resizeMode: "contain",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 24,
    marginBottom: 12,
  },
  eventCard: {
    borderColor: Colors.light.grey,

    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },

  bottomPadding: {
    height: 30,
  },
});

export default App;
