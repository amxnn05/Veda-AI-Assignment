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

            const isMCQ = 
                (targetSection.instruction && targetSection.instruction.toLowerCase().includes("multiple choice")) || 
                (targetSection.title && targetSection.title.toLowerCase().includes("multiple choice")) ||
                (targetQuestion.options && targetQuestion.options.length > 0);

            const prompt = `
Generate ONE new question based on the following section context:
Section: ${targetSection.title}
Instruction: ${targetSection.instruction}

Return ONLY valid JSON.

Difficulty: ${targetQuestion.difficulty}
Marks: ${targetQuestion.marks}
Subject: ${assignment.subject}
${isMCQ ? "This is a Multiple Choice Question. You MUST provide exactly 4 options in an 'options' array." : ""}

Format:
{
  "question": "",
  "difficulty": "${targetQuestion.difficulty}",
  "marks": ${targetQuestion.marks}${isMCQ ? ',\n  "options": ["", "", "", ""],\n  "answer": ""' : ""}
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
                question: parsed.question,
                difficulty: parsed.difficulty || targetQuestion.difficulty,
                marks: parsed.marks || targetQuestion.marks,
                ...(parsed.options ? { options: parsed.options } : {}),
                ...(parsed.answer ? { answer: parsed.answer } : {})
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
