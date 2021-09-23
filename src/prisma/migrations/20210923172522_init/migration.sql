-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('BINARY', 'MULTIPLE_CHOICE', 'MULTIPLE_RESPONSE', 'SCALE');

-- CreateTable
CREATE TABLE "Response" (
    "uid" TEXT NOT NULL,
    "optionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("uid","optionId","questionId")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id","questionId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "knowMore" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "parentId" INTEGER,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "uid" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("uid","commentId")
);

-- CreateTable
CREATE TABLE "Report" (
    "uid" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("uid","commentId")
);

-- CreateTable
CREATE TABLE "MatchExclusion" (
    "uid" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "MatchExclusion_pkey" PRIMARY KEY ("uid","questionId")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "otherUid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchQuestion" (
    "matchId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "MatchQuestion_pkey" PRIMARY KEY ("matchId","questionId")
);

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_optionId_questionId_fkey" FOREIGN KEY ("optionId", "questionId") REFERENCES "QuestionOption"("id", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchExclusion" ADD CONSTRAINT "MatchExclusion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchQuestion" ADD CONSTRAINT "MatchQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchQuestion" ADD CONSTRAINT "MatchQuestion_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
