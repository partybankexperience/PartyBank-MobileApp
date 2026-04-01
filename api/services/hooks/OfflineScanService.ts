import { databaseService } from "../database/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";

class OfflineScanService {
  private deviceId: string | null = null;

  // Get or create a unique device ID
  private async getDeviceId(): Promise<string> {
    if (this.deviceId) {
      return this.deviceId;
    }

    try {
      let deviceId = await AsyncStorage.getItem("deviceId");
      if (!deviceId) {
        // Create a unique device ID using UUID format
        deviceId = this.generateUUID();
        await AsyncStorage.setItem("deviceId", deviceId);
      }
      this.deviceId = deviceId;
      return deviceId;
    } catch (error) {
      console.error("Error getting device ID:", error);
      return "unknown-device";
    }
  }

  // Generate a proper UUID v4 idempotency key
  private generateUUID(): string {
    try {
      // Use expo-crypto to generate a proper UUID
      return Crypto.randomUUID();
    } catch (error) {
      // Fallback for older versions or if expo-crypto is not available
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        },
      );
    }
  }

  // Generate a unique idempotency key (UUID format)
  private generateIdempotencyKey(eventId: string, ticketCode: string): string {
    // Generate a proper UUID for the idempotency key
    return this.generateUUID();
  }

  async validateTicketOffline(
    eventId: string,
    ticketCode: string,
  ): Promise<{
    isValid: boolean;
    message: string;
    ticketData?: any;
  }> {
    try {
      // Check if already scanned locally
      const alreadyScanned = await databaseService.isTicketScannedLocally(
        eventId,
        ticketCode,
      );
      if (alreadyScanned) {
        return {
          isValid: false,
          message: "Ticket already scanned",
        };
      }

      // Get event validation data
      const validationData =
        await databaseService.getEventValidationData(eventId);

      if (!validationData) {
        return {
          isValid: false,
          message:
            "Event data not available offline. Please sync event data first.",
        };
      }

      const tickets = validationData.data.tickets;
      const ticketInfo = tickets[ticketCode];

      if (!ticketInfo) {
        return {
          isValid: false,
          message: "Invalid ticket code",
        };
      }

      if (ticketInfo.status === "scanned") {
        return {
          isValid: false,
          message: "Ticket already scanned",
        };
      }

      return {
        isValid: true,
        message: "Valid ticket",
        ticketData: ticketInfo,
      };
    } catch (error) {
      console.error("Error validating ticket offline:", error);
      return {
        isValid: false,
        message: "Error validating ticket offline",
      };
    }
  }

  async processOfflineScan(
    eventId: string,
    ticketCode: string,
    method: string = "qr",
    gate: string = "Gate A",
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      // Validate ticket offline
      const validation = await this.validateTicketOffline(eventId, ticketCode);

      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // Get device ID (UUID format)
      const deviceId = await this.getDeviceId();

      // Generate idempotency key (UUID format)
      const idempotencyKey = this.generateIdempotencyKey(eventId, ticketCode);

    

      // Store scanned ticket
      await databaseService.addScannedTicket(
        eventId,
        ticketCode,
        validation.ticketData?.id || null,
        "scanned",
      );

      // Add to pending sync with all required fields
      await databaseService.addPendingSyncScan(
        eventId,
        ticketCode,
        method,
        gate,
        deviceId,
        idempotencyKey,
      );

      return {
        success: true,
        message: "Ticket scanned successfully (offline mode)",
        data: {
          ticketInfo: validation.ticketData,
        },
      };
    } catch (error) {
      console.error("Error processing offline scan:", error);
      return {
        success: false,
        message: "Failed to process scan offline",
      };
    }
  }

  async getSyncStatus(): Promise<{ pendingCount: number }> {
    const pendingCount = await databaseService.getPendingScansCount();
    return { pendingCount };
  }
}

export const offlineScanService = new OfflineScanService();
