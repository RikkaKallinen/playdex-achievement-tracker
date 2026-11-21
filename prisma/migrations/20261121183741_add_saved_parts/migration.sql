-- CreateTable
CREATE TABLE "SavedPart" (
    "steamId" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedPart_pkey" PRIMARY KEY ("steamId","part")
);
