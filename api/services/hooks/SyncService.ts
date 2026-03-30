import api from "@/api/apiInstance";
import { databaseService } from "../database/database";
import { networkService } from "../network/NetworkService";

class SyncService {
  private isSyncing: boolean = false;

  async downloadEventValidationData(eventId: string): Promise<boolean> {
    try {
      const isOnline = await networkService.checkConnectivity();
      if (!isOnline) {
        return false;
      }

      const response = await api.get(`/scan/events/${eventId}/validation-data`);

      if (response.status === 200 && response.data) {
        await databaseService.storeEventValidationData(eventId, response.data);
      
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error downloading event validation data:", error);
      return false;
    }
  }

  async syncPendingScans(): Promise<{
    success: boolean;
    syncedCount: number;
    failedCount: number;
    errors?: any[];
  }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, failedCount: 0 };
    }

    const isOnline = await networkService.checkConnectivity();
    if (!isOnline) {
      return { success: false, syncedCount: 0, failedCount: 0 };
    }

    this.isSyncing = true;

    try {
      const pendingScans = await databaseService.getPendingSyncScans();

      if (pendingScans.length === 0) {
        return { success: true, syncedCount: 0, failedCount: 0 };
      }

      // Group scans by event
      const scansByEvent = pendingScans.reduce(
        (acc, scan) => {
          if (!acc[scan.eventId]) {
            acc[scan.eventId] = [];
          }
          acc[scan.eventId].push({
            code: scan.code,
            method: scan.method,
            gate: scan.gate,
            deviceId: scan.deviceId,
            scannedAt: scan.scannedAt,
            idempotencyKey: scan.idempotencyKey,
          });
          return acc;
        },
        {} as Record<string, any[]>,
      );

      const syncedScanIds: string[] = [];
      let failedCount = 0;
      const errors: any[] = [];

      for (const [eventId, scans] of Object.entries(scansByEvent) as Array<
        [string, any[]]
      >) {
        try {
          // Prepare the payload with all required fields
          const payload = {
            eventId: eventId,
            scans: scans.map((scan) => ({
              code: scan.code,
              method: scan.method,
              gate: scan.gate,
              deviceId: scan.deviceId,
              scannedAt: scan.scannedAt,
              idempotencyKey: scan.idempotencyKey,
            })),
          };

       
          const response = await api.post("/scan/sync-scans", payload);

          if (response.status === 200 || response.status === 201) {
            // Success - mark these scans as synced
            const scanIds = pendingScans
              .filter((scan) => scan.eventId === eventId)
              .map((scan) => scan.id);
            syncedScanIds.push(...scanIds);
         
          } else {
            failedCount += scans.length;
            errors.push({
              eventId,
              scans,
              status: response.status,
              message: response.data?.message || "Sync failed",
            });
          }
        } catch (error: any) {
          console.error(`Error syncing scans for event ${eventId}:`, error);
          failedCount += scans.length;

          // Extract error details from response if available
          const errorDetails = error.response?.data;
          errors.push({
            eventId,
            scans,
            status: error.response?.status,
            message: errorDetails?.message || error.message,
            cause: errorDetails?.cause,
            errors: errorDetails?.errors || [],
          });

          // Log detailed error information
          if (errorDetails?.errors) {
            console.error(
              "Validation errors:",
              JSON.stringify(errorDetails.errors, null, 2),
            );
          }
        }
      }

      // Delete successfully synced scans
      if (syncedScanIds.length > 0) {
        await databaseService.deleteSyncedScans(syncedScanIds);
      }

      return {
        success: true,
        syncedCount: syncedScanIds.length,
        failedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Error syncing pending scans:", error);
      return { success: false, syncedCount: 0, failedCount: 0 };
    } finally {
      this.isSyncing = false;
    }
  }

  async syncAll(eventId?: string): Promise<{
    validationData: boolean;
    pendingScans: { syncedCount: number; failedCount: number; errors?: any[] };
  }> {
    let validationDataSuccess = true;

    if (eventId) {
      validationDataSuccess = await this.downloadEventValidationData(eventId);
    }

    const pendingScansResult = await this.syncPendingScans();

    return {
      validationData: validationDataSuccess,
      pendingScans: {
        syncedCount: pendingScansResult.syncedCount,
        failedCount: pendingScansResult.failedCount,
        errors: pendingScansResult.errors,
      },
    };
  }
}

export const syncService = new SyncService();
