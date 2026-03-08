type ChapterSummaryInput = {
  board: string;
  classLevel: string;
  subject: string;
  chapter: string;
  ask?: string;
  history: Array<{ question: string; answer: string }>;
};

export function buildChapterSummaryPrompt(input: ChapterSummaryInput): string {
  const askText = input.ask?.trim() ?? '';
  const askLine = askText
    ? `Student request focus: ${askText}`
    : 'Student request focus: General understanding and revision readiness.';
  const isFollowUp = input.history.length > 0;
  const askLower = askText.toLowerCase();
  const historyLines = input.history.length > 0
    ? [
        'Previous conversation context (follow this and avoid repeating the same points):',
        ...input.history.flatMap((turn, index) => [
          `Q${index + 1}: ${turn.question}`,
          `A${index + 1}: ${turn.answer.slice(0, 800)}`,
        ]),
      ]
    : ['No previous conversation context.'];

  if (isFollowUp) {
    return [
      'You are an expert school tutor and curriculum designer.',
      'You are in FOLLOW-UP mode for the same chapter.',
      `Board: ${input.board}`,
      `Class: ${input.classLevel}`,
      `Subject: ${input.subject}`,
      `Chapter: ${input.chapter}`,
      askLine,
      ...historyLines,
      '',
      'Critical rules:',
      '1) Answer ONLY the latest asked request.',
      '2) Do NOT repeat full chapter summary unless explicitly asked.',
      '3) Keep prior context in mind and avoid contradiction.',
      '4) Return clean markdown only (no HTML).',
      '5) If the ask is "mind map", return ONLY a clear markdown mind map.',
      '6) If the ask is for MCQs, return ONLY MCQs.',
      '7) If the ask is for questions with answers, return ONLY that.',
      '',
      askLower.includes('mcq')
        ? [
            'MCQ formatting (must follow exactly):',
            '### MCQs for Exam Preparation',
            '1. <Question>',
            '- A) <Option A>',
            '- B) <Option B>',
            '- C) <Option C>',
            '- D) <Option D>',
            '**Answer:** <A/B/C/D>',
            '**Explanation:** <1-2 lines>',
            'Repeat for each MCQ (8 to 10 MCQs).',
          ].join('\n')
        : 'Use markdown headings and bullet points as needed for the asked output.',
      '',
      'Output scope:',
      '- Provide exactly one focused response matching the current ask.',
      '- No extra sections, no unrelated recommendations.',
    ].join('\n');
  }

  return [
    'You are an expert school tutor and curriculum designer.',
    'Create a high-quality chapter summary for a school student.',
    `Board: ${input.board}`,
    `Class: ${input.classLevel}`,
    `Subject: ${input.subject}`,
    `Chapter: ${input.chapter}`,
    askLine,
    ...historyLines,
    '',
    'Instructions:',
    '1) Keep language simple, precise, and grade-appropriate.',
    '2) Do not assume chapter text is available; use standard curriculum understanding.',
    '3) If uncertain, state likely concept names rather than fabricated facts.',
    '4) Keep the response practical for exam revision.',
    '5) Return clean markdown only (no HTML). Use short paragraphs and clear bullet points.',
    '',
    'Output format (use exactly these markdown headings):',
    '### Chapter Summary',
    '- 6 to 8 concise bullet points',
    '### Key Terms',
    '- 8 to 12 terms with one-line meaning each',
    '### Important Formulas/Facts',
    '- Include only if relevant to the subject/chapter',
    '### Common Mistakes to Avoid',
    '- 4 to 6 bullet points',
    '### Quick Revision Checklist',
    '- 6 actionable checklist items',
    '### Practice Questions',
    '- 5 questions: 2 easy, 2 medium, 1 challenging',
    'At the end of the response, add this exact section:',
    'If you want further help with this chapter, I can also provide:',
    '- Extra short summary for quick revision',
    '- Important exam questions with answers',
    '- A clear and easy mind map',
    '- Hindi notes for quick understanding',
    '- MCQs for exam preparation'
  ].join('\n');
}

export function buildChapterSuggestionPrompt(subject: string, board: string, classLevel: string, isbn?: string): string {
  return [
    'You are an academic curriculum assistant.',
    `Generate up to 12 chapter names for Subject: ${subject}, Board: ${board}, Class: ${classLevel}.`,
    isbn ? `ISBN context (if recognized): ${isbn}. Match chapter names to that textbook if possible.` : 'No ISBN provided.',
    'Return ONLY a JSON array of strings.',
    'No markdown. No explanations. No extra keys.',
    'Example format: ["Chapter 1", "Chapter 2"]',
  ].join('\n');
}

export function buildOcrExtractionPrompt(subject: string): string {
  return [
    `Subject: ${subject}`,
    'This is a textbook table of contents / index page.',
    'Extract ONLY text that is clearly visible on the page.',
    'Return ONLY one JSON array of strings.',
    'Do not return markdown. Do not return explanation.',
    'Rules:',
    '1) Include chapter titles and visible subtopic bullets.',
    '2) Keep original wording from image; do not paraphrase.',
    '3) Do NOT invent or expand numbering.',
    '4) Do NOT repeat same title with different numbering variants.',
    '5) Exclude page numbers, section banners, grade labels, and decorative text.',
    '6) If a bullet belongs to a chapter, format as "<Chapter Title> - <Bullet>".',
    'Example output:',
    '["Create with Krita","Create with Krita - Digital painting","The Language of the Universe"]',
  ].join('\n');
}
