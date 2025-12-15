/*
  Warnings:

  - You are about to drop the column `endDate` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `businessId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkIn` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOut` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guests` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "checkIn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "checkOut" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "guests" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "notes" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
