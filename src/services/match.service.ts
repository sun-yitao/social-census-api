import prismaClient from '@/prisma/client';
import Service from './service';

class MatchService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.match;
  }
}

export default MatchService;
