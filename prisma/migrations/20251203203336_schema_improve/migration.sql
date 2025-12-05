/*
  Warnings:

  - You are about to drop the column `lastSyncedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `retailPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `syncStatus` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `wholesalePrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncedAt` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `syncStatus` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "lastSyncedAt",
DROP COLUMN "retailPrice",
DROP COLUMN "syncStatus",
DROP COLUMN "unit",
DROP COLUMN "wholesalePrice",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "lastSyncedAt",
DROP COLUMN "syncStatus",
DROP COLUMN "tax";
