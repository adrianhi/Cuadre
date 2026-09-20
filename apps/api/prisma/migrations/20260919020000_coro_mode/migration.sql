CREATE TYPE "CoroStatus" AS ENUM ('ACTIVE', 'LOCKED', 'ARCHIVED');
CREATE TYPE "CoroSettlementStatus" AS ENUM ('PENDING', 'MARKED_PAID', 'CONFIRMED');

CREATE TABLE "coro_groups" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "workspace_id" UUID NOT NULL,
  "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'DOP', "status" "CoroStatus" NOT NULL DEFAULT 'ACTIVE',
  "locked_at" TIMESTAMP(3), "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coro_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coro_participants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "coro_group_id" UUID NOT NULL,
  "profile_id" UUID, "name" TEXT NOT NULL, "normalized_name" TEXT NOT NULL,
  "is_owner" BOOLEAN NOT NULL DEFAULT false, "claim_token_hash" TEXT,
  "token_created_at" TIMESTAMP(3), "token_revoked_at" TIMESTAMP(3),
  "payment_details_encrypted" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coro_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coro_expenses" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "coro_group_id" UUID NOT NULL,
  "paid_by_id" UUID NOT NULL, "created_by_participant_id" UUID NOT NULL,
  "transaction_id" TEXT, "title" TEXT NOT NULL, "amount" DECIMAL(18,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'DOP', "category" TEXT NOT NULL DEFAULT 'Varios',
  "expense_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "notes" TEXT,
  "deleted_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coro_expenses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coro_expense_splits" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "expense_id" UUID NOT NULL,
  "participant_id" UUID NOT NULL, "assigned_amount" DECIMAL(18,2) NOT NULL,
  CONSTRAINT "coro_expense_splits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coro_settlements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "coro_group_id" UUID NOT NULL,
  "from_participant_id" UUID NOT NULL, "to_participant_id" UUID NOT NULL,
  "confirmed_by_participant_id" UUID, "amount" DECIMAL(18,2) NOT NULL,
  "status" "CoroSettlementStatus" NOT NULL DEFAULT 'PENDING',
  "marked_paid_at" TIMESTAMP(3), "confirmed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coro_settlements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "coro_groups_slug_key" ON "coro_groups"("slug");
CREATE INDEX "coro_groups_workspace_id_status_updated_at_idx" ON "coro_groups"("workspace_id", "status", "updated_at");
CREATE UNIQUE INDEX "coro_participants_claim_token_hash_key" ON "coro_participants"("claim_token_hash");
CREATE UNIQUE INDEX "coro_participants_coro_group_id_normalized_name_key" ON "coro_participants"("coro_group_id", "normalized_name");
CREATE UNIQUE INDEX "coro_participants_coro_group_id_profile_id_key" ON "coro_participants"("coro_group_id", "profile_id");
CREATE INDEX "coro_participants_coro_group_id_created_at_idx" ON "coro_participants"("coro_group_id", "created_at");
CREATE UNIQUE INDEX "coro_expenses_transaction_id_key" ON "coro_expenses"("transaction_id");
CREATE INDEX "coro_expenses_coro_group_id_expense_date_idx" ON "coro_expenses"("coro_group_id", "expense_date");
CREATE INDEX "coro_expenses_coro_group_id_deleted_at_idx" ON "coro_expenses"("coro_group_id", "deleted_at");
CREATE INDEX "coro_expenses_created_by_participant_id_idx" ON "coro_expenses"("created_by_participant_id");
CREATE UNIQUE INDEX "coro_expense_splits_expense_id_participant_id_key" ON "coro_expense_splits"("expense_id", "participant_id");
CREATE INDEX "coro_expense_splits_participant_id_idx" ON "coro_expense_splits"("participant_id");
CREATE UNIQUE INDEX "coro_settlements_group_from_to_key" ON "coro_settlements"("coro_group_id", "from_participant_id", "to_participant_id");
CREATE INDEX "coro_settlements_coro_group_id_status_idx" ON "coro_settlements"("coro_group_id", "status");

ALTER TABLE "coro_groups" ADD CONSTRAINT "coro_groups_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coro_participants" ADD CONSTRAINT "coro_participants_coro_group_id_fkey" FOREIGN KEY ("coro_group_id") REFERENCES "coro_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coro_participants" ADD CONSTRAINT "coro_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "coro_expenses" ADD CONSTRAINT "coro_expenses_coro_group_id_fkey" FOREIGN KEY ("coro_group_id") REFERENCES "coro_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coro_expenses" ADD CONSTRAINT "coro_expenses_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "coro_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coro_expenses" ADD CONSTRAINT "coro_expenses_created_by_participant_id_fkey" FOREIGN KEY ("created_by_participant_id") REFERENCES "coro_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coro_expenses" ADD CONSTRAINT "coro_expenses_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "coro_expense_splits" ADD CONSTRAINT "coro_expense_splits_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "coro_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coro_expense_splits" ADD CONSTRAINT "coro_expense_splits_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "coro_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coro_settlements" ADD CONSTRAINT "coro_settlements_coro_group_id_fkey" FOREIGN KEY ("coro_group_id") REFERENCES "coro_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coro_settlements" ADD CONSTRAINT "coro_settlements_from_participant_id_fkey" FOREIGN KEY ("from_participant_id") REFERENCES "coro_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coro_settlements" ADD CONSTRAINT "coro_settlements_to_participant_id_fkey" FOREIGN KEY ("to_participant_id") REFERENCES "coro_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coro_settlements" ADD CONSTRAINT "coro_settlements_confirmed_by_participant_id_fkey" FOREIGN KEY ("confirmed_by_participant_id") REFERENCES "coro_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "coro_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coro_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coro_expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coro_expense_splits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coro_settlements" ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE role_name TEXT; table_name TEXT; BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    FOREACH table_name IN ARRAY ARRAY['coro_groups', 'coro_participants', 'coro_expenses', 'coro_expense_splits', 'coro_settlements'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %I FROM %I', table_name, role_name);
      END IF;
    END LOOP;
  END LOOP;
END $$;
