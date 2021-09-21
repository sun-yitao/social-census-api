import { PrismaClient, Prisma } from '@prisma/client';

const prismaClient = new PrismaClient();

const csv = require('csv-parser');
const fs = require('fs');

async function main() {
  const questionData: Prisma.QuestionCreateInput[] = [];

  console.log(`Start seeding ...`);
  fs.createReadStream('src/prisma/questionBank.csv')
    .pipe(csv())
    .on('data', row => {
      const options = row['Options'].split(',').map((body, idx) => {
        return {
          id: idx,
          body: body.trim(),
        };
      });

      questionData.push({
        body: row['Questions'].trim(),
        category: row['Category'].trim(),
        type: row['Type'].trim(),
        knowMore: {},
        options: {
          create: options,
        },
      });
    })
    .on('end', async () => {
      for (const q of questionData) {
        const question = await prismaClient.question.create({
          data: q,
        });
        console.log(`Created question with id: ${question.id}`);
      }
      console.log(`Seeding finished.`);
    });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
