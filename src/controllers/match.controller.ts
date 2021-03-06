import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import { Match, MatchExclusion, Response as ResponseType } from '.prisma/client';
import redisClient from '@/services/redisClient';
import { isEmpty, randomString } from '@/utils/util';

import MatchExclusionService from '@/services/matchExclusion.service';
import MatchService from '@/services/match.service';
import MatchQuestionService from '@/services/matchQuestion.service';
import ResponseService from '@/services/response.service';
import UserService from '@/services/user.service';

class MatchController {
  private matchService = new MatchService();
  private matchExclusionService = new MatchExclusionService();
  private matchQuestionService = new MatchQuestionService();
  public responseService = new ResponseService();
  public userService = new UserService();

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
      const matchId: string = await redisClient.get(req.body.value.matchCode);
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
      if (match.uid == userId) {
        throw new HttpException(409, 'You cannot match with yourself');
      }
      await this.generateMatchQuestions(match, userId);

      match = await this.matchService.resource.update({
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
      redisClient.del([req.body.value.matchCode, matchId]);

      res.status(201);
      res.json({
        value: match,
      });
    } catch (error) {
      next(error);
    }
  };

  private async generateMatchQuestions(match: Match, otherUid: string): Promise<void> {
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
            equals: otherUid,
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
            equals: otherUid,
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
          matchId: match.id,
          questionId: questionId,
        },
      });
    }
  }

  public getMatchReport = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const matchId = Number(req.params.matchId);
      const match: Match = await this.matchService.findFirstOptional({
        where: {
          id: matchId,
        },
        include: {
          matchQuestions: true,
        },
      });
      if (!match) {
        throw new HttpException(404, 'Match id not found');
      }
      if (userId != match.uid && userId != match.otherUid) {
        throw new HttpException(403, 'Unauthorized');
      }
      const matchReport = await this.generateMatchReport(match);

      res.status(200);
      res.json({
        value: {
          matchReport: matchReport,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private async generateMatchReport(match: Match): Promise<object> {
    const matchReport = {
      matchPercentage: '0',
      sameResponses: [],
      differentResponses1: [],
      differentResponses2: [],
      user: await this.userService.getUserObject(match.uid),
      otherUser: await this.userService.getUserObject(match.otherUid),
    };
    const matchQuestions: number[] = match['matchQuestions'].map(matchQuestion => matchQuestion.questionId);
    if (isEmpty(matchQuestions)) {
      return matchReport;
    }
    const user1Responses = {};
    (
      await this.responseService.findMany({
        where: {
          uid: {
            equals: match.uid,
          },
          questionId: {
            in: matchQuestions,
          },
        },
        orderBy: {
          questionId: 'asc',
        },
      })
    ).forEach((response: ResponseType) => {
      if (response.questionId in user1Responses) {
        user1Responses[response.questionId].push(response);
      } else {
        user1Responses[response.questionId] = [response];
      }
    });
    const user2Responses = {};
    (
      await this.responseService.findMany({
        where: {
          uid: {
            equals: match.otherUid,
          },
          questionId: {
            in: matchQuestions,
          },
        },
        orderBy: {
          questionId: 'asc',
        },
      })
    ).forEach((response: ResponseType) => {
      if (response.questionId in user2Responses) {
        user2Responses[response.questionId].push(response);
      } else {
        user2Responses[response.questionId] = [response];
      }
    });
    let similarQuestions = 0;
    for (const questionId of matchQuestions) {
      const user1Response = user1Responses[questionId];
      const user2Response = user2Responses[questionId];
      let isSimilar = true;
      if (user1Response.length == user2Response.length) {
        for (let i = 0; i < user1Response.length; i++) {
          if (user1Response[i].optionId != user2Response[i].optionId) {
            isSimilar = false;
          }
        }
      } else {
        isSimilar = false;
      }
      if (isSimilar) {
        similarQuestions++;
        matchReport.sameResponses.push(user1Response);
      } else {
        matchReport.differentResponses1.push(user1Response);
        matchReport.differentResponses2.push(user2Response);
      }
    }
    matchReport.matchPercentage = ((similarQuestions / matchQuestions.length) * 100).toFixed(2);
    return matchReport;
  }

  public getMatchHistory = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const matches = (
        await this.matchService.findMany({
          where: {
            OR: [
              {
                uid: {
                  equals: userId,
                },
              },
              {
                otherUid: {
                  equals: userId,
                },
              },
            ],
          },
        })
      ).filter((match: Match) => match.uid != null && match.otherUid != null);

      const resolveMatchUsers = async (match: Match) => {
        const [user, otherUser] = await Promise.all([this.userService.getUserObject(match.uid), this.userService.getUserObject(match.otherUid)]);
        return {
          ...match,
          user: user,
          otherUser: otherUser,
        };
      };
      const resolvedMatches = await Promise.all(matches.map(resolveMatchUsers));

      res.status(200);
      res.json({
        value: {
          matches: resolvedMatches,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteMatch = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const matchId = Number(req.params.matchId);
      const match: Match = await this.matchService.findFirstOptional({
        where: {
          id: matchId,
        },
        include: {
          matchQuestions: true,
        },
      });
      if (!match) {
        throw new HttpException(404, 'Match id not found');
      }
      if (userId != match.uid && userId != match.otherUid) {
        throw new HttpException(403, 'Unauthorized');
      }
      await this.matchService.delete(matchId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}

export default MatchController;
