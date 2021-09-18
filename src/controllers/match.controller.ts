import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import { Match, MatchExclusion, MatchQuestion } from '.prisma/client';
import redisClient from '@/services/redisClient';
import { isEmpty, randomString } from '@/utils/util';

import MatchExclusionService from '@/services/matchExclusion.service';
import MatchService from '@/services/match.service';
import MatchQuestionService from '@/services/matchQuestion.service';
import QuestionService from '@/services/question.service';
import ResponseService from '@/services/response.service';

class MatchController {
  private matchService = new MatchService();
  private matchExclusionService = new MatchExclusionService();
  private matchQuestionService = new MatchQuestionService();
  private questionService = new QuestionService();
  public responseService = new ResponseService();

  // If no free match, create match. Create matchCode if not in Redis. Return matchCode
  public getMatchCode = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      let match: Match = await this.matchService.findFirstOptional({
        where: {
          uid: userId,
          matchedAt: null,
        },
      });
      if (!match) {
        match = await this.createMatch(userId);
      }
      const matchId = String(match.id);
      let matchCode: string = await redisClient.get(matchId);
      if (isEmpty(matchCode)) {
        matchCode = randomString(7);
        redisClient.setEx(matchId, 172800, matchCode); // 2 days expiry
        redisClient.setEx(matchCode, 172800, matchId);
      }
      res.status(200);
      res.json({
        value: {
          matchCode: matchCode,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private async createMatch(userId: string): Promise<Match> {
    return this.matchService.create({
      data: {
        uid: userId,
        otherUid: null,
        matchedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  public fillMatch = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const matchId: string = await redisClient.get(req.body.matchCode);
      if (isEmpty(matchId)) {
        throw new HttpException(404, 'Match code expired or does not exist');
      }
      let match: Match = await this.matchService.findFirstOptional({
        where: {
          id: Number(matchId),
        },
      });
      if (!match) {
        throw new HttpException(404, 'Match id not found, invalid match code');
      }
      await this.generateMatchQuestions(match);

      match = this.matchService.resource.update({
        where: {
          id: match.id,
        },
        data: {
          otherUid: userId,
          matchedAt: new Date().toISOString(),
        },
        include: {
          matchQuestions: true,
        },
      });

      res.status(201);
      res.json({
        value: match,
      });
    } catch (error) {
      next(error);
    }
  };

  private async generateMatchQuestions(match: Match): Promise<void> {
    // Get both users match exclusions and responded questions
    let combinedExclusions: MatchExclusion[] = await this.matchExclusionService.findMany({
      where: {
        uid: {
          equals: match.uid,
        },
      },
    });
    combinedExclusions = combinedExclusions.concat(
      await this.matchExclusionService.findMany({
        where: {
          uid: {
            equals: match.otherUid,
          },
        },
      }),
    );
    const combinedExcludedQuestions = combinedExclusions.map(exclusion => exclusion['questionId']);
    const user1Questions = (
      await this.responseService.findMany({
        where: {
          uid: {
            equals: match.uid,
          },
          questionId: {
            notIn: combinedExcludedQuestions,
          },
        },
        select: {
          questionId: true,
        },
        distinct: ['questionId'],
      })
    ).map(response => response['questionId']);
    const user2Questions = (
      await this.responseService.findMany({
        where: {
          uid: {
            equals: match.otherUid,
          },
          questionId: {
            in: user1Questions,
          },
        },
        select: {
          questionId: true,
        },
        distinct: ['questionId'],
      })
    ).map(response => response['questionId']);
    // Generate match questions
    for (const questionId of user2Questions) {
      await this.matchQuestionService.create({
        data: {
          matchID: match.id,
          questionId: questionId,
        },
      });
    }
  }
}

export default MatchController;
