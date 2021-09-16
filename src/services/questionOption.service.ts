import prismaClient from '@/prisma/client';
import Service from './service';

class QuestionOptionService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.questionOption;
  }
}

export default QuestionOptionService;
