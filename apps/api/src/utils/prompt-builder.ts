export const buildPrompt = (
    subject: string,
    instructions: string,
    fileContent?: string
) => `
Generate a structured question paper based on the following context.

Context:
Subject: ${subject}
Additional Instructions: ${instructions || "None"}
Extracted Content from uploaded document: ${fileContent || "None"}

Requirements:
- Generate sections
- Generate questions
- Add difficulty
- Add marks
- Analyze topic focus
- Analyze weak coverage
- Analyze Bloom taxonomy

Return ONLY valid JSON.
DO NOT include markdown.
DO NOT include explanation.

Format:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "",
      "questions": [
        {
          "question": "",
          "difficulty": "easy",
          "marks": 2,
          "topic": "",
          "bloomsLevel": ""
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
    "teacherSuggestion": ""
  }
}
`;