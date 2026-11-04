/**
 * Spomegel Allgemeiner Wortschatz & Kennenlernfragen
 */

const GENERAL_DECK = {
  questions: {
    intro: [
      "Wie heißt du und woher kommst du?",
      "Was machst du in deiner Freizeit am liebsten?",
      "Warum lernst du diese Sprache und was gefällt dir daran?",
      "Bist du eher ein Morgenmensch oder eine Nachteule?",
      "Was ist deine Lieblingsstadt oder dein Lieblingsland?"
    ],
    A1_A2: [
      "Welche Sprachen sprichst du bereits?",
      "Was isst du am liebsten zum Frühstück?",
      "Hast du Haustiere oder magst du Tiere?",
      "Welche Musik hörst du gerne?",
      "Wie sieht dein normaler Tag aus?"
    ],
    B1_B2: [
      "Erzähle von einer lustigen oder interessanten Reise, die du gemacht hast.",
      "Was fällt dir beim Sprachenlernen am schwersten und wie übst du?",
      "Welchen Film oder welche Serie kannst du aktuell empfehlen?",
      "Wenn du überall auf der Welt leben könntest, wo wäre das?",
      "Was ist eine Gewohnheit, die du dieses Jahr verbessern möchtest?"
    ],
    C1_C2: [
      "Inwiefern beeinflusst die Sprache die Art und Weise, wie wir denken?",
      "Glaubst du, dass Künstliche Intelligenz menschliche Sprachlehrer ersetzen wird?",
      "Was ist die wichtigste Lektion, die du im Leben bisher gelernt hast?",
      "Wie hat sich das Leben junger Menschen im Vergleich zu früheren Generationen verändert?",
      "Sollte jeder Mensch mindestens zwei Fremdsprachen fließend sprechen müssen?"
    ]
  },

  vocab: {
    fr: [
      { word: "Enchanté(e)", example: "Enchanté de faire votre connaissance !" },
      { word: "D'où viens-tu ?", example: "Moi, je viens de Berlin." },
      { word: "C'est-à-dire", example: "C'est-à-dire que j'apprends le français depuis un an." },
      { word: "Tout à fait", example: "Je suis tout à fait d'accord avec toi." },
      { word: "Comment dit-on... ?", example: "Comment dit-on ce mot en français ?" },
      { word: "À mon avis", example: "À mon avis, voyager aide beaucoup." },
      { word: "Pas de souci", example: "Pas de souci, on a le temps !" },
      { word: "Qu'est-ce que tu en penses ?", example: "C'est une bonne idée, qu'en penses-tu ?" },
      { word: "Pour être honnête", example: "Pour être honnête, ce n'est pas facile." },
      { word: "De rien / Je t'en prie", example: "Je t'en prie, avec grand plaisir." },
      { word: "Tu fais quoi dans la vie ?", example: "Je suis étudiant à l'université." },
      { word: "À la prochaine !", example: "Merci pour cette conversation, à la prochaine !" }
    ],
    de: [
      { word: "Freut mich", example: "Freut mich, dich kennenzulernen!" },
      { word: "Woher kommst du?", example: "Ich komme ursprünglich aus Hamburg." },
      { word: "Meiner Meinung nach", example: "Meiner Meinung nach ist Übung das Wichtigste." },
      { word: "Genau / Stimmt", example: "Stimmt genau, das sehe ich auch so." },
      { word: "Wie sagt man...?", example: "Wie sagt man das auf Deutsch?" },
      { word: "Kein Problem", example: "Kein Problem, mach dir keine Sorgen." },
      { word: "Ehrlich gesagt", example: "Ehrlich gesagt war die Grammatik anfangs schwer." },
      { word: "Was machst du beruflich?", example: "Ich arbeite im Bereich Informatik." },
      { word: "Verstehst du mich gut?", example: "Ja, deine Aussprache ist sehr klar." },
      { word: "Schönen Tag noch", example: "Danke für das Gespräch, schönen Tag noch!" }
    ],
    en: [
      { word: "Nice to meet you", example: "Nice to meet you! Where are you from?" },
      { word: "In my opinion", example: "In my opinion, daily practice is key." },
      { word: "How do you say...?", example: "How do you say that in English?" },
      { word: "Exactly", example: "Exactly, I completely agree with you." },
      { word: "No worries", example: "No worries, take your time." },
      { word: "By the way", example: "By the way, what music do you listen to?" },
      { word: "Makes sense", example: "Yes, that totally makes sense." },
      { word: "To be honest", example: "To be honest, English idioms can be tricky." },
      { word: "What do you do?", example: "I am currently studying." },
      { word: "Have a great day!", example: "Thanks for the chat, have a great day!" }
    ],
    es: [
      { word: "Mucho gusto", example: "¡Mucho gusto en conocerte!" },
      { word: "¿De dónde eres?", example: "¿De dónde eres tú?" },
      { word: "En mi opinión", example: "En mi opinión, es un idioma muy bonito." },
      { word: "¿Cómo se dice...?", example: "¿Cómo se dice esto en español?" },
      { word: "Exacto", example: "Exacto, opino lo mismo." },
      { word: "No te preocupes", example: "No te preocupes, practicamos juntos." },
      { word: "La verdad es que", example: "La verdad es que me encanta viajar." },
      { word: "¿A qué te dedicas?", example: "Trabajo en una escuela." },
      { word: "¡Hasta luego!", example: "¡Muchas gracias y hasta luego!" }
    ],
    it: [
      { word: "Piacere", example: "Piacere di conoscerti!" },
      { word: "Di dove sei?", example: "Di dove sei esattamente?" },
      { word: "Secondo me", example: "Secondo me è importante parlare spesso." },
      { word: "Come si dice...?", example: "Come si dice questa parola in italiano?" },
      { word: "Perfetto", example: "Perfetto, andiamo avanti!" },
      { word: "Non ti preoccupare", example: "Non ti preoccupare, impariamo insieme." },
      { word: "Che cosa fai nella vita?", example: "Studio all'università." },
      { word: "A presto!", example: "Grazie per la chiacchierata, a presto!" }
    ]
  }
};

function getPromptDeck(levelCode, targetLangCode) {
  let levelKey = "A1_A2";
  if (levelCode.startsWith("B")) levelKey = "B1_B2";
  if (levelCode.startsWith("C")) levelKey = "C1_C2";

  const vocabList = GENERAL_DECK.vocab[targetLangCode] || GENERAL_DECK.vocab.en;

  return {
    introQuestions: GENERAL_DECK.questions.intro,
    levelQuestions: GENERAL_DECK.questions[levelKey] || GENERAL_DECK.questions.A1_A2,
    vocabulary: vocabList
  };
}

if (typeof module !== 'undefined') {
  module.exports = { GENERAL_DECK, getPromptDeck };
}
