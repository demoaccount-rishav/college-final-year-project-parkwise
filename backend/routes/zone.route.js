import express from 'express';
import { createZone, findZone, updateZone, getallzone, deletezone } from '../controllers/zone.controller.js';
import { requireAdmin, initializeAdminAuth } from '../middlewares/adminAuth.js';

const zoneRouter = express.Router();
initializeAdminAuth(zoneRouter);

zoneRouter.post('/createzone', requireAdmin(), createZone);
zoneRouter.get('/findzone', requireAdmin(), findZone);
zoneRouter.put('/updatezone/', requireAdmin(), updateZone);
zoneRouter.get('/getallzone', requireAdmin(), getallzone)
zoneRouter.delete('/deletezone/:id', requireAdmin(), deletezone);


export default zoneRouter;