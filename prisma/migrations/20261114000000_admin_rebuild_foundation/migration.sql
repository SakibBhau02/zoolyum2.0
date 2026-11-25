-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "summary" TEXT,
    "diff" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" SERIAL NOT NULL,
    "collection" TEXT NOT NULL,
    "recordId" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "label" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoMeta" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "ogImage" TEXT,
    "canonical" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "keywords" TEXT[],
    "schemaType" TEXT,
    "schemaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotFoundLog" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotFoundLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Revision_collection_recordId_createdAt_idx" ON "Revision"("collection", "recordId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMeta_path_key" ON "SeoMeta"("path");

-- CreateIndex
CREATE INDEX "SeoMeta_updatedAt_idx" ON "SeoMeta"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_source_key" ON "Redirect"("source");

-- CreateIndex
CREATE INDEX "Redirect_active_idx" ON "Redirect"("active");

-- CreateIndex
CREATE UNIQUE INDEX "NotFoundLog_path_key" ON "NotFoundLog"("path");

-- CreateIndex
CREATE INDEX "NotFoundLog_hits_idx" ON "NotFoundLog"("hits");

-- CreateIndex
CREATE INDEX "Job_active_dept_idx" ON "Job"("active", "dept");

-- CreateIndex
CREATE INDEX "Lead_read_createdAt_idx" ON "Lead"("read", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_kind_createdAt_idx" ON "Lead"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "MenuLink_visible_group_sort_idx" ON "MenuLink"("visible", "group", "sort");

-- CreateIndex
CREATE INDEX "Post_published_date_idx" ON "Post"("published", "date");

-- CreateIndex
CREATE INDEX "Post_status_updatedAt_idx" ON "Post"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Post_updatedAt_idx" ON "Post"("updatedAt");

-- CreateIndex
CREATE INDEX "Project_published_sort_idx" ON "Project"("published", "sort");

-- CreateIndex
CREATE INDEX "Project_status_updatedAt_idx" ON "Project"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "TeamMember_sort_idx" ON "TeamMember"("sort");

-- CreateIndex
CREATE INDEX "Testimonial_sort_idx" ON "Testimonial"("sort");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Backfill the new workflow status from the existing published flag.
UPDATE "Post" SET "status" = CASE WHEN "published" THEN 'published' ELSE 'draft' END;
UPDATE "Project" SET "status" = CASE WHEN "published" THEN 'published' ELSE 'draft' END;

