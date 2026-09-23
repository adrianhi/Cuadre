CREATE TABLE "coro_expense_payers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "expense_id" UUID NOT NULL,
  "participant_id" UUID NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  CONSTRAINT "coro_expense_payers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "coro_expense_payers_expense_id_participant_id_key" ON "coro_expense_payers"("expense_id", "participant_id");
CREATE INDEX "coro_expense_payers_participant_id_idx" ON "coro_expense_payers"("participant_id");

ALTER TABLE "coro_expense_payers" ADD CONSTRAINT "coro_expense_payers_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "coro_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coro_expense_payers" ADD CONSTRAINT "coro_expense_payers_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "coro_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "coro_settlements" ADD COLUMN "payment_note" TEXT;
