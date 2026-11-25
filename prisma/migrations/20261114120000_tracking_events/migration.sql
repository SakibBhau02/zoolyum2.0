-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detail" TEXT,
    "leadId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackingEvent_createdAt_idx" ON "TrackingEvent"("createdAt");

-- CreateIndex
CREATE INDEX "TrackingEvent_provider_createdAt_idx" ON "TrackingEvent"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "TrackingEvent_status_createdAt_idx" ON "TrackingEvent"("status", "createdAt");

