CREATE TYPE "TransactionFinancialRole" AS ENUM ('EXPENSE', 'INCOME', 'INTERNAL_TRANSFER');
CREATE TYPE "TransactionFinancialRoleOrigin" AS ENUM ('SYSTEM', 'BANK_SIGNAL', 'USER_RULE', 'MANUAL', 'MIGRATION');

ALTER TABLE "transactions"
  ADD COLUMN "financial_role" "TransactionFinancialRole" NOT NULL DEFAULT 'EXPENSE',
  ADD COLUMN "financial_role_origin" "TransactionFinancialRoleOrigin" NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN "suggested_financial_role" "TransactionFinancialRole";

UPDATE "transactions"
SET
  "financial_role" = CASE
    WHEN LOWER("category") LIKE '%transferencias propias%'
      OR LOWER("category") LIKE '%transferencia propia%'
      OR LOWER("transaction_type") LIKE '%entre cuentas%'
      OR LOWER("transaction_type") LIKE '%transferencia propia%'
      THEN 'INTERNAL_TRANSFER'::"TransactionFinancialRole"
    WHEN LOWER("transaction_type") LIKE '%recibida%'
      OR LOWER("category") LIKE '%ingreso%'
      OR LOWER("source") LIKE '%transfer_income%'
      THEN 'INCOME'::"TransactionFinancialRole"
    ELSE 'EXPENSE'::"TransactionFinancialRole"
  END,
  "category" = CASE
    WHEN LOWER("category") LIKE '%transferencias propias%'
      OR LOWER("category") LIKE '%transferencia propia%'
      OR LOWER("transaction_type") LIKE '%entre cuentas%'
      OR LOWER("transaction_type") LIKE '%transferencia propia%'
      THEN 'Transferencias Propias'
    ELSE "category"
  END,
  "transaction_type" = CASE
    WHEN LOWER("category") LIKE '%transferencias propias%'
      OR LOWER("category") LIKE '%transferencia propia%'
      OR LOWER("transaction_type") LIKE '%entre cuentas%'
      OR LOWER("transaction_type") LIKE '%transferencia propia%'
      THEN 'Transferencia entre Cuentas'
    ELSE "transaction_type"
  END,
  "financial_role_origin" = 'MIGRATION'::"TransactionFinancialRoleOrigin";

CREATE INDEX "transactions_workspace_id_financial_role_transaction_date_idx"
  ON "transactions"("workspace_id", "financial_role", "transaction_date");
