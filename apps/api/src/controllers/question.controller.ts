import type {
    Request,
    Response
} from "express";

import { Assignment } from "../models/Assignment";

import { generatePaper } from "../services/ai.service";

import { v4 as uuid } from "uuid";

export const regenerateQuestion =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                assignmentId,
                questionId
            } = req.body;

            const assignment =
                await Assignment.findById(
                    assignmentId
                );

            if (!assignment) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Assignment not found"
                    });
            }

            let targetQuestion =
                null;

            let targetSection =
                null;

            for (const section of assignment.generatedPaper
                .sections) {
                const found =
                    section.questions.find(
                        (q: any) =>
                            q.id ===
                            questionId
                    );

                if (found) {
                    targetQuestion =
                        found;

                    targetSection =
                        section;

                    break;
                }
            }

            if (!targetQuestion) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Question not found"
                    });
            }

            const prompt = `
Generate ONE new question.

Return ONLY valid JSON.

Difficulty:
${targetQuestion.difficulty}

Marks:
${targetQuestion.marks}

Subject:
${assignment.subject}

Format:

{
  "question": "",
  "difficulty": "easy",
  "marks": 2
}
`;

            const response =
                await generatePaper(
                    prompt
                );

            const cleaned =
                response
                    .replace(
                        /```json/g,
                        ""
                    )
                    .replace(
                        /```/g,
                        ""
                    )
                    .trim();

            const parsed =
                JSON.parse(cleaned);



            const updatedQuestion = {
                id: uuid(),

                question:
                    parsed.question,

                difficulty:
                    parsed.difficulty,

                marks: parsed.marks
            };



            targetSection.questions =
                targetSection.questions.map(
                    (q: any) =>
                        q.id === questionId
                            ? updatedQuestion
                            : q
                );
            assignment.markModified(
                "generatedPaper"
            );

            await assignment.save();

            res.json({
                success: true,

                question:
                    updatedQuestion
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                error
            });
        }
    };
