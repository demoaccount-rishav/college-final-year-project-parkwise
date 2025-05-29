import express from 'express';

import { create_RFID_card } from '../controllers/rfidCard.controller.js';
import { cookie_based_pay_exit_single_user_cycle } from '../controllers/cycle.controller.js';
import { card_id_to_phoneNumber_and_cycleId } from '../middlewares/rfidCard.js';

// import { card_id_to_phoneNumber_and_cycleId } from '../middlewares/rfidCard';

const rfidRouter = express.Router();

rfidRouter.post('/create-rfid-card', create_RFID_card);

// RFID based touch and pay
rfidRouter.post('/rfid-based-payment', card_id_to_phoneNumber_and_cycleId, cookie_based_pay_exit_single_user_cycle);

export default rfidRouter;