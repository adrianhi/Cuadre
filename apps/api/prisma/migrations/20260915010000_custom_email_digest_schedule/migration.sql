-- AlterEnum
ALTER TYPE "EmailDigestSchedule" ADD VALUE IF NOT EXISTS 'FRIDAY_1700';
ALTER TYPE "EmailDigestSchedule" ADD VALUE IF NOT EXISTS 'CUSTOM';

-- AlterTable
ALTER TABLE "email_notification_preferences" ADD COLUMN IF NOT EXISTS "custom_day_of_week" SMALLINT;
ALTER TABLE "email_notification_preferences" ADD COLUMN IF NOT EXISTS "custom_hour" SMALLINT;
ALTER TABLE "email_notification_preferences" ADD COLUMN IF NOT EXISTS "custom_minute" SMALLINT;
