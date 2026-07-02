import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import userRouter from "./user";
import licencesRouter from "./licences";
import vehiclesRouter from "./vehicles";
import partsRouter from "./parts";
import mechanicRouter from "./mechanic";
import gpsRouter from "./gps";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(userRouter);
router.use(licencesRouter);
router.use(vehiclesRouter);
router.use(partsRouter);
router.use(mechanicRouter);
router.use(gpsRouter);

export default router;
