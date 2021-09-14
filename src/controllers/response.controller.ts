import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import ResponseService from '@/services/response.service';
import { Response as ResponseType } from '.prisma/client';

class ResponseController {
  public responseService = new ResponseService();

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.params.questionId);
      const responses = req.body.responses;
      // if responses empty or not all responses has same questionId
      if (responses.length == 0 || !responses.every((val, i, arr) => val.questionId === questionId)) {
        throw new HttpException(400, 'Invalid responses');
      }

      await this.responseService.createMany({
        data: responses.map(r => {
          return {
            uid: userId,
            optionId: r.optionId,
            questionId: r.questionId,
          };
        }),
      });

      const userResponses: ResponseType[] = await this.responseService.findMany({
        where: {
          uid: userId,
          questionId: questionId,
        },
      });

      res.status(201);
      res.json({
        value: userResponses,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ResponseController;
