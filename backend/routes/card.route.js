import express from 'express';
import { createCard, getAllCards, getCardByPhoneNumber, deleteCard, creditAmount, debitAmount, cookie_based_view_card_details, cookie_based_add_card_balance } from '../controllers/card.controller.js';
import { requireUser, initializeUserAuth } from '../middlewares/userAuth.js';
import { requireAdmin } from '../middlewares/adminAuth.js';

const cardRouter = express.Router();
initializeUserAuth(cardRouter);
cardRouter.post('/createcard', requireAdmin(), createCard);
cardRouter.get("/getallcard", requireAdmin(), getAllCards);
cardRouter.get("/find/:phoneNumber", requireAdmin(), getCardByPhoneNumber);
cardRouter.delete("/delete/:phoneNumber", requireAdmin(), deleteCard);
cardRouter.post("/credit/:phoneNumber", requireAdmin(), creditAmount);
cardRouter.post("/debit/:phoneNumber", requireAdmin(), debitAmount);

//routes for fetching single user details with cookie based authentication

cardRouter.get('/cookie-based-view-card-details', requireUser(), cookie_based_view_card_details);
cardRouter.post('/cookie-based-add-card-balance', requireUser(), cookie_based_add_card_balance);

export default cardRouter;