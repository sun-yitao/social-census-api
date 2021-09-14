import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import prismaClient from '@/prisma/client';
import { HttpException } from '@/exceptions/HttpException';

class ResponseController {
  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const responses = req.body.responses;
      // if responses empty or not all responses has same questionId
      if (responses.length == 0 || !responses.every((val, i, arr) => val.questionId === arr[0].questionId)) {
        throw new HttpException(400, 'Invalid responses');
      }
      const questionId = responses[0].questionId;

      await prismaClient.response.createMany({
        data: responses.map(r => {
          return {
            uid: userId,
            optionId: r.optionId,
            questionId: r.questionId,
          };
        }),
      });

      const userQuestionResponses = await prismaClient.response.findMany({
        where: {
          uid: userId,
          questionId: questionId,
        },
      });

      res.status(201);
      res.json({
        value: userQuestionResponses,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ResponseController;
