-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name_zh" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "logo" TEXT,
    "url" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "videoUrl" TEXT,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "region" TEXT NOT NULL DEFAULT 'Global',
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "icp" TEXT,
    "contact" TEXT,
    "title_zh" TEXT NOT NULL,
    "summary_zh" TEXT,
    "content_zh" TEXT,
    "title_en" TEXT NOT NULL,
    "summary_en" TEXT,
    "content_en" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlerLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "message" TEXT,

    CONSTRAINT "CrawlerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_zh_key" ON "Category"("name_zh");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_en_key" ON "Category"("name_en");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_url_key" ON "Tool"("url");

-- CreateIndex
CREATE INDEX "Tool_categoryId_idx" ON "Tool"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
