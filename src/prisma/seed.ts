import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const questionData: Prisma.QuestionCreateInput[] = [
  {
    body: 'Would you marry someone from a different race?',
    category: 'race',
    type: 'BINARY',
    knowMore: {},
    options: {
      create: [
        {
          id: 0,
          body: 'Yes',
        },
        {
          id: 1,
          body: 'No',
        },
      ],
    },
  },
  {
    body: 'My personal aspirations are held back by my financial situation.',
    category: 'finance',
    type: 'SCALE',
    knowMore: {},
    options: {
      create: [
        {
          id: 0,
          body: '1',
        },
        {
          id: 1,
          body: '2',
        },
        {
          id: 2,
          body: '3',
        },
        {
          id: 3,
          body: '4',
        },
        {
          id: 4,
          body: '5',
        },
      ],
    },
  },
  {
    body: 'Have you ever felt discriminated for any of these areas?',
    category: 'general',
    type: 'MULTIPLE_RESPONSE',
    knowMore: {},
    options: {
      create: [
        {
          id: 0,
          body: 'Race',
        },
        {
          id: 1,
          body: 'Religion',
        },
        {
          id: 2,
          body: 'Gender',
        },
        {
          id: 3,
          body: 'Sexuality',
        },
        {
          id: 4,
          body: 'Disability',
        },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const q of questionData) {
    const question = await prisma.question.create({
      data: q,
    });
    console.log(`Created question with id: ${question.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
