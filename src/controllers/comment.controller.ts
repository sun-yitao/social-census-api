import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Comment } from '.prisma/client';
import CommentService from '@/services/comment.service';

class CommentController {
  public commentService = new CommentService();

  public list = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionId = parseInt(req.params.questionId);

      const comments: Comment[] = await this.commentService.findMany({
        where: {
          questionId: questionId,
          parentId: null,
        },
        include: {
          children: true,
        },
      });

      res.json({
        value: comments,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
