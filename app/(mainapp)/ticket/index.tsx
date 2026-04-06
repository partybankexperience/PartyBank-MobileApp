import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React from "react";
import Topbar from "@/shared/Topbar/topbar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomText from "@/shared/text/CustomText";
import Colors from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { useEventSummary } from "@/api/services/hooks/useEventSummary";
import { TicketTypeCardProps } from "@/api/services/type";

const TicketScanner = () => {
  const { eventId, eventName, eventBanner, eventStartDate } =
    useLocalSearchParams();
  const {
    data: eventSummary,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useEventSummary(eventId as string);

  const handleBack = () => {
    router.push("/event");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Topbar showBack showProfileIcon={false} onBackPress={handleBack}>
          Ticket Details
        </Topbar>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <CustomText style={styles.loadingText}>
            Loading event summary...
          </CustomText>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Topbar showBack showProfileIcon={false} onBackPress={handleBack}>
          Ticket Details
        </Topbar>

        <View style={styles.errorContainer}>
          <CustomText style={styles.errorText}>
            {error?.message || "Failed to load event summary"}
          </CustomText>
          <CustomText style={styles.retryText} onPress={() => refetch()}>
            Tap to retry
          </CustomText>
        </View>
      </View>
    );
  }

  const totals = eventSummary?.totals || { sold: 0, scanned: 0, unscanned: 0 };
  const ticketTypes = eventSummary?.byTicket || [];

  return (
    <View style={styles.container}>
      <Topbar showBack showProfileIcon={false} onBackPress={handleBack}>
        Ticket Details
      </Topbar>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.eventHeader}>
          <View>
            <Image
              source={{ uri: eventBanner as string }}
              style={styles.eventImage}
            />
          </View>
          <View style={styles.eventInfo}>
            <CustomText bold={true} variant="h3">
              {eventName as string}
            </CustomText>
            <CustomText variant="h6" color={Colors.light.text2}>
              {formatDate(eventStartDate as string)}
            </CustomText>
          </View>
        </View>

        {/* Banner Section */}
        <ImageBackground
          source={require("@/assets/images/banner.png")}
          style={styles.background}
        >
          <View style={styles.bannerContent}>
            <CustomText color={Colors.light.white} bold={true} variant="h3">
              Total Scanned Tickets
            </CustomText>
            <CustomText color={Colors.light.white} bold={true} variant="h1">
              {totals.scanned}/
              <CustomText
                color={Colors.light.white}
                extrabold={true}
                variant="h1"
              >
                {totals.sold}
              </CustomText>
            </CustomText>
          </View>
          <View style={styles.scannerImageContainer}>
            <Image
              source={require("@/assets/images/scanner.png")}
              style={styles.scannerImage}
            />
          </View>
          <View style={styles.spiralImageContainer}>
            <Image
              source={require("@/assets/images/spiral.png")}
              style={styles.spiralImage}
            />
          </View>
        </ImageBackground>

        <View style={styles.ticketTypesHeader}>
          <CustomText bold={true} variant="h3">
            Ticket Types
          </CustomText>
        </View>

        <View style={styles.ticketGrid}>
          {ticketTypes.map((ticket) => (
            <TicketTypeCard
              key={ticket.ticketId}
              title={ticket.ticketName}
              scanned={ticket.scanned}
              total={ticket.sold}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const TicketTypeCard: React.FC<TicketTypeCardProps> = ({
  title,
  scanned,
  total,
}) => (
  <View style={styles.ticketCard}>
    <CustomText bold={true} variant="h3">
      {title}
    </CustomText>
    <CustomText bold={true} variant="h2" color={Colors.light.primary}>
      {scanned}
      <CustomText extrabold={true} variant="h2">
        /{total}
      </CustomText>
    </CustomText>
    <View style={styles.ticketSpiralContainer}>
      <Image
        source={require("@/assets/images/spiral2.png")}
        style={styles.ticketSpiralImage}
      />
    </View>
  </View>
);

export default TicketScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    position: "relative",
    paddingHorizontal: wp("3%"),
  },
  background: {
    width: "100%",
    height: hp("20%"),
    resizeMode: "cover",
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: hp("4%"),
  },
  bannerContent: {
    marginHorizontal: wp("3%"),
    gap: hp("4%"),
  },
  scannerImageContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  scannerImage: {
    height: hp("14%"),
    width: wp("30%"),
    resizeMode: "contain",
  },
  spiralImageContainer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  spiralImage: {
    height: hp("18%"),
    width: wp("40%"),
  },
  ticketTypesHeader: {
    paddingVertical: hp("3%"),
  },
  ticketGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp("3%"),
    justifyContent: "space-between",
  },
  ticketCard: {
    backgroundColor: Colors.light.grey100,
    padding: wp("3%"),
    borderRadius: 12,
    gap: hp("3%"),
    width: wp("45%"),
    marginBottom: hp("2%"),
  },
  ticketSpiralContainer: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  ticketSpiralImage: {
    height: hp("6%"),
    width: wp("12%"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.text2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.primary,
    textAlign: "center",
  },
  retryText: {
    fontSize: 14,
    color: Colors.light.primary,
    textDecorationLine: "underline",
  },
  eventHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.grey,
    marginBottom: 16,
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
});
