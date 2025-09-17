import { Router } from 'express';
import * as userController from '../controllers/user.controller';

export const userRouter = Router();

userRouter.post('/', userController.createUser);
userRouter.get('/', userController.listUsers);
userRouter.get('/:id', userController.getUser);
userRouter.put('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);