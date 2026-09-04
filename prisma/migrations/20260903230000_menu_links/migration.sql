-- CreateTable: MenuLink for header/footer navigation
CREATE TABLE "MenuLink" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true
);
