-- Extend the shared delivery queue to support recipients who have not created a workspace yet.
ALTER TYPE "EmailDeliveryKind" ADD VALUE 'BETA_INVITE';

CREATE TYPE "EmailDeliveryMode" AS ENUM ('SMTP', 'AUDIT_LOG');

ALTER TABLE "beta_invites"
  ADD COLUMN "trial_days" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "trial_started_at" TIMESTAMP(3),
  ADD COLUMN "trial_ends_at" TIMESTAMP(3),
  ADD COLUMN "email_dispatch_version" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "email_deliveries"
  ALTER COLUMN "workspace_id" DROP NOT NULL,
  ALTER COLUMN "profile_id" DROP NOT NULL,
  ADD COLUMN "beta_invite_id" UUID,
  ADD COLUMN "delivery_mode" "EmailDeliveryMode";

ALTER TABLE "email_deliveries"
  ADD CONSTRAINT "email_deliveries_beta_invite_id_fkey"
  FOREIGN KEY ("beta_invite_id") REFERENCES "beta_invites"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "email_deliveries"
  ADD CONSTRAINT "email_deliveries_single_audience_check" CHECK (
    ("beta_invite_id" IS NOT NULL AND "workspace_id" IS NULL AND "profile_id" IS NULL)
    OR
    ("beta_invite_id" IS NULL AND "workspace_id" IS NOT NULL AND "profile_id" IS NOT NULL)
  );

CREATE UNIQUE INDEX "email_deliveries_beta_invite_id_kind_context_key_key"
  ON "email_deliveries"("beta_invite_id", "kind", "context_key");
CREATE INDEX "email_deliveries_beta_invite_id_created_at_idx"
  ON "email_deliveries"("beta_invite_id", "created_at");
