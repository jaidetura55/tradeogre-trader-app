import { Router } from "express";
import coinsRouter from "./coins.routes";
import ordersRouter from "./orders.routes";

const routes = Router();

routes.use('/api/v1', ordersRouter);
routes.use('/api/v1', coinsRouter);

export default routes;