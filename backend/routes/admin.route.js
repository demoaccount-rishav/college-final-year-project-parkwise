import { initializeAdminAuth, requireAdmin } from '../middlewares/adminAuth.js';
import { adminLogin, createFirstAdmin, adminLogout, getAdminProfile } from '../controllers/admin.controller.js';

import express from 'express';

const adminRouter = express.Router();

// Initialize admin auth middleware
initializeAdminAuth(adminRouter);

// Public routes
adminRouter.post('/create-new-admin', createFirstAdmin)
adminRouter.post('/login', adminLogin);
adminRouter.post('/logout',requireAdmin(), adminLogout);
adminRouter.get('/getAdminProfile', requireAdmin(), getAdminProfile)
export default adminRouter;