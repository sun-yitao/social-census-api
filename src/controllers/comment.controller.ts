import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Comment } from '.prisma/client';
import CommentService from '@/services/comment.service';
import ResponseService from '@/services/response.service';
import UserService from '@/services/user.service';
import { HttpException } from '@/exceptions/HttpException';

class CommentController {
  public commentService = new CommentService();
  public responseService = new ResponseService();
  public userService = new UserService();

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

      // resolve Comment object
      const transformComment = async comment => {
        const [userObj, userResponses] = await Promise.all([
          this.userService.getUserObject(comment.uid),
          this.responseService.getUserResponsesForQuestion(comment.uid, questionId),
        ]);

        return {
          ...comment,
          user: userObj,
          userResponses: userResponses,
          likes: comment.likes.length,
        };
      };

      const transformedComments = await Promise.all(
        comments.map(async comment => {
          const [transformedComment, children] = await Promise.all([
            transformComment(comment),
            Promise.all(comment['children'].map(transformComment)),
          ]);

          return {
            ...transformedComment,
            children: children,
          };
        }),
      );

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

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const commentId = parseInt(req.params.commentId);
      const questionId = parseInt(req.params.questionId);

      const commentWhereClause = {
        id: commentId,
        uid: userId,
        questionId: questionId,
      };
      // checks whether comment belongs to question, and that user is deleting own comment.
      const comment = await this.commentService.findFirstOptional({
        where: commentWhereClause,
      });
      if (comment == null) {
        throw new HttpException(404, 'comment not found for user & question');
      }

      await this.commentService.deleteMany({
        where: commentWhereClause,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
