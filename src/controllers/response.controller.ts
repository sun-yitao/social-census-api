import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';

import { PrismaClient } from '@prisma/client';

class ResponseController {
  public client = new PrismaClient();

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = req.user.uid;

      const responses_count = await this.client.response.createMany({
        data: req.body.responses.map(r => {
          return {
            uid: user_id,
            optionId: r.optionId,
            questionId: r.questionId,
          };
        }),
      });

      res.json(responses_count);
    } catch (error) {
      next(error);
    }
  };
}

export default ResponseController;
