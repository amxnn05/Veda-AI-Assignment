import { Router } from "express";

import {
    createAssignment,
    getAssignments,
    getAssignmentById,
    deleteAssignment,
    regenerateAssignment
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

router.delete(
    "/:id",
    deleteAssignment
);

router.post(
    "/:id/regenerate",
    regenerateAssignment
);

export default router;
