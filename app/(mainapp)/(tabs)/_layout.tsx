import EventIcon from "@/assets/svg/EventIcon";
import NotificationIcon from "@/assets/svg/NotiIcon";
import ScannerIcon from "@/assets/svg/ScannerIcon";
import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.light.primary,
          tabBarInactiveTintColor: "#959595",
          tabBarIconStyle: {
            marginTop: 4,
          },

          tabBarStyle: {
            height: 70,
            marginBottom: 0,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: Colors.light.baseblack,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: "RedHatDisplay-Bold",
            marginBottom: 4,
          },

          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Scan",
            tabBarIcon: ({ color }) => <ScannerIcon fill={color} />,
          }}
        />
        <Tabs.Screen
          name="event"
          options={{
            title: "Events List",
            tabBarIcon: ({ color }) => <EventIcon fill={color} />,
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            title: "Notification",

            tabBarIcon: ({ color }) => <NotificationIcon fill={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
