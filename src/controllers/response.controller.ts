import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import prismaClient from '@/prisma/client';

class ResponseController {
  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;

      const responsesCount = await prismaClient.response.createMany({
        data: req.body.responses.map(r => {
          return {
            uid: userId,
            optionId: r.optionId,
            questionId: r.questionId,
          };
        }),
      });

      res.json(responsesCount);
    } catch (error) {
      next(error);
    }
  };
}

export default ResponseController;
