import prismaClient from '@/prisma/client';

const admin = require('../firebase/firebase-config');

class UserService {
  public async getUserObject(uid: string): Promise<object> {
    const user = await admin.auth().getUser(uid);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  public async deleteUser(uid: string): Promise<void> {
    const obtainUserClause = {
      where: {
        uid: uid,
      },
    };

    await Promise.all([
      prismaClient.response.deleteMany(obtainUserClause),
      prismaClient.comment.deleteMany(obtainUserClause),
      prismaClient.like.deleteMany(obtainUserClause),
      prismaClient.matchExclusion.deleteMany(obtainUserClause),
      prismaClient.match.deleteMany({
        where: {
          OR: [
            {
              uid: uid,
            },
            {
              otherUid: uid,
            },
          ],
        },
      }),
    ]);
  }
}

export default UserService;
