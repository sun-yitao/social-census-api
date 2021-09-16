import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Question, QuestionOption } from '.prisma/client';
import QuestionService from '@/services/question.service';
import ResponseService from '@/services/response.service';
import QuestionOptionService from '@/services/questionOption.service';
import { HttpException } from '@/exceptions/HttpException';

class QuestionController {
  public questionService = new QuestionService();
  public responseService = new ResponseService();
  public questionOptionService = new QuestionOptionService();

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
      const userHasAnswered: boolean = await this.responseService.userHasAnswered(userId, questionId);
      if (userHasAnswered) {
        throw new HttpException(400, `User has already answered question.`);
      }

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
}

export default QuestionController;
