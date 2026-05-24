import { Router } from "express";

import {
    createAssignment,
    getAssignments,
    getAssignmentById
} from "../controllers/assignment.controller";

import { upload } from "../middleware/upload";

const router = Router();

router.post(
    "/",
    upload.single("file"),
    createAssignment
);

router.get(
    "/",
    getAssignments
);

router.get(
    "/:id",
    getAssignmentById
);

export default router;