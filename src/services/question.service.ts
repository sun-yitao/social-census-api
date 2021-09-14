import prismaClient from '@/prisma/client';
import Service from './service';

class QuestionService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.question;
  }
}

export default QuestionService;
