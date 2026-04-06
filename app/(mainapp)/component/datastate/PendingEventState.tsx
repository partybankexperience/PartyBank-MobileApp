import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import React from "react";
import { usePendingEvents } from "@/api/services/hooks/usePendingEvent";
import PendingEventDetails from "../event/PendingEvent";

const PendingEventState = () => {
  const { data, isLoading, isError, refetch } = usePendingEvents();

  const allEvents = data?.pages.flatMap((page) => page.items) || [];
  const pendingEvents = allEvents.slice(0, 3);

  return (
    <FlatList
      data={pendingEvents}
      keyExtractor={(event) => event.id.toString()}
      renderItem={({ item }) => (
        <PendingEventDetails event={item} refetch={refetch} />
      )}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
};

export default PendingEventState;

const styles = StyleSheet.create({});
