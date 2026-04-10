import { MigrationService } from "./server/services/migration.js";
import dotenv from "dotenv";

dotenv.config();

async function triggerMigration() {
  try {
    console.log("Starting migration...");
    const userCount = await MigrationService.migrateUsers();
    console.log(`Users migrated: ${userCount}`);
    const migrationCount = await MigrationService.migrateMigrations();
    console.log(`Migrations migrated: ${migrationCount}`);
    console.log("Migration completed successfully");
  } catch (error: any) {
    console.error("Migration failed:", error.message);
  }
}

triggerMigration();
