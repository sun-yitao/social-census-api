const admin = require('../firebase/firebase-config');

class UserService {
  public async getUserObject(uid: string): Promise<object> {
    const user = await admin.auth().getUser(uid);
    return {
      uid: user.uid,
      email: user.email,
      username: user.username,
      photoId: user.photoId,
    };
  }
}

export default UserService;
