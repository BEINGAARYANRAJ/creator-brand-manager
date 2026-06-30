-- CreateTable
CREATE TABLE "DealAttachment" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DealAttachment" ADD CONSTRAINT "DealAttachment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "BrandDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
