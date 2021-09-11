-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('BINARY', 'MULTIPLE_CHOICE', 'MULTIPLE_RESPONSE', 'SCALE');

-- CreateTable
CREATE TABLE "Response" (
    "uid" TEXT NOT NULL,
    "optionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("uid","optionId")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    PRIMARY KEY ("id","questionId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "knowMore" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "parentId" INTEGER,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "uid" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,

    PRIMARY KEY ("uid","commentId")
);

-- CreateTable
CREATE TABLE "MatchExclusion" (
    "uid" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    PRIMARY KEY ("uid","questionId")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "otherUid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchQuestion" (
    "matchId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    PRIMARY KEY ("matchId","questionId")
);

-- AddForeignKey
ALTER TABLE "Response" ADD FOREIGN KEY ("optionId", "questionId") REFERENCES "QuestionOption"("id", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchExclusion" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchQuestion" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchQuestion" ADD FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
