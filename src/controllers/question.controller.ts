import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Question, QuestionOption, Like } from '.prisma/client';
import QuestionService from '@/services/question.service';
import ResponseService from '@/services/response.service';
import QuestionOptionService from '@/services/questionOption.service';
import LikeService from '@/services/like.service';

class QuestionController {
  public questionService = new QuestionService();
  public responseService = new ResponseService();
  public questionOptionService = new QuestionOptionService();
  public likeService = new LikeService();

  public list = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const userResponses = (
        await this.responseService.findMany({
          where: {
            uid: {
              equals: userId,
            },
          },
          select: {
            questionId: true,
          },
          distinct: ['questionId'],
        })
      ).map(response => response['questionId']);

      const nextQuestions: Question[] = await this.questionService.findMany({
        include: {
          options: true,
        },
        where: {
          id: { notIn: userResponses },
        },
        take: 10,
      });
      res.json({
        value: nextQuestions,
      });
    } catch (error) {
      next(error);
    }
  };

  public get = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.params.questionId);
      await this.responseService.userHasAnsweredThrow(userId, questionId);

      const question: Question = await this.questionService.findUnique({
        where: {
          id: questionId,
        },
        include: {
          options: true,
        },
      });
      res.json({
        value: question,
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatistics = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.params.questionId);
      await this.responseService.userHasNotAnsweredThrow(userId, questionId);

      const optionsResponses: QuestionOption[] = await this.questionOptionService.findMany({
        where: {
          questionId: questionId,
        },
        include: {
          responses: true,
        },
      });
      const optionsResponsesCount = optionsResponses.map(option => {
        return {
          ...option,
          responses: option['responses'].length,
        };
      });

      res.json({
        value: optionsResponsesCount,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserLikedComments = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const questionId = parseInt(req.params.questionId);
      await this.responseService.userHasNotAnsweredThrow(userId, questionId);

      const likes: Like[] = await this.likeService.findMany({
        where: {
          uid: userId,
          comment: {
            questionId: questionId,
          },
        },
      });

      res.json({
        value: likes.map(like => like.commentId),
      });
    } catch (error) {
      next(error);
    }
  };
}

export default QuestionController;
