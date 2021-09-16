import { HttpException } from '@/exceptions/HttpException';
import prismaClient from '@/prisma/client';
import Service from './service';

class ResponseService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.response;
  }

  public async userHasAnswered(userId: string, questionId: number): Promise<boolean> {
    const userResponse = await this.resource.findFirst({
      where: {
        uid: userId,
        questionId: questionId,
      },
    });
    return userResponse !== null;
  }

  public async userHasNotAnsweredThrow(userId: string, questionId: number): Promise<void> {
    const userHasAnswered: boolean = await this.userHasAnswered(userId, questionId);
    if (!userHasAnswered) {
      throw new HttpException(400, `User has not answered question.`);
    }
  }
}

export default ResponseService;
