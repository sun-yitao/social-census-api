import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import LikeService from '@/services/like.service';
import ResponseService from '@/services/response.service';
import { HttpException } from '@/exceptions/HttpException';
import { Like } from '.prisma/client';

class LikeController {
  public likeService = new LikeService();
  public responseService = new ResponseService();

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.params.questionId);
      const commentId = parseInt(req.params.commentId);
      await this.responseService.userHasNotAnsweredThrow(userId, questionId);

      const exists: Like = await this.likeService.findFirstOptional({
        where: {
          uid: userId,
          commentId: commentId,
        },
      });

      if (exists) {
        throw new HttpException(409, 'Like already exists');
      }

      const like: Like = await this.likeService.create({
        data: {
          uid: userId,
          commentId: commentId,
        },
        select: {
          uid: true,
          commentId: true,
        },
      });

      res.status(201);
      res.json({
        value: like,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const commentId = parseInt(req.params.commentId);

      await this.likeService.unlike(userId, commentId);

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}

export default LikeController;
