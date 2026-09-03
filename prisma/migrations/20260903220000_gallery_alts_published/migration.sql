-- AlterTable: gallery images with alt text, published flags, media alt
ALTER TABLE "Project" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ALTER COLUMN "images" SET DATA TYPE JSONB USING to_jsonb("images");
ALTER TABLE "Project" ALTER COLUMN "images" SET DEFAULT '[]';
ALTER TABLE "Post" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Media" ADD COLUMN "alt" TEXT;
