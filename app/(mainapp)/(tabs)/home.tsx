import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";

const App = () => {
  const [pendingEvents, setPendingEvents] = useState([
    {
      id: "1",
      title: "Masquerade Ball",
      date: "September 20, 2024",
    },
  ]);

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Masquerade Ball Party & Get Together",
      date: "September 20, 2024",
      revenue: "$25",
      tickets: "50",
      buyers: "15",
    },
  ]);

  const handleAccept = (eventId : string) => {
    console.log("Accepted event:", eventId);
    // Handle accept logic
  };

  const handleReject = (eventId: string) => {
    console.log("Rejected event:", eventId);
    // Handle reject logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>Donald Jones</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/3144/3144456.png",
                }}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/1170/1170678.png",
                }}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tickets Pending Section */}
        <TouchableOpacity style={styles.pendingCard}>
          <View style={styles.pendingContent}>
            <Text style={styles.pendingText}>3 tickets pending sync</Text>
            <Text style={styles.offlineText}>You are currently offline</Text>
          </View>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/130/130576.png",
            }}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Total Scanned Section */}
        <View style={styles.scannedContainer}>
          <Text style={styles.scannedLabel}>Total Scanned Today</Text>
          <Text style={styles.scannedNumber}>0</Text>
          {/* <TouchableOpacity style={styles.scanButton}>
            <LinearGradient
              colors={["#6B48FF", "#9B6BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </LinearGradient>
          </TouchableOpacity> */}
        </View>

        {/* Events List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Events List</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{event.date}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Revenue</Text>
                <Text style={styles.statValue}>{event.revenue}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Number of Tickets</Text>
                <Text style={styles.statValue}>{event.tickets}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Number of Buyers</Text>
                <Text style={styles.statValue}>{event.buyers}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Pending Events Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Events</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {pendingEvents.map((event) => (
          <View key={event.id} style={styles.pendingEventCard}>
            <View style={styles.pendingEventInfo}>
              <Text style={styles.pendingEventTitle}>{event.title}</Text>
              <Text style={styles.pendingEventDate}>{event.date}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(event.id)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(event.id)}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#6B7280",
  },
  pendingCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingContent: {
    flex: 1,
  },
  pendingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  offlineText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  chevronIcon: {
    width: 20,
    height: 20,
    tintColor: "#9CA3AF",
  },
  scannedContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scannedLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  scannedNumber: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#6B48FF",
    marginVertical: 12,
  },
  scanButton: {
    width: "100%",
    marginTop: 8,
  },
  gradientButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  viewAllText: {
    fontSize: 14,
    color: "#6B48FF",
    fontWeight: "500",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  pendingEventCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pendingEventInfo: {
    flex: 1,
  },
  pendingEventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  pendingEventDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: "#6B48FF",
    borderColor: "#6B48FF",
  },
  rejectButton: {
    backgroundColor: "transparent",
    borderColor: "#EF4444",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 30,
  },
});

export default App;
