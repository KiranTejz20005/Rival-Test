-- CreateTable
CREATE TABLE "auth_logs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ip" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_logs_email_idx" ON "auth_logs"("email");

-- CreateIndex
CREATE INDEX "auth_logs_action_idx" ON "auth_logs"("action");

-- CreateIndex
CREATE INDEX "auth_logs_timestamp_idx" ON "auth_logs"("timestamp");

-- CreateIndex
CREATE INDEX "auth_logs_email_timestamp_idx" ON "auth_logs"("email", "timestamp");
