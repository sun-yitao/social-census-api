import prismaClient from '@/prisma/client';
import Service from './service';

class CommentService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.comment;
  }
}

export default CommentService;
