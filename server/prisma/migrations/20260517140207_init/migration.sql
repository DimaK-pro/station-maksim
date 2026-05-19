-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "sphere" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "comment" TEXT,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChestItem" (
    "id" SERIAL NOT NULL,
    "chestType" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpinResult" (
    "id" SERIAL NOT NULL,
    "chestType" TEXT NOT NULL,
    "chestItemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpinResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "curveK" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "decayCoeff" DOUBLE PRECISION NOT NULL DEFAULT 0.92,
    "thresholdPlus" INTEGER NOT NULL DEFAULT 50,
    "thresholdMinus" INTEGER NOT NULL DEFAULT -50,
    "weightsGood" TEXT NOT NULL DEFAULT '5,10,20,35,50',
    "weightsNeutral" TEXT NOT NULL DEFAULT '-2,-1,0,1,2',
    "weightsBad" TEXT NOT NULL DEFAULT '-5,-10,-20,-35,-50',
    "rewardDays" TEXT NOT NULL DEFAULT '1,7,14,30',
    "consequenceDays" TEXT NOT NULL DEFAULT '1,3,7,14',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpinResult" ADD CONSTRAINT "SpinResult_chestItemId_fkey" FOREIGN KEY ("chestItemId") REFERENCES "ChestItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
