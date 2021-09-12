import { Request } from 'express';
import { User } from '@firebase/auth-types';

export interface RequestWithUser extends Request {
  user: User;
}
