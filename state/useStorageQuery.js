import { useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { StorageService } from "./storageService";

export const useStorageQuery = (key, fetchFn, options = {}) => {
  const fetchStoredData = async () => {
    const storedData = await StorageService.getItem(key);
    if (storedData) return storedData;

    const fetchedData = await fetchFn();
    await StorageService.setItem(key, fetchedData);
    return fetchedData;
  };

  return useQuery({
    queryKey: [key],
    queryFn: fetchStoredData,
    // refetchInterval: 5000,
    ...options,
    onSuccess: (data) => {
      StorageService.setItem(key, data);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Data successfully fetched and stored for key ${key}`,
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Error fetching data for key ${key}: ${error.message}`,
      });
    },
  });
};

export const useInvalidateStorageQuery = () => {
  const queryClient = useQueryClient();

  const invalidateStorageQuery = (key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return invalidateStorageQuery;
};
