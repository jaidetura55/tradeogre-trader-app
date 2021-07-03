import { Router } from "express";
import CoinMovementsController from "../controllers/CoinMovementsController";

const coinsRouter = Router();
const coinMovementsController = new CoinMovementsController();

coinsRouter.get('/coins/movement', coinMovementsController.get);

export default coinsRouter;