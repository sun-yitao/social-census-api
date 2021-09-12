import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';

import { PrismaClient } from '@prisma/client';

class QuestionController {
  public questions = new PrismaClient().question;
  public responses = new PrismaClient().response;

  public list = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = req.user.uid;
      const user_answered_questions = await this.responses.findMany({
        where: {
          uid: {
            equals: user_id,
          },
        },
        select: {
          questionId: true,
        },
      });

      const next_questions = await this.questions.findMany({
        include: {
          options: true,
        },
        where: {
          id: { notIn: user_answered_questions.map(question => question.questionId) },
        },
        take: 10,
      });
      res.json({
        questions: next_questions,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default QuestionController;
