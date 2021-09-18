import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import UserService from '@/services/user.service';

class UserController {
  public userService = new UserService();

  public deleteAccount = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      this.userService.deleteUser(userId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
