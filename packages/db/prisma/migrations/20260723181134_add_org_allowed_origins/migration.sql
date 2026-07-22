-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "allowedOrigins" TEXT[] DEFAULT ARRAY[]::TEXT[];
