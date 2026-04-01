import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomText from "@/shared/text/CustomText";

const EmptyPendingEvent = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/EmptyPendingEvent.png")}
        style={styles.statIcon}
      />
      <CustomText bold variant="h4">
        No pending events
      </CustomText>
    </View>
  );
};

export default EmptyPendingEvent;

const styles = StyleSheet.create({
  statIcon: {
    height: hp(14),
    width: wp(40),
    resizeMode: "contain",
    marginRight: 9,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
});
