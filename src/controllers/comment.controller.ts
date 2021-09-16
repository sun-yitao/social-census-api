import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Comment } from '.prisma/client';
import CommentService from '@/services/comment.service';
import ResponseService from '@/services/response.service';
import { HttpException } from '@/exceptions/HttpException';

class CommentController {
  public commentService = new CommentService();
  public responseService = new ResponseService();

  public list = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.params.questionId);
      await this.responseService.userHasNotAnsweredThrow(userId, questionId);

      const comments: Comment[] = await this.commentService.findMany({
        where: {
          questionId: questionId,
          parentId: null,
        },
        include: {
          likes: true,
          children: {
            include: {
              likes: true,
            },
          },
        },
      });

      // transform Comment's Likes array to likes count
      const likesArrayToCount = comment => {
        return {
          ...comment,
          likes: comment.likes.length,
        };
      };
      const transformedComments = comments.map(comment => {
        return {
          ...likesArrayToCount(comment),
          children: comment['children'].map(likesArrayToCount),
        };
      });

      res.json({
        value: transformedComments,
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.params.questionId);
      await this.responseService.userHasNotAnsweredThrow(userId, questionId);

      const reqComment = req.body.value;

      const comment: Comment = await this.commentService.create({
        data: {
          questionId: questionId,
          uid: userId,
          body: reqComment.body,
          parentId: reqComment.parentId ? reqComment.parentId : undefined,
        },
        select: {
          id: true,
          questionId: true,
          uid: true,
          parentId: true,
          body: true,
          createdAt: true,
        },
      });

      res.status(201);
      res.json({
        value: comment,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
