-- CreateTable
CREATE TABLE "public"."TrafficData" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "vehicleCount" INTEGER NOT NULL,
    "averageSpeed" DOUBLE PRECISION NOT NULL,
    "congestionLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrafficData_pkey" PRIMARY KEY ("id")
);
