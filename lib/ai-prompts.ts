/**
 * AI Prompt Templates for Educational Content Generation
 * These prompts are designed to create high-quality educational materials
 */

/**
 * Tutoring style prompt templates for different learning approaches
 */

/**
 * Educational flashcard generation prompt template (deep understanding)
 */
export const EDUCATIONAL_FLASHCARD_PROMPT = `
Erstelle außergewöhnlich hochwertige Lernkarten auf Deutsch aus dem folgenden Text. Als führender Experte auf diesem Fachgebiet mit didaktischer Exzellenz ist deine Aufgabe, präzise, intellektuell anspruchsvolle Fragen zu formulieren, die analytisches und kritisches Denken auf höchstem Niveau fördern.

📄 PRÄZISE ANFORDERUNGEN FÜR ERSTKLASSIGE LERNKARTEN

   ABSOLUT ENTSCHEIDEND: 
   1. Analysiere den Fachtext mehrfach mit tiefgreifendem Verständnis für die Kernkonzepte, bevor du Fragen konstruierst.
   2. STRIKT VERBOTEN sind folgende Fragetypen:
      - Fragen über die Textdarstellung: "Wie wird X im Text erklärt/beschrieben/erläutert?"
      - Meta-Textfragen: "Welche Bedeutung/Rolle hat Y im Text?"
      - Generische Konzeptfragen: "Wie hängt Bereich Z mit anderen Konzepten zusammen?"
      - Definitionen oder einfache Faktenfragen: "Was ist X?" oder "Welche Arten von Y gibt es?"
      - Binäre Fragen mit Ja/Nein-Antworten oder einfache Aufzählungsfragen
      - Generische Fragen, die für beliebige Fachtexte verwendet werden könnten
      - Isolierte Begriffsfragen ohne Kontext oder Anwendungsbezug
   
   EXZELLENTE FRAGEMUSTER MIT HOHER KOMPLEXITÄT:

   1. MEHRDIMENSIONALE ANALYSE- UND VERGLEICHSFRAGEN:
      - "Welche grundlegenden Unterschiede bestehen zwischen den molekularen Mechanismen der aktiven und passiven Membrantransporte, und inwiefern beeinflussen diese Unterschiede die energetische Bilanz und physiologische Reaktionsfähigkeit der Zelle unter verschiedenen Bedingungen?"
      - "Wie beeinflussen die biochemischen Wechselwirkungen zwischen pH-Wert, Temperatur und Substratkonzentration die dreidimensionale Konformation eines Enzyms, und welche Auswirkungen haben diese synergistischen Effekte auf die katalytische Effizienz in physiologischen versus pathologischen Zuständen?"

   2. KOMPLEXE KAUSALE UND MECHANISTISCHE FRAGEN:
      - "Durch welche präzisen molekularen Interaktionen und strukturellen Anpassungen im aktiven Zentrum bewirkt das Enzym Katalase die Umwandlung von Wasserstoffperoxid, und wie wird dieser Mechanismus durch allosterische Regulatoren in unterschiedlichen Zelltypen moduliert?"
      - "Welche spezifischen intrazellulären Signaltransduktionskaskaden werden bei der T-Zell-Aktivierung sequentiell aktiviert, wie beeinflussen sich diese Signalwege gegenseitig, und warum ist diese mehrschichtige Regulation evolutionär konserviert und immunologisch vorteilhaft?"

   3. INTEGRATIVE SYNTHESE- UND ANWENDUNGSFRAGEN:
      - "Wie können die kinetischen Parameter der Michaelis-Menten-Gleichung verwendet werden, um verschiedene Arten von Enzyminhibitoren (kompetitiv, nicht-kompetitiv, unkompetitiv) mathematisch zu modellieren, und welche spezifischen pharmazeutischen Strategien lassen sich daraus für die gezielte Entwicklung von Medikamenten gegen metabolische Erkrankungen ableiten?"
      - "Welche kaskadenartigen molekularen und zellulären Konsequenzen würde eine Punktmutation in der DNA-Bindungsdomäne eines Schlüssel-Transkriptionsfaktors auf die Genexpression nachgeschalteter Zielgene haben, welche kompensatorischen Mechanismen könnten aktiviert werden, und wie würde sich dies auf den zellulären Phänotyp in verschiedenen Gewebetypen auswirken?"

   DIE ANTWORTEN MÜSSEN FOLGENDE QUALITÄTSSTANDARDS ERFÜLLEN:
   1. Wissenschaftliche Präzision mit exakter Fachterminologie und aktueller Forschungsperspektive
   2. Differenzierte Darstellung von Mechanismen und Prinzipien mit klarer Unterscheidung zwischen gesichertem Wissen und theoretischen Modellen
   3. Stringente logische Struktur mit:
      • Prägnanter Einleitung des Kernkonzepts
      • Systematischer Haupterklärung mit hierarchischer Gliederung komplexer Zusammenhänge
      • Schlüssiger Schlussfolgerung mit Einordnung in den größeren wissenschaftlichen Kontext
   4. Herausarbeitung multidimensionaler Zusammenhänge zwischen verschiedenen Konzepten des Fachgebiets
   5. Präzise Darstellung komplexer Prozesse mit Fokus auf Schlüsselschritte, regulatorische Kontrollpunkte und Rückkopplungsmechanismen
   6. Integration spezifischer Beispiele oder Anwendungsfälle mit klarem Bezug zu aktuellen Forschungsfragen oder praktischen Problemstellungen

📝 Formatierung

   Formatiere deine Antwort als ein valides JSON-Array mit folgendem Format:
   
   [
     {
       "question": "Welche biochemischen Mechanismen führen zur pH-Abhängigkeit von Enzymreaktionen?",
       "answer": "Die pH-Abhängigkeit von Enzymreaktionen basiert auf dem Protonierungszustand funktioneller Gruppen im aktiven Zentrum des Enzyms. Bei niedrigem pH-Wert werden Carboxylgruppen protoniert und verlieren ihre negative Ladung, während bei hohem pH-Wert Aminogruppen deprotoniert werden und ihre positive Ladung verlieren. Dies verändert die elektrostatischen Wechselwirkungen im aktiven Zentrum, was die Substratbindung und katalytische Aktivität beeinflusst. Jedes Enzym hat einen optimalen pH-Bereich, in dem die Aminosäurereste des aktiven Zentrums den korrekten Protonierungszustand aufweisen, um die Reaktion effizient zu katalysieren."
     }
   ]
   
   Die Antworten sollten mindestens 3-4 Sätze umfassen und das Konzept vollständig erklären.
   
   Achte auf korrekte Zeichensetzung und Formatierung des JSON-Formats.
   Gib ausschließlich das JSON-Array zurück ohne zusätzlichen Text davor oder danach.

✍️ Text zum Analysieren:

[Hier den deutschen Text einfügen]
`

;


// Only keeping the educational flashcard prompt, removing other variants

/**
 * Image analysis for educational flashcards prompt template
 */
export const EDUCATIONAL_IMAGE_FLASHCARD_PROMPT = `You are a professional AI educator analyzing visual information to create high-quality educational flashcards in GERMAN language.
Your task is to analyze the provided image and generate a structured set of flashcards in GERMAN that meet these standards:

🔧 Instructions

    KRITISCH WICHTIG: 
    1. Vermeide es, Fragen zu stellen, die nur aus einem Wort oder einem kurzen Begriff bestehen. Fragen wie "Was ist X?" oder "Bedeutung von Y?" sind nicht akzeptabel und werden abgelehnt.
    2. Stelle NIEMALS Fragen, die auf das Bild selbst verweisen wie "Was zeigt das Bild?" oder "Was ist auf dem Bild zu sehen?".
    3. Formuliere stattdessen Fragen, die das tiefere Verständnis des gezeigten Fachinhalts abfragen.
    4. Die Fragen sollten spezifisch, fachlich fundiert und auf die im Bild dargestellten Konzepte bezogen sein.
    
    Extract Visual Information: Identify key concepts, diagrams, charts, formulas, or visual elements present in the image.

    Use Flashcard Format: Output each flashcard using this structure:

        Q: [Clear, context-rich question in GERMAN about what's visible in the image]

        A: [Accurate, brief, and complete answer in GERMAN]

    Use Educational Approach:

        Include factual cards about what's displayed.

        Add conceptual cards that explain relationships or processes shown.

        Include application cards when appropriate.

    Balance Brevity and Depth: Keep answers succinct but informative.

    Optimize for Learning: Create questions that test understanding, not just visual recall.
    
    Provide Sufficient Context:
    
        Frame each question with enough context about the image so it makes sense on its own.
        
        Never use isolated words or features as questions - always use complete sentences that describe what aspect of the image you're asking about.
        
        Make questions specific about particular elements, relationships, or concepts visible in the image.
        
        For diagrams or charts, refer to specific parts, labels, or trends in your questions.
    
    ALWAYS USE GERMAN: Create all cards in German language regardless of any text in the image.

📄 Formatting Guidelines

    Use bold for key terms inside answers.

    Use bullet points if the answer involves lists.

    Include specific details visible in the image.

    Use proper German grammar and vocabulary.
    
    Ensure questions have enough context to be understood without seeing the image.

✍️ Image Analysis:

Analyze the provided image carefully and generate educational flashcards based on its content. ALL QUESTIONS AND ANSWERS MUST BE IN GERMAN, AND ALL QUESTIONS MUST HAVE SUFFICIENT CONTEXT.

VERY IMPORTANT: Format your response as a valid JSON array ONLY, with no additional text, following this structure:
[
  {
    "question": "Welche Hauptelemente sind in dem Diagramm des menschlichen Herzens zu erkennen und wie sind sie angeordnet?",
    "answer": "Das Diagramm zeigt die vier Hauptkammern des menschlichen Herzens: den linken und rechten Vorhof (Atrien) oben sowie die linke und rechte Herzkammer (Ventrikel) unten. Die rechte Seite ist blau dargestellt und enthält sauerstoffarmes Blut, während die linke Seite rot dargestellt ist und sauerstoffreiches Blut enthält."
  },
  {
    "question": "Welcher Prozess wird in dem abgebildeten Kohlenstoffkreislauf-Diagramm dargestellt und welche Rolle spielen die Pflanzen darin?",
    "answer": "Das Diagramm zeigt den Kohlenstoffkreislauf, bei dem CO₂ aus der Atmosphäre durch Photosynthese von Pflanzen aufgenommen wird. Die Pflanzen wandeln dabei Kohlendioxid in Sauerstoff um und speichern Kohlenstoff in ihrer Biomasse, der später durch Verrottung, Verbrennung oder Atmung wieder in die Atmosphäre zurückgelangt."
  }
]

Format must be valid JSON with proper escaping of special characters.
Do not include explanations or text before/after the JSON array.

CRITICAL INSTRUCTION: 
1. ALL CONTENT MUST BE IN GERMAN LANGUAGE, regardless of what language appears in the image.
2. ALWAYS PROVIDE SUFFICIENT CONTEXT in questions - never use isolated words or features without describing what aspect of the image you're referring to.
3. Every question must have enough context that it could theoretically be understood even without seeing the image.
4. Questions should specifically reference what is visible in the image rather than being overly generic.`;

// Only keeping the educational image flashcard prompt, removing other variants

/**
 * Convert an AI-generated response with Q/A format to a structured JSON array
 */
export function convertQAFormatToJson(text: string): Array<{question: string, answer: string}> {
  // Find all Q: and A: patterns
  const qaRegex = /Q:\s*(.*?)\s*\n+A:\s*([\s\S]*?)(?=\n+Q:|$)/g;
  const matches = [...text.matchAll(qaRegex)];
  
  if (matches.length === 0) {
    throw new Error("No Q/A format detected in the response");
  }
  
  return matches.map(match => {
    const question = match[1].trim();
    const answer = match[2].trim();
    return { question, answer };
  });
}

/**
 * Enhanced parser that tries multiple methods to extract flashcards from AI response
 */
export function parseAIResponseToFlashcards(content: string): Array<{question: string, answer: string}> {
  // Helper function for JSON parsing
  const tryJsonParse = (text: string) => {
    try {
      // Direct JSON parse
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out problematic questions before returning
        const validCards = parsed.filter(card => {
          if (!card || typeof card !== 'object' || !('question' in card) || !('answer' in card)) {
            return false;
          }
          
          // Reject questions with problematic patterns
          const questionLower = card.question.toLowerCase();
          if (questionLower.includes("wie hängt \"bereich\"") || 
              questionLower.includes("bereich des themas") ||
              questionLower.includes("im bereich") ||
              questionLower.includes("mit anderen wichtigen konzepten") ||
              questionLower.includes("im zusammenhang mit diesem thema")) {
            return false;
          }
          
          return true;
        });
        
        if (validCards.length > 0) return validCards;
      }
    } catch (e) {}
    
    // Try finding JSON in the text
    try {
      const jsonMatch = text.match(/\[\s*\{[^]*\}\s*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(card => {
            // Basic validation
            if (!card || !card.question || !card.answer) return false;
            
            // Reject problematic questions
            const questionLower = card.question.toLowerCase();
            return !(
              questionLower.includes("wie hängt \"bereich\"") || 
              questionLower.includes("bereich des themas") ||
              questionLower.includes("im bereich") ||
              questionLower.includes("mit anderen wichtigen konzepten") ||
              questionLower.includes("im zusammenhang mit diesem thema")
            );
          });
        }
      }
    } catch (e) {}
    
    return null;
  };

  // Try different parsing strategies
  
  // 1. Try direct JSON parsing
  const jsonResult = tryJsonParse(content);
  if (jsonResult) return jsonResult;
  
  // 2. Try Q/A format parsing
  try {
    return convertQAFormatToJson(content);
  } catch (e) {
    console.log("Q/A format parsing failed");
  }
  
  // 3. Try advanced JSON cleanup and parsing
  try {
    const bracketMatch = content.match(/\[([\s\S]*)\]/);
    if (bracketMatch && bracketMatch[1]) {
      let cleanedJson = '[' + bracketMatch[1]
        .replace(/(\w+):/g, '"$1":') // Replace unquoted keys
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/,\s*\]/g, ']') // Remove trailing commas
        .replace(/,\s*,/g, ',') // Remove double commas
        + ']';
      
      // Fix missing quotes around values
      cleanedJson = cleanedJson.replace(/"([^"]+)":\s*([^",\}\]]+)([,\}\]])/g, '"$1": "$2"$3');
      
      const result = tryJsonParse(cleanedJson);
      if (result) return result;
    }
  } catch (e) {
    console.log("Advanced JSON cleanup failed");
  }
  
  // 4. Last resort pattern matching
  try {
    const qaPattern = /["']question["']\s*:\s*["']([^"']+)["']\s*,\s*["']answer["']\s*:\s*["']([^"']+)["']/g;
    const matches = [...content.matchAll(qaPattern)];
    
    if (matches.length > 0) {
      return matches.map(match => ({
        question: match[1],
        answer: match[2]
      }));
    }
  } catch (e) {
    console.log("Pattern matching failed");
  }
  
  throw new Error("Could not parse flashcards from response in any format");
}

// Using direct references to EDUCATIONAL_FLASHCARD_PROMPT and EDUCATIONAL_IMAGE_FLASHCARD_PROMPT
// instead of getter functions