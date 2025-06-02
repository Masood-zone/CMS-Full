/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Made the column `parentPhone` on table `students` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "students" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "parentName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "parentPhone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");
