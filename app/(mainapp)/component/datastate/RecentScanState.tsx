import { Image, StyleSheet, View, ScrollView } from "react-native";
import React, { useMemo, useCallback } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomText from "@/shared/text/CustomText";
import { useScanHistory } from "@/api/services/hooks/useScanHistory";
import { ScanItemProps } from "@/api/services/type";

const ScanItem = ({
  code,
  outcome,
  scannedAt,
  ticketName,
  bannerImage,
}: ScanItemProps) => {
  // Format the scannedAt date
  const formattedDate = new Date(scannedAt).toLocaleString();

  // Determine status text and color based on outcome
  const getStatusInfo = () => {
    switch (outcome) {
      case "ok":
        return { text: "Valid", color: "#28A745" };
      case "already_scanned":
        return { text: "Scanned Already", color: "#FF9800" };
      default:
        return { text: "Invalid", color: "#E53935" };
    }
  };

  const statusInfo = getStatusInfo();

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
          style={[{ color: statusInfo.color }]}
        >
          {statusInfo.text}
        </CustomText>

        <CustomText variant="caption" style={styles.time}>
          {formattedDate}
        </CustomText>
      </View>
    </View>
  );
};

const RecentScanState = () => {
  const { data: scanHistoryData } = useScanHistory(null);

  const scanHistoryItems = useMemo(() => {
    if (!scanHistoryData?.pages) return [];
    const allItems = scanHistoryData.pages.flatMap((page) => page.items);
    return allItems.slice(0, 3);
  }, [scanHistoryData]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {scanHistoryItems.map((item, index) => (
        <ScanItem
          key={`${item.event.id}-${item.code}-${index}`}
          code={item.code}
          outcome={item.outcome}
          scannedAt={item.scannedAt}
          ticketName={item.ticket.ticketName}
          bannerImage={item.event.bannerImage}
          holder={""}
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
