import * as SQLite from "expo-sqlite";

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync("scanner.db");
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      // Create event validation data table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS event_validation_data (
          eventId TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          lastUpdatedAt TEXT NOT NULL,
          total INTEGER NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create scanned tickets table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS scanned_tickets (
          id TEXT PRIMARY KEY,
          eventId TEXT NOT NULL,
          ticketCode TEXT NOT NULL,
          ticketId TEXT,
          status TEXT NOT NULL,
          scannedAt TEXT NOT NULL,
          synced INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(eventId, ticketCode)
        );
      `);

      // Check if pending_sync_scans table exists
      const tableExists = await this.db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='pending_sync_scans'",
      );

      if (!tableExists) {
        // Create new table if it doesn't exist
        await this.db.execAsync(`
          CREATE TABLE pending_sync_scans (
            id TEXT PRIMARY KEY,
            eventId TEXT NOT NULL,
            code TEXT NOT NULL,
            method TEXT NOT NULL,
            gate TEXT NOT NULL,
            deviceId TEXT NOT NULL,
            idempotencyKey TEXT NOT NULL,
            scannedAt TEXT NOT NULL,
            synced INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } else {
        // Add missing columns if they don't exist
        try {
          await this.db.execAsync(`
            ALTER TABLE pending_sync_scans ADD COLUMN deviceId TEXT;
          `);
        } catch (error) {
          // Column might already exist
        }

        try {
          await this.db.execAsync(`
            ALTER TABLE pending_sync_scans ADD COLUMN idempotencyKey TEXT;
          `);
        } catch (error) {
          // Column might already exist
        }

        try {
          await this.db.execAsync(`
            ALTER TABLE pending_sync_scans ADD COLUMN synced INTEGER DEFAULT 0;
          `);
        } catch (error) {
          // Column might already exist
        }
      }

    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // Store event validation data
  async storeEventValidationData(eventId: string, data: any): Promise<boolean> {
    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO event_validation_data (eventId, data, lastUpdatedAt, total)
         VALUES (?, ?, ?, ?)`,
        [eventId, JSON.stringify(data), data.lastUpdatedAt, data.total],
      );
      return true;
    } catch (error) {
      console.error("Error storing event validation data:", error);
      return false;
    }
  }

  // Get event validation data
  async getEventValidationData(eventId: string): Promise<any | null> {
    try {
      const result = (await this.db.getFirstAsync(
        `SELECT * FROM event_validation_data WHERE eventId = ?`,
        [eventId],
      )) as { data: string } | undefined;
      if (result) {
        return {
          ...result,
          data: JSON.parse(result.data),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting event validation data:", error);
      return null;
    }
  }

  // Check if ticket exists in validation data
  async checkTicketInValidationData(
    eventId: string,
    ticketCode: string,
  ): Promise<any | null> {
    try {
      const validationData = await this.getEventValidationData(eventId);
      if (validationData && validationData.data.tickets[ticketCode]) {
        return validationData.data.tickets[ticketCode];
      }
      return null;
    } catch (error) {
      console.error("Error checking ticket in validation data:", error);
      return null;
    }
  }

  // Add scanned ticket
  async addScannedTicket(
    eventId: string,
    ticketCode: string,
    ticketId: string | null,
    status: string,
  ): Promise<boolean> {
    try {
      const scannedAt = new Date().toISOString();
      const id = `${eventId}-${ticketCode}`;

      await this.db.runAsync(
        `INSERT OR REPLACE INTO scanned_tickets (id, eventId, ticketCode, ticketId, status, scannedAt, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, eventId, ticketCode, ticketId, status, scannedAt, 0],
      );

      return true;
    } catch (error) {
      console.error("Error adding scanned ticket:", error);
      return false;
    }
  }

  // Check if ticket has been scanned locally
  async isTicketScannedLocally(
    eventId: string,
    ticketCode: string,
  ): Promise<boolean> {
    try {
      const result = await this.db.getFirstAsync(
        `SELECT * FROM scanned_tickets WHERE eventId = ? AND ticketCode = ?`,
        [eventId, ticketCode],
      );
      return !!result;
    } catch (error) {
      console.error("Error checking scanned ticket:", error);
      return false;
    }
  }

  // Add pending sync scan with all required fields
  async addPendingSyncScan(
    eventId: string,
    code: string,
    method: string,
    gate: string,
    deviceId: string,
    idempotencyKey: string,
  ): Promise<boolean> {
    try {
      const id = `${eventId}-${code}-${Date.now()}`;
      const scannedAt = new Date().toISOString();

      await this.db.runAsync(
        `INSERT INTO pending_sync_scans (id, eventId, code, method, gate, deviceId, idempotencyKey, scannedAt, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          eventId,
          code,
          method,
          gate,
          deviceId,
          idempotencyKey,
          scannedAt,
          0,
        ],
      );

   
      return true;
    } catch (error) {
      console.error("Error adding pending sync scan:", error);
      return false;
    }
  }

  // Get pending sync scans (only unsynced ones)
  async getPendingSyncScans(): Promise<any[]> {
    try {
      const results = await this.db.getAllAsync(
        `SELECT * FROM pending_sync_scans WHERE synced = 0 ORDER BY createdAt ASC`,
      );
      return results;
    } catch (error) {
      console.error("Error getting pending sync scans:", error);
      return [];
    }
  }

  // Get all pending sync scans (including synced - for debugging)
  async getAllPendingSyncScans(): Promise<any[]> {
    try {
      const results = await this.db.getAllAsync(
        `SELECT * FROM pending_sync_scans ORDER BY createdAt ASC`,
      );
      return results;
    } catch (error) {
      console.error("Error getting all pending sync scans:", error);
      return [];
    }
  }

  // Get pending sync scans by event
  async getPendingSyncScansByEvent(eventId: string): Promise<any[]> {
    try {
      const results = await this.db.getAllAsync(
        `SELECT * FROM pending_sync_scans WHERE eventId = ? AND synced = 0 ORDER BY createdAt ASC`,
        [eventId],
      );
      return results;
    } catch (error) {
      console.error("Error getting pending sync scans by event:", error);
      return [];
    }
  }

  // Delete synced scans
  async deleteSyncedScans(scanIds: string[]): Promise<boolean> {
    try {
      const placeholders = scanIds.map(() => "?").join(",");
      await this.db.runAsync(
        `DELETE FROM pending_sync_scans WHERE id IN (${placeholders})`,
        scanIds,
      );
      return true;
    } catch (error) {
      console.error("Error deleting synced scans:", error);
      return false;
    }
  }

  // Mark specific scans as synced (alternative to delete)
  async markScansAsSynced(scanIds: string[]): Promise<boolean> {
    try {
      const placeholders = scanIds.map(() => "?").join(",");
      await this.db.runAsync(
        `UPDATE pending_sync_scans SET synced = 1 WHERE id IN (${placeholders})`,
        scanIds,
      );
      return true;
    } catch (error) {
      console.error("Error marking scans as synced:", error);
      return false;
    }
  }

  // Get count of pending scans (unsynced only)
  async getPendingScansCount(): Promise<number> {
    try {
      const result = (await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM pending_sync_scans WHERE synced = 0`,
      )) as { count: number } | undefined;
      return result?.count || 0;
    } catch (error) {
      console.error("Error getting pending scans count:", error);
      return 0;
    }
  }

  // Get total count of all scans (for debugging)
  async getTotalScansCount(): Promise<number> {
    try {
      const result = (await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM pending_sync_scans`,
      )) as { count: number } | undefined;
      return result?.count || 0;
    } catch (error) {
      console.error("Error getting total scans count:", error);
      return 0;
    }
  }

  // Clear event validation data for a specific event
  async clearEventValidationData(eventId: string): Promise<boolean> {
    try {
      await this.db.runAsync(
        `DELETE FROM event_validation_data WHERE eventId = ?`,
        [eventId],
      );
      return true;
    } catch (error) {
      console.error("Error clearing event validation data:", error);
      return false;
    }
  }

  // Clear all scanned tickets for a specific event
  async clearScannedTickets(eventId: string): Promise<boolean> {
    try {
      await this.db.runAsync(`DELETE FROM scanned_tickets WHERE eventId = ?`, [
        eventId,
      ]);
      return true;
    } catch (error) {
      console.error("Error clearing scanned tickets:", error);
      return false;
    }
  }

  // Clear all pending scans for a specific event
  async clearPendingScans(eventId: string): Promise<boolean> {
    try {
      await this.db.runAsync(
        `DELETE FROM pending_sync_scans WHERE eventId = ?`,
        [eventId],
      );
      return true;
    } catch (error) {
      console.error("Error clearing pending scans:", error);
      return false;
    }
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<boolean> {
    try {
      // Run deletes sequentially, not as a batch exec
      await this.db.runAsync("DELETE FROM event_validation_data");
      await this.db.runAsync("DELETE FROM scanned_tickets");
      await this.db.runAsync("DELETE FROM pending_sync_scans");


      return true;
    } catch (error) {
      console.error("Error clearing all data:", error);
      return false;
    }
  }

  // Reset database (drop and recreate all tables)
  async resetDatabase(): Promise<boolean> {
    try {
      await this.db.execAsync(`DROP TABLE IF EXISTS pending_sync_scans`);
      await this.db.execAsync(`DROP TABLE IF EXISTS scanned_tickets`);
      await this.db.execAsync(`DROP TABLE IF EXISTS event_validation_data`);
      await this.initDatabase();
      return true;
    } catch (error) {
      console.error("Error resetting database:", error);
      return false;
    }
  }

  // Get database statistics for debugging
  async getDatabaseStats(): Promise<{
    eventValidationDataCount: number;
    scannedTicketsCount: number;
    pendingScansCount: number;
    syncedScansCount: number;
  }> {
    try {
      const eventValidationDataCount = (await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM event_validation_data`,
      )) as { count: number } | undefined;
      const scannedTicketsCount = (await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM scanned_tickets`,
      )) as { count: number } | undefined;
      const pendingScansCount = (await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM pending_sync_scans WHERE synced = 0`,
      )) as { count: number } | undefined;
      const syncedScansCount = (await this.db.getFirstAsync(
        `SELECT COUNT(*) as count FROM pending_sync_scans WHERE synced = 1`,
      )) as { count: number } | undefined;

      return {
        eventValidationDataCount: eventValidationDataCount?.count || 0,
        scannedTicketsCount: scannedTicketsCount?.count || 0,
        pendingScansCount: pendingScansCount?.count || 0,
        syncedScansCount: syncedScansCount?.count || 0,
      };
    } catch (error) {
      console.error("Error getting database stats:", error);
      return {
        eventValidationDataCount: 0,
        scannedTicketsCount: 0,
        pendingScansCount: 0,
        syncedScansCount: 0,
      };
    }
  }
}

export const databaseService = new DatabaseService();
