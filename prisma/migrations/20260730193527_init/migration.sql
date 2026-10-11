-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT,
    "pincode" TEXT,
    "totalBeds" INTEGER,
    "emergencyAvailable" BOOLEAN NOT NULL DEFAULT false,
    "departments" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "waitMinutes" INTEGER NOT NULL DEFAULT 0,
    "crowdLevel" TEXT NOT NULL DEFAULT 'Low',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);
