import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import React, { useState } from "react";
import CustomText from "@/shared/text/CustomText";
import Colors from "@/constants/Colors";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";

const ScannedCard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const periods = ["Today", "This Week", "This Month"];

  const handleSelectPeriod = (period: string) => {
    setSelectedPeriod(period);
    setDropdownVisible(false);
  };

  return (
    <View>
      <ImageBackground
        source={require("@/assets/images/banner.png")}
        style={styles.background}
      >
        <View style={styles.bannerContent}>
          <View style={styles.headerRow}>
            <CustomText color={Colors.light.white} bold={true} variant="h3">
              Total Scanned
            </CustomText>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <CustomText
                color={Colors.light.white}
                variant="h5"
                medium
              >
                {selectedPeriod}
              </CustomText>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color={Colors.light.white}
              />
            </TouchableOpacity>
          </View>
          <CustomText color={Colors.light.white} bold={true} variant="h1">
            0
          </CustomText>
        </View>

        <View style={styles.spiralImageContainer}>
          <Image
            source={require("@/assets/images/spiral.png")}
            style={styles.spiralImage}
          />
        </View>
      </ImageBackground>

      {dropdownVisible && (
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownMenu}>
              {periods.map((period, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    selectedPeriod === period && styles.selectedDropdownItem,
                    index === periods.length - 1 && styles.lastDropdownItem,
                  ]}
                  onPress={() => handleSelectPeriod(period)}
                >
                  <CustomText
                    color={Colors.light.white}
                  >
                    {period}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default ScannedCard;

const styles = StyleSheet.create({
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
    gap: hp("2%"),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.8%"),
    borderRadius: 8,
    gap: wp("2%"),
  },

  modalOverlay: {
    position: "absolute",
    top: hp("10%"),
    right: wp("3%"),
    zIndex: 1000,
  },
  dropdownMenu: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    minWidth: wp("35%"),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  selectedDropdownItem: {
    backgroundColor: Colors.light.primary,
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
});
