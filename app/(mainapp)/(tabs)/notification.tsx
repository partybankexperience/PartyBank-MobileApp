import { Pressable, ScrollView, StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import Topbar from "@/shared/Topbar/topbar";
import Colors from "@/constants/Colors";
import CustomText from "@/shared/text/CustomText";

type NotificationItemProps = {
  title: string;
  message: string;
  time: string;
};

export default function NotificationTab() {
  return (
    <View style={styles.container}>
      <Topbar>Notification</Topbar>
      <View style={styles.contentContainer}>
        <View style={styles.clearAllContainer}>
          <Pressable style={{ alignSelf: "flex-end" }}>
            <CustomText
              style={styles.clearAllText}
              bold={true}
              color={Colors.light.primary}
            >
              Clear All
            </CustomText>
          </Pressable>
        </View>
        <ScrollView style={styles.scrollView}>
          <NotificationItem
            title="Loream Ipsum"
            message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            time="2 hours ago"
          />
          <NotificationItem
            title="Loream Ipsum"
            message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            time="2 hours ago"
          />
          <NotificationItem
            title="Loream Ipsum"
            message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            time="2 hours ago"
          />
          <NotificationItem
            title="Loream Ipsum"
            message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            time="2 hours ago"
          />
          <NotificationItem
            title="Loream Ipsum"
            message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            time="2 hours ago"
          />
          <NotificationItem
            title="Loream Ipsum"
            message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            time="2 hours ago"
          />
          <NotificationItem
            title="Loream Ipsum"
            message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            time="2 hours ago"
          />
        </ScrollView>
      </View>
    </View>
  );
}

const NotificationItem = ({ title, message, time }: NotificationItemProps) => (
  <View style={styles.notificationItem}>
    <View style={styles.notificationContent}>
      <CustomText bold={true}>{title}</CustomText>
      <CustomText variant="h6">{message}</CustomText>
    </View>
    <View>
      <CustomText variant="h5" color={Colors.light.text2}>
        {time}
      </CustomText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
  clearAllContainer: {
    paddingVertical: 4,
  },
  clearAllText: {
    // textAlign: "right",
  },
  scrollView: {
    backgroundColor: Colors.light.grey100,
    height: "100%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 12,
  },
  notificationItem: {
    backgroundColor: Colors.light.white,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    borderRadius: 12,
  },
  notificationContent: {
    width: "70%", // Use percentage for better responsiveness
    gap: 6,
  },
});
