import express from 'express';
import {
    createCycle,
    deleteCycle,
    updateCycleExitTime,
    updateCycleEntryTime,
    updateCycleZone,
    findAllCycle,
    cookie_based_view_user_cycle_details,
    cookie_based_pay_exit_single_user_cycle
} from '../controllers/cycle.controller.js';
import { initializeUserAuth, requireUser } from '../middlewares/userAuth.js';
import { requireAdmin } from '../middlewares/adminAuth.js';

const cycleRouter = express.Router();

initializeUserAuth(cycleRouter);

cycleRouter.post('/createcycle', requireAdmin(),createCycle);
cycleRouter.get('/findallcycle', requireAdmin(), findAllCycle);
cycleRouter.delete('/deletecycle/:cycleId', requireAdmin(), deleteCycle);
cycleRouter.put('/updatezone/:cycleid/:zoneid', requireAdmin(), updateCycleZone);
cycleRouter.put('/:cycleId/update-exit', requireAdmin(), updateCycleExitTime);

//routes for fetching single user details with cookie based authentication
cycleRouter.get('/cookie-based-view-user-cycle-details', requireUser(), cookie_based_view_user_cycle_details);
cycleRouter.put('/cookie-based-pay-exit-single-user-cycle', requireUser(), cookie_based_pay_exit_single_user_cycle);
cycleRouter.put('/cookie-based-update-entry', requireUser(), updateCycleEntryTime);

export default cycleRouter;