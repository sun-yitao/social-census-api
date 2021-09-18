import { HttpException } from '@/exceptions/HttpException';
import prismaClient from '@/prisma/client';
import { Response } from '.prisma/client';
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

  public async userHasAnsweredThrow(userId: string, questionId: number): Promise<void> {
    const userHasAnswered: boolean = await this.userHasAnswered(userId, questionId);
    if (userHasAnswered) {
      throw new HttpException(400, `User has already answered question.`);
    }
  }

  public async userHasNotAnsweredThrow(userId: string, questionId: number): Promise<void> {
    const userHasAnswered: boolean = await this.userHasAnswered(userId, questionId);
    if (!userHasAnswered) {
      throw new HttpException(400, `User has not answered question.`);
    }
  }

  /*
  Returns user's responses for a question as an array of optionId.
  */
  public async getUserResponsesForQuestion(userId: string, questionId: number): Promise<number[]> {
    const responses: Response[] = await this.resource.findMany({
      where: {
        uid: userId,
        questionId: questionId,
      },
    });

    return responses.map(response => response.optionId);
  }
}

export default ResponseService;
