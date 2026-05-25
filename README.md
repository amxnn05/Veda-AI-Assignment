# VedaAI Assignment Generator Showcase

## Quick Navigation

- [Local Development Guide](#local-development-guide)

> **Note:** I am using the free open-source model Llama 3.3 70B Versatile through the Groq API free tier, so the responses may have lower performance. This is mainly a model limitation. Larger models can perform exceptionally well. 

> Please Go through with this showcase video to have an idea about how i looked the project and how i contributed to it.



## Workflow

1. Teacher creates a new assignment.
2. Teacher enters school, class, subject, due date, paper duration, and question type requirements.
3. Teacher may upload a PDF or image as source material.
4. Server extracts text from the uploaded file.
5. AI generates a class-appropriate paper using the extracted content and teacher instructions.
6. Teacher is taken directly to the generated assignment page.
7. While generation is running, the page shows a smooth generation state.
8. Once ready, the full question paper appears with export and analysis tools.

## Extra features that i have impelemented

I have added :

- **Per Questions regeneration**
- **Adaptive regeneration**
- **Class-level generation control**
- **Upload-based source extraction**
- **Syllabus balance insight**
- **Student weakness prediction**
- **Clean printable PDF export**
- **Smooth teacher-focused UX**

## Per-Question Regeneration Feature
The Per-Question Regeneration feature allows teachers to regenerate a single question from an already generated assessment without recreating the entire question paper.

This improves:

Flexibility
AI control
User experience
Paper customization

Instead of regenerating the full paper, only the selected question is replaced while preserving:

Section structure
Marks distribution
Difficulty balance
Overall paper format
## Adaptive Regeneration
  
  The analysis popup includes actions that allow the teacher to regenerate the paper intelligently.
  
  ### Reduce Student Difficulty
  
  This action asks AI to:
  
  - Simplify high-risk topics
  - Reduce analytical load
  - Add more conceptual scaffolding
  - Keep marks and question structure aligned
  
  ### Increase Analytical Depth
  
  This action asks AI to:
  
  - Add more reasoning-based questions
  - Increase application and analysis depth
  - Preserve the original marks and question distribution
  
  This creates an adaptive paper generation loop:

# API Reference
Base URL: `/api`

## Assignments

### Create Assignment
`POST /assignments`
- **Body**: `multipart/form-data`
- **Fields**:
    - `subject`, `className`, `schoolName`, `instructions`, `dueDate`, `maxTime`, `timeUnit`.
    - `questionRequirements` (JSON string).
    - `file` (Optional, PDF/Image).
- **Response**: The created assignment object with `status: pending`.

### List Assignments
`GET /assignments`
- **Response**: Array of all assignments.

### Get Assignment Details
`GET /assignments/:id`
- **Response**: Detailed assignment object including the `generatedPaper` if completed.

### Delete Assignment
`DELETE /assignments/:id`
- **Response**: Success message.

### Regenerate Assignment
`POST /assignments/:id/regenerate`
- **Body**: `{ action: 'reduce_difficulty' | 'increase_depth' }`
- **Response**: Updated assignment with a new job queued for regeneration.



## Assignment Creation Features

### Basic Details

- School name
- Class or grade
- Subject
- Due date
- Maximum paper time
- Time unit selection:
  - Minutes
  - Hours

### Question Type Configuration

Teachers can define exact paper structure by selecting:

- Question type
- Number of questions
- Marks per question

Supported question types include:

- Multiple Choice Questions
- Short Questions
- Long Questions
- Diagram or Graph-Based Questions
- Numerical Problems
- True or False

The system automatically calculates:

- Total questions
- Total marks

## Upload and Extraction

Teachers can upload source files to guide question generation.

Supported upload types:

- PDF
- JPEG
- PNG
- WEBP

Upload behavior:

- Drag-and-drop support
- Browse file support
- 10MB file size limit
- Client-side validation
- Server-side validation
- File summary after upload
- Text extraction before AI generation

Server extraction:

- PDF text extraction uses `pdf-parse`
- Image text extraction uses OCR through `tesseract.js`

Extracted content is saved with the assignment and included in the AI prompt.

## AI Generation Rules

The AI prompt receives:

- Subject
- Class or grade
- Teacher instructions
- Maximum paper time
- Question type requirements
- Uploaded document text

The AI is instructed to:

- Generate questions only for the specified class level.
- Match wording and concept depth to the class.
- Keep difficulty appropriate to the grade.
- Follow exact question counts and marks.
- Use uploaded content as source material.
- Provide section-wise structured output.
- Include options for MCQs.
- Include topic metadata for analysis.

## Generated Paper Output

The generated paper includes:

- School name
- Subject
- Class
- Time allowed
- Maximum marks
- General instructions
- Optional specific teacher instructions
- Student information fields
- Section-wise questions
- Difficulty labels
- Marks per question
- MCQ options where applicable

The output is styled like a printable exam paper and can be exported as PDF.

## PDF Export

The export system generates a PDF from the rendered paper.

Important behavior:

- Uses `html2canvas` and `jsPDF`
- Keeps each question together on one page
- Prevents questions from splitting across pages
- Moves oversized question blocks to the next page
- Excludes UI-only controls from the PDF

This makes the exported paper cleaner and more suitable for classroom use.

## AI Analysis Features

### Syllabus Coverage Meter

The system estimates how much of the paper focuses on each topic.

Example:

```json
{
  "syllabusCoverage": [
    {
      "topic": "OOPS",
      "percentage": 78
    },
    {
      "topic": "React",
      "percentage": 15
    },
    {
      "topic": "OS Concepts",
      "percentage": 7
    }
  ]
}
```

benefit:

- Quickly detects imbalance.
- Helps verify topic distribution.
- Makes the paper feel more professionally reviewed.

### AI Exam Weakness Predictor

The system predicts areas where students may struggle.

It analyzes:

- High-risk topics
- Expected student mistakes
- Prerequisite knowledge gaps
- Recommended preparation
- Estimated difficulty

Example:

```json
{
  "studentDifficultyInsights": {
    "highRiskTopics": [
      "Subnetting",
      "Routing Algorithms"
    ],
    "predictedChallenges": [
      "Students may confuse TCP and UDP use cases",
      "OSI layer mapping questions may be difficult"
    ],
    "prerequisiteGaps": [
      "Binary number conversion",
      "Basic protocol mapping"
    ],
    "recommendedPreparation": [
      "Revise IP addressing",
      "Practice routing diagrams"
    ],
    "estimatedDifficulty": "Moderate to Hard"
  }
}
```

benefit:

- Gives insight before students attempt the paper.
- Helps identify likely weak areas.
- Converts the system from paper generation into educational intelligence.


```text
Teacher Intent
      ↓
AI Difficulty Analysis
      ↓
AI Curriculum Balancing
      ↓
Dynamic Regeneration
```

## User Experience Highlights

### Navigation

After creating an assignment, the app automatically opens the new assignment page instead of returning to the full list.

This gives the user a direct flow:

```text
Create Assignment → Generating State → Generated Paper
```

### Dark Mode

The app includes:

- Dark/light mode toggle
- Persistent theme using local storage
- Theme-aware sidebar
- Theme-aware header
- Theme-aware cards, popups, and forms



## Technical Stack

### Frontend

- Next.js
- React
- CSS Modules
- Zustand
- Lucide icons
- `html2canvas`
- `jsPDF`

### Backend

- Express
- MongoDB with Mongoose
- BullMQ worker queue
- Redis
- OpenAI-compatible Groq API
- `pdf-parse`
- `tesseract.js`

## Data Model Highlights

Assignments store:

- Subject
- Instructions
- Class name
- School name
- Due date
- Maximum time
- Question type requirements
- Total questions
- Total marks
- Uploaded file metadata
- Extracted file text
- Generated paper
- Generation status

## Status Lifecycle

Assignment generation uses status states:

- `pending`
- `processing`
- `completed`
- `failed`

The assignment output page polls until the paper is ready.

## Local Development Guide

### Prerequisites

Install these before running the project locally:

- **Node.js 18+**
- **npm 10+**
- **MongoDB**
- **Redis**
- **Groq API key**

This project is a Turborepo monorepo with:

- `apps/web` - Next.js frontend
- `apps/api` - Express API server
- `packages/ui` - shared UI package
- `packages/eslint-config` - shared ESLint config
- `packages/typescript-config` - shared TypeScript config

### 1. Clone the Repository

```bash
git clone https://github.com/amxnn05/Veda-AI-Assignment.git
cd Veda-AI-Assignment
```

### 2. Install Dependencies

Install all workspace dependencies from the root folder:

```bash
npm install
```

### 3. Environment Variables

#### API Environment

Create an `.env` file inside `apps/api`:

```bash
touch apps/api/.env
```

Add the following:

```env
PORT=5000
MONGO_URL=your_mongo_url
REDIS_URL=your_redis_url
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:3000
```

#### Redis TLS Note

The current Redis config in `apps/api/src/config/redis.ts` enables TLS:

```ts
tls: {}
```

Because of this, the easiest setup is to use a TLS-enabled Redis provider such as Upstash and put its Redis URL in `REDIS_URL`.

If you want to use a normal local Redis server instead, update `apps/api/src/config/redis.ts` to only enable TLS for `rediss://` URLs:

```ts
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL!;

export const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  ...(redisUrl.startsWith("rediss://") ? { tls: {} } : {}),
});
```

Then you can use:

```env
REDIS_URL=redis://127.0.0.1:6379
```

#### Web Environment

Create an `.env.local` file inside `apps/web`:

```bash
touch apps/web/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The frontend uses this URL for REST API requests and Socket.IO connections.


### 4. Run the Project Locally

This project requires three development processes:

- Frontend web app
- API server
- Background generation worker

#### Terminal 1: Start Web and API

From the root directory:

```bash
npm run dev
```

This starts:

- Web app at `http://localhost:3000`
- API server at `http://localhost:5000`

#### Terminal 2: Start the Worker

The worker processes queued assignment generation jobs.

```bash
npm run worker -w apps/api
```

Without the worker, assignments may be created but AI generation will not complete.

### 5. Open the App

Visit:

```txt
http://localhost:3000
```

API health check:

```txt
http://localhost:5000/health
```

Expected health response:

```json
{
  "success": true
}
```

### 6. Available Scripts

#### Root Scripts

Run these from the repository root.

```bash
npm run dev
```

Starts all development servers managed by Turborepo.

```bash
npm run build
```

Builds all apps and packages.

```bash
npm run lint
```

Runs linting across the monorepo.

```bash
npm run check-types
```

Runs TypeScript checks across the monorepo.

```bash
npm run format
```

Formats TypeScript, TSX, and Markdown files with Prettier.

#### API Scripts

```bash
npm run dev -w apps/api
```

Starts the Express API server in watch mode.

```bash
npm run worker -w apps/api
```

Starts the BullMQ background worker.

```bash
npm run build -w apps/api
```

Compiles the API TypeScript project.

```bash
npm run start -w apps/api
```

Starts the API server using `tsx`.

#### Web Scripts

```bash
npm run dev -w apps/web
```

Starts the Next.js frontend on port `3000`.

```bash
npm run build -w apps/web
```

Builds the Next.js app.

```bash
npm run start -w apps/web
```

Starts the production Next.js server after building.

```bash
npm run lint -w apps/web
```

Runs ESLint for the web app.

```bash
npm run check-types -w apps/web
```

Runs Next.js type generation and TypeScript checks.

### 7. Local Development Flow

1. Start MongoDB.
2. Start Redis or use a hosted Redis URL.
3. Add environment variables.
4. Run the web and API servers:

```bash
npm run dev
```

5. In another terminal, run the worker:

```bash
npm run worker -w apps/api
```

6. Open:

```txt
http://localhost:3000
```

7. Create an assignment from the UI.
8. The API stores the assignment in MongoDB.
9. A generation job is added to Redis through BullMQ.
10. The worker processes the job and calls the Groq API.
11. The generated assignment is saved back to MongoDB.
12. The frontend receives updates through Socket.IO.

### 8. API Endpoints

Base API URL:

```txt
http://localhost:5000/api
```

#### Assignments

Create assignment:

```txt
POST /api/assignments
```

List assignments:

```txt
GET /api/assignments
```

Get assignment by ID:

```txt
GET /api/assignments/:id
```

Delete assignment:

```txt
DELETE /api/assignments/:id
```

Regenerate assignment:

```txt
POST /api/assignments/:id/regenerate
```

#### Questions

Regenerate individual question:

```txt
POST /api/questions/regenerate
```

### 9. Troubleshooting

#### API fails with MongoDB connection error

Check that MongoDB is running and that `MONGO_URL` is correct.

For local MongoDB:

```env
MONGO_URL=mongodb://127.0.0.1:27017/veda-ai
```

#### Assignment stays pending or processing

Make sure the worker is running:

```bash
npm run worker -w apps/api
```

The API can create jobs, but the worker is required to process them.

#### Redis connection fails

Check your `REDIS_URL`.

For hosted TLS Redis, use the provider URL.

For local Redis, either use a Redis server with TLS or update `apps/api/src/config/redis.ts` so TLS is only enabled for `rediss://` URLs.

#### AI generation fails

Check that `GROQ_API_KEY` is present in `apps/api/.env`.

```env
GROQ_API_KEY=your_groq_api_key
```

Also check the API and worker terminal logs for Groq API errors.

#### Frontend cannot connect to API

Make sure `apps/web/.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Also confirm the API server is running:

```txt
http://localhost:5000/health
```

#### CORS error

Make sure `CLIENT_URL` in `apps/api/.env` matches the frontend URL:

```env
CLIENT_URL=http://localhost:3000
```

### 10. Production Build Check

Before deploying or opening a pull request, run:

```bash
npm run lint
npm run check-types
npm run build
```

These commands verify linting, TypeScript correctness, and production builds across the monorepo.

