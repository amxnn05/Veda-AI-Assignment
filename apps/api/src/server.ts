import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import assignmentRoutes from "./routes/assignment.routes";
import questionRoutes from "./routes/question.routes";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

connectDB();

app.use(
    "/api/assignments",
    assignmentRoutes
);
app.use(
    "/api/questions",
    questionRoutes
);

app.get(
    "/health",
    (_, res) => {
        res.json({
            success: true
        });
    }
);

app.use(
    (
        error: Error,
        _req: Request,
        res: Response,
        _next: NextFunction
    ) => {
        console.error("API Error:", error.message);

        res.status(400).json({
            success: false,
            message: error.message || "Request failed"
        });
    }
);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-assignment", (assignmentId) => {
        socket.join(assignmentId);
        console.log(`Socket ${socket.id} joined assignment ${assignmentId}`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

export { io };

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(
        `Server running on ${PORT}`
    );
});
