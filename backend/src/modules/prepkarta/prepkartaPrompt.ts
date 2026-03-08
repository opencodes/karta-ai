type DifficultyLevel = "Exam Only" | "Interview Ready" | "FAANG Level";

interface PromptHistoryItem {
  question: string;
  answer: string;
}

interface PromptParams {
  subject: string;
  chapter: string;
  subchapter: string;
  ask?: string;
  history?: PromptHistoryItem[];
  difficulty?: DifficultyLevel;
}

export function buildSubchapterPrompt({
  subject,
  chapter,
  subchapter,
  ask,
  history = [],
  difficulty = "FAANG Level",
}: PromptParams): string {
  const isFollowUp = history.length > 0;

  const lines: string[] = [
    "You are a senior software engineering interviewer and academic tutor creating content for an exam and interview preparation platform.",
    "",
    "Generate a structured, concise, and high-signal study guide.",
    "Avoid long paragraphs. Prefer crisp bullets and practical insights.",
    "",
    `Subject: ${subject}`,
    `Chapter: ${chapter}`,
    `Subchapter: ${subchapter}`,
    "",
    `Mode: ${isFollowUp ? "FOLLOW-UP" : "SUMMARY"}`,
    isFollowUp
      ? "Instruction: Use prior Q/A context, avoid repetition, and add only new insights or deeper explanation."
      : "Instruction: Provide a complete first-pass summary for revision.",
    "",
    "Target Audience:",
    "- Exam preparation students",
    "- Software engineering interview candidates",
    "",
    `Difficulty Level: ${difficulty}`,
    "",
    "Required Output Structure:",
    "",
    "1. Overview (2–3 lines summary)",
    "",
    "2. Key Concepts",
    "- Bullet list",
    "- Focus on architecture, design decisions, and purpose",
    "- Avoid generic definitions",
    "",
    "3. Architecture & Flow (if applicable)",
    "- Step-by-step flow",
    "- Component interactions",
    "- Mention real-world technologies where relevant",
    "",
    "4. Important Facts / Formulas",
    "- Only include high-value facts",
    "- Include performance rules, tradeoffs, constraints",
    "",
    "5. Common Mistakes",
    "- Interview traps",
    "- Design pitfalls",
    "- Wrong assumptions candidates make",
    "",
    "6. Interview Deep-Dive Prompts",
    "- 3–5 discussion questions interviewers may ask",
    "- Focus on tradeoffs, scaling, bottlenecks",
    "",
    "7. Quick Revision Checklist",
    "- Actionable checklist format",
    "",
    "8. Practice Questions",
    "- 5 interview-style questions",
    "- Include concise answers",
    "",
    "9. Interview Readiness Verdict",
    "- Is this enough for product-based companies?",
    "- If not, what extra preparation is needed?",
    "",
    ask
      ? `User Request: ${ask}`
      : "User Request: Provide a complete study guide for quick revision.",
    "",
    "Style Rules:",
    "- Concise but high-density",
    "- No long paragraphs",
    "- Use structured bullets",
    "- Prioritize real-world system design thinking",
    "- Avoid textbook theory unless necessary",
  ];

  if (isFollowUp) {
    lines.push("", "Previous Q/A Context:");
    history.forEach((item, i) => {
      lines.push(`Q${i + 1}: ${item.question}`);
      lines.push(`A${i + 1}: ${item.answer}`);
    });
  }

  return lines.join("\n").trim();
}

export function buildSubchapterMcqPrompt(params: {
  subject: string;
  chapter: string;
  subchapter: string;
  count?: number;
}): string {
  const count = Math.min(5, Math.max(1, params.count ?? 5));

  return `
You are an expert interview-prep question setter and assessment designer.

Your task is to generate high-quality multiple choice questions strictly in VALID JSON format.

TOPIC CONTEXT
Subject: ${params.subject}
Chapter: ${params.chapter}
Subchapter: ${params.subchapter}

MCQ REQUIREMENTS
- Generate exactly ${count} MCQs.
- Difficulty must be balanced across easy, medium, and hard.
- Questions must test conceptual understanding, not trivial facts.
- Avoid ambiguous wording.
- Avoid duplicate or similar questions.
- Use realistic problem scenarios where applicable.
- Options must be plausible and non-overlapping.
- Randomize correct option positions.
- Provide concise but clear explanations.

STRICT OUTPUT RULES
- Output ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include comments.
- Do NOT include extra text before or after JSON.
- Ensure JSON is parseable with standard JSON.parse().
- Use double quotes for all strings.
- Do not include trailing commas.

JSON SCHEMA
{
  "subject": "${params.subject}",
  "chapter": "${params.chapter}",
  "subchapter": "${params.subchapter}",
  "mcqs": [
    {
      "id": 1,
      "difficulty": "easy | medium | hard",
      "question": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correctAnswer": "A | B | C | D",
      "explanation": "string"
    }
  ]
}

QUALITY BAR
- Questions should match FAANG-level screening where applicable.
- Favor application-based questions over definitions.
- Use precise technical terminology.

Now generate the MCQs.
`.trim();
}
