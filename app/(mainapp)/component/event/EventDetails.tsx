import { Image, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import CustomText from "@/shared/text/CustomText";
import { router } from "expo-router";
import { Event } from "@/api/services/type";

interface EventDetailsProps {
  event: Event;
}

const EventDetails = ({ event }: EventDetailsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePress = () => {
    router.push({
      pathname: "/ticket",
      params: { eventId: event.id },
    });
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.card}>
        <View style={styles.eventHeader}>
          <View>
            <Image
              source={
                event.bannerImage
                  ? { uri: event.bannerImage }
                  : require("@/assets/images/temp.png")
              }
              style={styles.eventImage}
            />
          </View>
          <View style={styles.eventInfo}>
            <CustomText bold={true} variant="h4">
              {event.name}
            </CustomText>
            <CustomText variant="h6" color={Colors.light.text2}>
              {formatDate(event.startDate)}
            </CustomText>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Image
              source={require("@/assets/images/revenue.png")}
              style={styles.statIcon}
            />
            <CustomText bold={true} variant="h6">
              Number of Tickets
            </CustomText>
            <CustomText variant="h5">{event.totalTicketsPurchased}</CustomText>
          </View>
          <View style={styles.statItem}>
            <Image
              source={require("@/assets/images/revenue.png")}
              style={styles.statIcon}
            />
            <CustomText bold={true} variant="h6">
              Number of Buyers
            </CustomText>
            <CustomText variant="h5">{event.totalBuyers}</CustomText>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.light.grey100,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  eventHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  eventImage: {
    height: 57,
    width: 57,
    resizeMode: "cover",
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    height: 27,
    width: 27,
    resizeMode: "contain",
    marginBottom: 4,
  },
});
