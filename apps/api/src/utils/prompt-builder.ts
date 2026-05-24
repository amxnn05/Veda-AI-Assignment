export const buildPrompt = (
    subject: string,
    instructions: string,
    questionTypes?: any[],
    fileContent?: string
) => {
    const typesRequirement = questionTypes && questionTypes.length > 0
        ? `You MUST generate the following exact number and types of questions:
${questionTypes.map(qt => `- ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`).join('\n')}`
        : "Generate a balanced set of questions.";

    return `
Generate a structured question paper based on the following context.

Context:
Subject: ${subject}
Additional Instructions: ${instructions || "None"}
Extracted Content from uploaded document: ${fileContent || "None"}

Strict Requirements:
${typesRequirement}
- Each question must have the exact marks assigned as specified above.
- Group questions into appropriate sections based on their type (e.g., Section A for MCQs, Section B for Short Questions).
- For "Multiple Choice Questions", you MUST provide exactly 4 options in the "options" array.
- Generate clear instructions for each section.
- Add difficulty level (easy, medium, hard) for each question.
- Analyze topic focus and Bloom's taxonomy level.
- Estimate syllabus/topic coverage by percentage. The coverage percentages must add up to 100.
- Predict student difficulty insights from the generated paper:
  - high-risk topics students are likely to struggle with
  - expected mistakes or conceptual traps
  - prerequisite knowledge gaps
  - preparation recommendations
  - estimated overall student difficulty
- Don't make topics section-wise; distribute topics across the paper.

Return ONLY valid JSON.
DO NOT include markdown.
DO NOT include explanation.

Format:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Answer all Multiple Choice Questions",
      "questions": [
        {
          "question": "",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "Option 1",
          "difficulty": "easy",
          "marks": 1,
          "topic": "",
          "bloomsLevel": "remember"
        }
      ]
    }
  ],
  "analysis": {
    "mainFocus": "",
    "strongTopics": [],
    "weakTopics": [],
    "difficultyBreakdown": {
      "easy": 0,
      "medium": 0,
      "hard": 0
    },
    "bloomsTaxonomy": {
      "remember": 0,
      "understand": 0,
      "apply": 0,
      "analyze": 0
    },
    "syllabusCoverage": [
      {
        "topic": "Networking",
        "percentage": 78
      },
      {
        "topic": "Security",
        "percentage": 15
      },
      {
        "topic": "OS Concepts",
        "percentage": 7
      }
    ],
    "teacherSuggestion": "",
    "studentDifficultyInsights": {
      "highRiskTopics": [],
      "predictedChallenges": [],
      "prerequisiteGaps": [],
      "recommendedPreparation": [],
      "estimatedDifficulty": "Easy | Moderate | Moderate to Hard | Hard"
    }
  }
}
`;
}
