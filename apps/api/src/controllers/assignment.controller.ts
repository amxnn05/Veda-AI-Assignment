import type {
    Request,
    Response
} from "express";

import { Assignment } from "../models/Assignment";

import { generationQueue } from "../queues/generation.queue";

import { extractPdfText } from "../utils/extract-pdf";
import { extractImageText } from "../utils/extract-image";

export const createAssignment =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            let fileContent = "";
            let fileType = "";

            if (req.file) {
                fileType = req.file.mimetype;
                if (fileType === "application/pdf") {
                    fileContent = await extractPdfText(req.file.buffer);
                } else if (fileType.startsWith("image/")) {
                    fileContent = await extractImageText(req.file.buffer);
                }
            }

            const body = { ...req.body };
            if (typeof body.questionTypes === 'string') {
                try {
                    body.questionTypes = JSON.parse(body.questionTypes);
                } catch (e) {
                    console.error("Failed to parse questionTypes:", e);
                }
            }
            
            if (body.dueDate === '') {
                delete body.dueDate;
            }

            // Calculate totals
            if (Array.isArray(body.questionTypes)) {
                body.totalQuestions = body.questionTypes.reduce((acc: number, qt: any) => acc + (qt.count || 0), 0);
                body.totalMarks = body.questionTypes.reduce((acc: number, qt: any) => acc + ((qt.count || 0) * (qt.marks || 0)), 0);
            }

            const assignment =
                await Assignment.create({
                    ...body,
                    fileContent,
                    fileType
                });

            await generationQueue.add(
                "generate-paper",
                {
                    assignmentId:
                        assignment._id
                }
            );

            res.status(201).json({
                success: true,
                assignment
            });
        } catch (error) {
            console.error("Create Assignment Error:", error);
            res.status(500).json({
                success: false,
                error
            });
        }
    };

export const getAssignments =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const assignments = await Assignment.find().sort({ createdAt: -1 });
            res.json({
                success: true,
                assignments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error
            });
        }
    };

export const getAssignmentById =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const assignment = await Assignment.findById(req.params.id);
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: "Assignment not found"
                });
            }
            res.json({
                success: true,
                assignment
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error
            });
        }
    };

export const deleteAssignment =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const assignment = await Assignment.findByIdAndDelete(req.params.id);
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: "Assignment not found"
                });
            }
            res.json({
                success: true,
                message: "Assignment deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error
            });
        }
    };

export const regenerateAssignment =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const { instructions } = req.body;
            const assignment = await Assignment.findById(req.params.id);
            
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: "Assignment not found"
                });
            }

            if (instructions) {
                assignment.instructions = instructions;
            }

            // Reset status and paper
            assignment.status = "processing";
            assignment.generatedPaper = undefined;
            await assignment.save();

            await generationQueue.add(
                "generate-paper",
                {
                    assignmentId:
                        assignment._id
                }
            );

            res.json({
                success: true,
                message: "Regeneration started",
                assignment
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error
            });
        }
    };
