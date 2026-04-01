import {
  Image,
  StyleSheet,
  View,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useMemo, useCallback } from "react";
import Colors from "@/constants/Colors";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomText from "@/shared/text/CustomText";
import { useScanHistory } from "@/api/services/hooks/useScanHistory";
import { formatDistanceToNow } from "date-fns";

interface ScanItemProps {
  code: string;
  outcome: string;
  scannedAt: string;
  ticketName: string;
  bannerImage: string;
}

const ScanItem = ({
  code,
  outcome,
  scannedAt,
  ticketName,
  bannerImage,
}: ScanItemProps) => {
  const isValid = outcome === "ok";
  const formattedTime = formatDistanceToNow(new Date(scannedAt), {
    addSuffix: true,
  });

  return (
    <View style={styles.scanContainer}>
      <Image source={{ uri: bannerImage }} style={styles.image} />

      <View style={styles.content}>
        <CustomText bold numberOfLines={1}>
          {ticketName}
        </CustomText>

        <CustomText numberOfLines={1} variant="caption">
          {code}
        </CustomText>

        <CustomText
          bold
          variant="caption"
          style={[{ color: isValid ? "#28A745" : "#E53935" }]}
        >
          {isValid ? "VALID" : "INVALID"}
        </CustomText>

        <CustomText variant="caption" style={styles.time}>
          {formattedTime}
        </CustomText>
      </View>
    </View>
  );
};

const RecentScanState = () => {
  const { data: scanHistoryData } = useScanHistory(null); // Pass null to get all events

  // Get only the first 3 items
  const scanHistoryItems = useMemo(() => {
    if (!scanHistoryData?.pages) return [];
    const allItems = scanHistoryData.pages.flatMap((page) => page.items);
    return allItems.slice(0, 3);
  }, [scanHistoryData]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {scanHistoryItems.map((item) => (
        <ScanItem
          key={`${item.code}-${item.scannedAt}`}
          code={item.code}
          outcome={item.outcome}
          scannedAt={item.scannedAt}
          ticketName={item.ticket.ticketName}
          bannerImage={item.event.bannerImage}
        />
      ))}
    </ScrollView>
  );
};

export default RecentScanState;

const styles = StyleSheet.create({
  scanContainer: {
    flexDirection: "row",
    padding: hp(1),
  },
  image: {
    width: wp(40),
    height: hp(10),
    borderRadius: 10,
    marginRight: wp(3),
    objectFit: "cover",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  time: {
    color: "#888",
    marginTop: 2,
  },
});
