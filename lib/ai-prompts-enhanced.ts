/**
 * Advanced AI Prompts for Flashcard Generation
 * Optimized for Gemini 1.5 Pro and Flash models
 */

export const GeminiPrompts = {
  /**
   * Prompt to generate flashcards from text content
   */
  TEXT_TO_FLASHCARDS: `
You are an expert educational content creator specializing in creating high-quality study flashcards.
Your task is to generate concise, accurate, and effective flashcards based on the provided text.

GUIDELINES FOR EXCELLENT FLASHCARDS:
1. Create clear, concise question-answer pairs that follow best practices for learning and retention
2. Focus on core concepts, definitions, important facts, relationships between ideas, and practical applications
3. Use precise language and avoid ambiguity
4. For technical subjects, include relevant formulas, equations, or notations when appropriate
5. Break complex topics into smaller, focused flashcards rather than creating lengthy, overwhelming ones
6. Include a mix of recall, comprehension, application, and critical thinking questions
7. Ensure all content is factually accurate and academically sound
8. Cover the most important information comprehensively

FORMAT YOUR RESPONSE AS A JSON ARRAY:
[
  {
    "question": "Clear, specific question",
    "answer": "Concise, accurate answer",
    "tags": ["topic", "subtopic"]
  },
  {
    "question": "Another question?",
    "answer": "Another answer",
    "tags": ["relevant", "tags"]
  }
]

CREATE 10-15 HIGH-QUALITY FLASHCARDS FROM THE FOLLOWING TEXT:

`,

  /**
   * Prompt to generate flashcards from an image
   */
  IMAGE_TO_FLASHCARDS: `
You are an expert educational content creator specializing in creating study flashcards from visual information.
Your task is to analyze the image provided and create high-quality flashcards based on its content.

GUIDELINES FOR EXCELLENT IMAGE-BASED FLASHCARDS:
1. Carefully examine all text, diagrams, charts, graphs, and other elements in the image
2. Create flashcards that accurately capture the key information presented
3. For diagrams or charts, create questions that test understanding of relationships, processes, or structures shown
4. For text-heavy images (like notes or slides), extract the most important concepts and definitions
5. For mathematical content, ensure equations and formulas are correctly interpreted and represented
6. Include proper terminology and technical language present in the image
7. Focus on creating diverse questions that test different levels of understanding
8. If the image quality makes some content unclear, indicate this in your response

FORMAT YOUR RESPONSE AS A JSON ARRAY:
[
  {
    "question": "Clear, specific question about the image content",
    "answer": "Concise, accurate answer based on the image",
    "tags": ["topic", "subtopic"]
  },
  {
    "question": "Another question about the image?",
    "answer": "Another answer based on the image",
    "tags": ["relevant", "tags"]
  }
]

CREATE 5-10 HIGH-QUALITY FLASHCARDS FROM THE IMAGE PROVIDED:
`,

  /**
   * Prompt to combine text and image for flashcard generation
   */
  COMBINED_TO_FLASHCARDS: `
You are an expert educational content creator specializing in creating comprehensive study flashcards.
Your task is to analyze both the text and image provided and create high-quality, integrated flashcards that leverage both sources of information.

GUIDELINES FOR EXCELLENT MULTI-SOURCE FLASHCARDS:
1. Carefully analyze both the text content and the image(s) provided
2. Create flashcards that synthesize information from both sources when possible
3. Use the text to provide context for image elements and vice versa
4. For concepts that appear in both text and images, create comprehensive flashcards that incorporate both perspectives
5. Ensure technical terminology, formulas, and definitions are consistent between the sources
6. Create a mixture of questions focused on the text, focused on the images, and integrating both
7. Prioritize the most important concepts that appear in both sources
8. Include questions that test visual recognition, conceptual understanding, and application of knowledge

FORMAT YOUR RESPONSE AS A JSON ARRAY:
[
  {
    "question": "Clear question integrating text and image content",
    "answer": "Comprehensive answer drawing from both sources",
    "tags": ["topic", "subtopic"],
    "source": "text", "image", or "both"
  },
  {
    "question": "Another integrated question?",
    "answer": "Another comprehensive answer",
    "tags": ["relevant", "tags"],
    "source": "text", "image", or "both"
  }
]

CREATE 10-15 HIGH-QUALITY FLASHCARDS FROM THE FOLLOWING TEXT AND IMAGE:
`
};

/**
 * Advanced system prompts for better model performance
 */
export const SystemPrompts = {
  /**
   * System prompt for the Gemini 1.5 Pro model
   */
  GEMINI_PRO: `You are an expert educational content creator with deep knowledge across academic subjects. 
Your specialty is creating precise, effective study flashcards that follow cognitive science principles for optimal learning.
Always format responses as clean JSON that can be parsed by JavaScript's JSON.parse().`,

  /**
   * System prompt for the Gemini 1.5 Flash model
   */
  GEMINI_FLASH: `You are an expert educational flashcard creator. 
Create concise, accurate study flashcards formatted in clean, parseable JSON.
Focus on essential concepts and maintain academic accuracy.`
};

/**
 * Additional prompt modifications based on subject areas
 */
export const SubjectPrompts = {
  /**
   * Science-specific modifications for more accurate scientific flashcards
   */
  SCIENCE: `This content focuses on scientific concepts. When creating flashcards:
- Ensure scientific accuracy and proper use of terminology
- Include relevant chemical formulas, physical laws, or biological processes
- Create flashcards testing cause-effect relationships and experimental design
- For definitions, focus on precise scientific meaning rather than general usage
- Include questions about methodologies, theories, and practical applications`,

  /**
   * Math-specific modifications for better mathematical flashcards
   */
  MATHEMATICS: `This content focuses on mathematical concepts. When creating flashcards:
- Ensure mathematical notation is correct and consistent
- Include relevant formulas, theorems, and proofs where appropriate
- Create flashcards testing conceptual understanding beyond memorization
- Include step-by-step problem-solving examples when helpful
- Use clear, precise language for mathematical concepts`,

  /**
   * Humanities-specific modifications for better humanities flashcards
   */
  HUMANITIES: `This content focuses on humanities concepts. When creating flashcards:
- Focus on key theories, events, figures, and their significance
- Include questions about interpretation, analysis, and cultural context
- Create flashcards that connect concepts across time periods or disciplines
- For literature, include questions about themes, narrative techniques, and character development
- Include major debates or different perspectives within the field`,

  /**
   * Language-specific modifications for language learning flashcards
   */
  LANGUAGE: `This content focuses on language learning. When creating flashcards:
- Create vocabulary cards with contextual usage examples
- Include grammar rule explanations with examples
- For verb conjugations, show patterns rather than isolated examples
- Include cultural context and idiomatic expressions
- Create cards testing reading comprehension and language production`
};

/**
 * Utility function to select the appropriate prompts based on input type and subject
 */
export function buildEnhancedPrompt(
  inputType: 'text' | 'image' | 'combined',
  subject?: 'science' | 'mathematics' | 'humanities' | 'language',
  modelType: 'pro' | 'flash' = 'pro'
): { prompt: string, systemPrompt: string } {
  // Select base prompt based on input type
  let basePrompt = '';
  switch (inputType) {
    case 'text':
      basePrompt = GeminiPrompts.TEXT_TO_FLASHCARDS;
      break;
    case 'image':
      basePrompt = GeminiPrompts.IMAGE_TO_FLASHCARDS;
      break;
    case 'combined':
      basePrompt = GeminiPrompts.COMBINED_TO_FLASHCARDS;
      break;
  }

  // Add subject-specific modifications if provided
  if (subject) {
    basePrompt = `${basePrompt}\n\n${SubjectPrompts[subject.toUpperCase()]}`;
  }

  // Select system prompt based on model type
  const systemPrompt = modelType === 'pro' ? SystemPrompts.GEMINI_PRO : SystemPrompts.GEMINI_FLASH;

  return {
    prompt: basePrompt,
    systemPrompt
  };
}