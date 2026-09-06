/*
  Warnings:

  - Made the column `images` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "sort" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "images" SET NOT NULL;
