import express from 'express';
import {
    createUser,
    deleteUser,
    getalluser,
    cookie_based_create_user,
    cookie_based_user_login,
    cookie_based_user_details,
    cookie_based_user_logout
} from '../controllers/user.controller.js';

import { requireAdmin, initializeAdminAuth } from '../middlewares/adminAuth.js';
import { requireUser } from '../middlewares/userAuth.js';
import { validateUserInput } from '../middlewares/validateUserInput.js';

const userRouter = express.Router();

initializeAdminAuth(userRouter);

userRouter.post('/createuser', requireAdmin(), validateUserInput, createUser);
userRouter.delete('/deleteuser/:userPhone', requireAdmin(), deleteUser);
userRouter.get('/getalluser', requireAdmin(), getalluser)

//routes for fetching single user details with cookie based authentication
userRouter.post('/cookie-based-create-user', validateUserInput, cookie_based_create_user);
userRouter.post('/cookie-based-login-user', cookie_based_user_login);
userRouter.get('/cookie-based-view-user', requireUser(), cookie_based_user_details);
userRouter.post('/cookie-based-logout-user', requireUser(), cookie_based_user_logout);

export default userRouter;