import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true
        },
        instructions: {
            type: String
        },
        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "completed",
                "failed"
            ],
            default: "pending"
        },
        dueDate: {
            type: Date
        },
        generatedPaper: {
            type: Object
        },
        fileContent: {
            type: String
        },
        fileType: {
            type: String
        },
        schoolName: {
            type: String
        },
        className: {
            type: String
        },
        location: {
            type: String
        },
        questionTypes: [
            {
                type: { type: String },
                count: { type: Number },
                marks: { type: Number }
            }
        ],
        totalQuestions: {
            type: Number
        },
        totalMarks: {
            type: Number
        },

    },
    {
        timestamps: true
    }

);
export const Assignment = mongoose.model("assignment", assignmentSchema);