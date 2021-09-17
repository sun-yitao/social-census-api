import prismaClient from '@/prisma/client';
import Service from './service';

class MatchQuestionService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.matchQuestion;
  }
}

export default MatchQuestionService;
