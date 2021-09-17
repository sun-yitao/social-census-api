import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import MatchExclusionService from '@/services/matchExclusion.service';
import { HttpException } from '@/exceptions/HttpException';
import ResponseService from '@/services/response.service';
import { MatchExclusion } from '.prisma/client';

class MatchExclusionController {
  public matchExclusionService = new MatchExclusionService();
  public responseService = new ResponseService();

  public list = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const exclusions: MatchExclusion[] = await this.matchExclusionService.findMany({
        where: {
          uid: {
            equals: userId,
          },
        },
      });
      res.json({
        value: exclusions,
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.body.value.questionId);
      await this.responseService.userHasNotAnsweredThrow(userId, questionId);
      const exists: MatchExclusion = await this.matchExclusionService.findFirstOptional({
        where: {
          uid: userId,
          questionId: questionId,
        },
      });
      if (exists) {
        throw new HttpException(409, 'Match exclusion already exists');
      }

      const exclusion: MatchExclusion = await this.matchExclusionService.create({
        data: {
          uid: userId,
          questionId: questionId,
        },
        select: {
          uid: true,
          questionId: true,
        },
      });

      res.status(201);
      res.json({
        value: exclusion,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.body.value.questionId);

      await this.matchExclusionService.deleteByQuestionId(userId, questionId);

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}

export default MatchExclusionController;
