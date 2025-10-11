import { Image, StyleSheet, View } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import CustomText from "@/shared/text/CustomText";
import { PendingEvent } from "@/api/services/type";
import Button from "@/shared/button";
import { useAcceptInvite } from "@/api/services/hooks/useAcceptInvites";

interface EventDetailsProps {
  event: PendingEvent;
  refetch: () => void;
}

const PendingEventDetails = ({ event, refetch }: EventDetailsProps) => {
  const acceptInviteMutation = useAcceptInvite();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAcceptInvite = async () => {
    try {
      await acceptInviteMutation.mutateAsync(event.id);
      refetch();
    } catch (error) {
      console.error("Accept invite error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.eventHeader}>
          <View>
            <Image
              source={
                event.eventImage
                  ? { uri: event.eventImage }
                  : require("@/assets/images/temp.png")
              }
              style={styles.eventImage}
            />
          </View>
          <View style={styles.eventInfo}>
            <CustomText bold={true} variant="h4">
              {event.scopePreview.eventName}
            </CustomText>
            <CustomText variant="h6" color={Colors.light.text2}>
              {formatDate(event.eventStartDate)}
            </CustomText>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={{ flex: 1 }}>
            <Button
              onPress={handleAcceptInvite}
              loading={acceptInviteMutation.isPending}
              disabled={acceptInviteMutation.isPending}
            >
              {acceptInviteMutation.isPending ? "Accepting..." : "Accept"}
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button mode="normal">Reject</Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PendingEventDetails;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginBottom: 26,
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
    marginTop: 12,
    gap: 22,
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
