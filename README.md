# VedaAI Assignment Generator Showcase

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



