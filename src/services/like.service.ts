import { Like } from '.prisma/client';
import { HttpException } from '@/exceptions/HttpException';
import prismaClient from '@/prisma/client';
import Service from './service';

class LikeService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.like;
  }

  public async unlike(uid: string, commentId: number): Promise<void> {
    const like: Like = await this.resource.findFirst({
      where: {
        uid: uid,
        commentId: commentId,
      },
    });
    if (like == null) {
      throw new HttpException(404, 'Like not found.');
    }

    await this.resource.deleteMany({
      where: {
        uid: uid,
        commentId: commentId,
      },
    });
  }
}

export default LikeService;
