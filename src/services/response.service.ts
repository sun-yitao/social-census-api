import prismaClient from '@/prisma/client';
import Service from './service';

class ResponseService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.response;
  }
}

export default ResponseService;
