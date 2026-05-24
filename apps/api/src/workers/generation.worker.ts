import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { Assignment } from "../models/Assignment.js";
import { connectDB } from "../config/db.js";
import { generatePaper } from "../services/ai.service.js";
import { buildPrompt } from "../utils/prompt-builder.js";
import { v4 as uuid } from "uuid";

connectDB();

console.log("Worker Started");

new Worker(
    "generation",

    async (job) => {
        console.log(
            "Processing:",
            job.data
        );

        try {
            const assignment =
                await Assignment.findById(
                    job.data.assignmentId
                );

            if (!assignment) {
                throw new Error(
                    "Assignment not found"
                );
            }

            assignment.status =
                "processing";

            await assignment.save();


            const prompt =
                buildPrompt(
                    assignment.subject || "",
                    assignment.instructions || "",
                    assignment.questionTypes,
                    assignment.fileContent || undefined,
                    assignment.maxTime || undefined
                );


            const response =
                await generatePaper(
                    prompt
                );

            if (!response) {
                throw new Error(
                    "Empty AI response"
                );
            }


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

            let parsed;

            try {
                parsed =
                    JSON.parse(cleaned);
            } catch (error) {
                throw new Error(
                    "Invalid JSON from AI"
                );
            }

            if (
                !parsed.sections
            ) {
                throw new Error(
                    "Missing sections in AI response"
                );
            }
            parsed.sections =
                parsed.sections.map(
                    (section: any) => ({
                        ...section,

                        questions:
                            section.questions.map(
                                (q: any) => ({
                                    id: uuid(),

                                    ...q
                                })
                            )
                    })
                );

            assignment.generatedPaper =
                parsed;

            assignment.status =
                "completed";

            await assignment.save();

            console.log(
                "Completed"
            );
        } catch (error: any) {
            console.error(
                "Worker Error:",
                error.message
            );

            await Assignment.findByIdAndUpdate(
                job.data.assignmentId,
                {
                    status: "failed"
                }
            );
        }
    },

    {
        connection: redis
    }
);
