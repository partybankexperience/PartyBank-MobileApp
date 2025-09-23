import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import Topbar from "@/shared/Topbar/topbar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomText from "@/shared/text/CustomText";
import Colors from "@/constants/Colors";

type TicketTypeCardProps = {
  title: string;
  scanned: number;
  total: number;
};

const TicketScanner = () => {
  return (
    <View style={styles.container}>
      <Topbar>Ticket Scanning</Topbar>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <ImageBackground
          source={require("@/assets/images/banner.png")}
          style={styles.background}
        >
          <View style={styles.bannerContent}>
            <CustomText color={Colors.light.white} bold={true} variant="h3">
              Scanned Tickets
            </CustomText>
            <CustomText color={Colors.light.white} bold={true} variant="h1">
              50/
              <CustomText
                color={Colors.light.white}
                extrabold={true}
                variant="h1"
              >
                100
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
          <TicketTypeCard title="Early Birds" scanned={50} total={100} />
          <TicketTypeCard title="Standard" scanned={50} total={100} />
          <TicketTypeCard title="Lounge Access" scanned={50} total={100} />
          <TicketTypeCard title="Event Day" scanned={50} total={100} />
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
});
