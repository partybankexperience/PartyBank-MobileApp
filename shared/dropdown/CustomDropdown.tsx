import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../text/CustomText";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select",
}: Props) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value || "");

  const handleSelect = (item: Option) => {
    setSelected(item.value);
    setOpen(false);
    onChange?.(item.value);
  };

  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || placeholder;

  return (
    <View style={styles.container}>
      {/* Trigger */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <CustomText medium variant="h5">{selectedLabel}</CustomText>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#555"
        />
      </TouchableOpacity>

      {/* Options */}
      {open && (
        <View style={styles.menu}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <CustomText style={styles.itemText}>{item.label}</CustomText>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#F9F9F9",
  },

  menu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#fff",
    maxHeight: 200,
  },
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemText: {
    fontSize: 14,
    color: "#333",
  },
});
