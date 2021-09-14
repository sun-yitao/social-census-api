import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Question, Response as ResponseType } from '.prisma/client';
import QuestionService from '@/services/question.service';
import ResponseService from '@/services/response.service';

class QuestionController {
  public questionService = new QuestionService();
  public responseService = new ResponseService();

  public list = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const userResponses: ResponseType[] = await this.responseService.findMany({
        where: {
          uid: {
            equals: userId,
          },
        },
        select: {
          questionId: true,
        },
      });

      const nextQuestions: Question[] = await this.questionService.findMany({
        include: {
          options: true,
        },
        where: {
          id: { notIn: userResponses.map(response => response.questionId) },
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
      const questionId = parseInt(req.params.questionId);
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
}

export default QuestionController;
