import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import prismaClient from '@/prisma/client';

class QuestionController {
  public questions = prismaClient.question;
  public responses = prismaClient.response;

  public list = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const userAnsweredQuestions = await this.responses.findMany({
        where: {
          uid: {
            equals: userId,
          },
        },
        select: {
          questionId: true,
        },
      });

      const nextQuestions = await this.questions.findMany({
        include: {
          options: true,
        },
        where: {
          id: { notIn: userAnsweredQuestions.map(question => question.questionId) },
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
      const question = await this.questions.findUnique({
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
