
import { Router } from "express";

import {
    regenerateQuestion
} from "../controllers/question.controller";

const router = Router();

router.post(
    "/regenerate",
    regenerateQuestion
);

export default router;