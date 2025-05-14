/**
 * Utilities for filtering and improving AI-generated flashcards
 */

/**
 * Filters out problematic questions commonly generated in flashcards
 */
export function filterProblematicFlashcards(
  flashcards: Array<{question: string, answer: string}>
): Array<{question: string, answer: string}> {
  const problematicPatterns = [
    // Generic meta-questions
    "wie hängt \"bereich\"",
    "zusammenhang zwischen bereich",
    "bereich des themas",
    "im bereich",
    "mit anderen wichtigen konzepten",
    "im zusammenhang mit diesem thema",
    "was zeigt das bild",
    "was ist auf dem bild zu sehen",
    "hauptelemente des bildes",
    "wie wird der begriff",
    "wie wird das konzept",
    "im text erläutert",
    "im text erwähnt"
  ];

  return flashcards.filter(card => {
    const questionLower = card.question.toLowerCase();
    return !problematicPatterns.some(pattern => questionLower.includes(pattern));
  });
}