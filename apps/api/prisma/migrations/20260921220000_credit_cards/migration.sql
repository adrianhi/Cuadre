-- CreateTable
CREATE TABLE "credit_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "institution_code" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "card_last_4" TEXT NOT NULL,
    "card_type" TEXT DEFAULT 'CREDIT',
    "closing_day" INTEGER NOT NULL,
    "grace_days" INTEGER NOT NULL DEFAULT 22,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "color_theme" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_cards_workspace_id_idx" ON "credit_cards"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_cards_workspace_id_institution_code_card_last_4_key" ON "credit_cards"("workspace_id", "institution_code", "card_last_4");

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_institution_code_fkey" FOREIGN KEY ("institution_code") REFERENCES "financial_institutions"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
