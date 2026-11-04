/**
 * Spomegel – Vocabulary & Conversation Questions
 * Questions are per target language. Vocab is per target language.
 */

const GENERAL_DECK = {
  questions: {
    de: {
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
    en: {
      intro: [
        "What's your name and where are you from?",
        "What do you like to do in your free time?",
        "Why are you learning this language and what do you enjoy about it?",
        "Are you more of a morning person or a night owl?",
        "What's your favourite city or country?"
      ],
      A1_A2: [
        "What languages do you already speak?",
        "What do you like to eat for breakfast?",
        "Do you have any pets or do you like animals?",
        "What kind of music do you enjoy?",
        "What does a typical day look like for you?"
      ],
      B1_B2: [
        "Tell me about a funny or interesting trip you've taken.",
        "What do you find hardest about learning languages and how do you practise?",
        "What film or series would you recommend right now?",
        "If you could live anywhere in the world, where would it be?",
        "What's one habit you'd like to improve this year?"
      ],
      C1_C2: [
        "In what ways does language influence the way we think?",
        "Do you think artificial intelligence will replace human language teachers?",
        "What is the most important lesson you've learned in life so far?",
        "How has life changed for young people compared to previous generations?",
        "Should everyone be required to speak at least two foreign languages fluently?"
      ]
    },
    fr: {
      intro: [
        "Comment tu t'appelles et d'où viens-tu ?",
        "Qu'est-ce que tu aimes faire pendant ton temps libre ?",
        "Pourquoi apprends-tu cette langue et qu'est-ce qui te plaît ?",
        "Tu es plutôt du matin ou du soir ?",
        "Quelle est ta ville ou ton pays préféré ?"
      ],
      A1_A2: [
        "Quelles langues parles-tu déjà ?",
        "Qu'est-ce que tu aimes manger au petit-déjeuner ?",
        "Tu as des animaux ou tu aimes les animaux ?",
        "Quelle musique écoutes-tu ?",
        "À quoi ressemble ta journée typique ?"
      ],
      B1_B2: [
        "Raconte-moi un voyage amusant ou intéressant que tu as fait.",
        "Qu'est-ce que tu trouves le plus difficile dans l'apprentissage des langues et comment tu t'entraînes ?",
        "Quel film ou quelle série tu recommandes en ce moment ?",
        "Si tu pouvais vivre n'importe où dans le monde, ce serait où ?",
        "Quelle est une habitude que tu aimerais améliorer cette année ?"
      ],
      C1_C2: [
        "Dans quelle mesure la langue influence-t-elle notre façon de penser ?",
        "Penses-tu que l'intelligence artificielle remplacera les professeurs de langues ?",
        "Quelle est la leçon la plus importante que tu aies apprise dans ta vie ?",
        "Comment la vie a-t-elle changé pour les jeunes par rapport aux générations précédentes ?",
        "Tout le monde devrait-il être obligé de parler couramment au moins deux langues étrangères ?"
      ]
    },
    es: {
      intro: [
        "¿Cómo te llamas y de dónde eres?",
        "¿Qué te gusta hacer en tu tiempo libre?",
        "¿Por qué aprendes este idioma y qué te gusta de él?",
        "¿Eres más de mañana o de noche?",
        "¿Cuál es tu ciudad o país favorito?"
      ],
      A1_A2: [
        "¿Qué idiomas hablas ya?",
        "¿Qué te gusta comer para desayunar?",
        "¿Tienes mascotas o te gustan los animales?",
        "¿Qué tipo de música escuchas?",
        "¿Cómo es un día normal para ti?"
      ],
      B1_B2: [
        "Cuéntame un viaje divertido o interesante que hayas hecho.",
        "¿Qué es lo más difícil de aprender idiomas y cómo practicas?",
        "¿Qué película o serie recomendarías ahora mismo?",
        "Si pudieras vivir en cualquier lugar del mundo, ¿dónde sería?",
        "¿Qué hábito te gustaría mejorar este año?"
      ],
      C1_C2: [
        "¿En qué medida influye el idioma en nuestra forma de pensar?",
        "¿Crees que la inteligencia artificial reemplazará a los profesores de idiomas?",
        "¿Cuál es la lección más importante que has aprendido en la vida?",
        "¿Cómo ha cambiado la vida para los jóvenes en comparación con generaciones anteriores?",
        "¿Debería todo el mundo estar obligado a hablar con fluidez al menos dos idiomas extranjeros?"
      ]
    },
    it: {
      intro: [
        "Come ti chiami e da dove vieni?",
        "Cosa ti piace fare nel tempo libero?",
        "Perché stai imparando questa lingua e cosa ti piace di essa?",
        "Sei più una persona mattiniera o nottambula?",
        "Qual è la tua città o il tuo paese preferito?"
      ],
      A1_A2: [
        "Quali lingue parli già?",
        "Cosa ti piace mangiare a colazione?",
        "Hai animali domestici o ti piacciono gli animali?",
        "Che tipo di musica ascolti?",
        "Com'è una tua giornata tipica?"
      ],
      B1_B2: [
        "Raccontami un viaggio divertente o interessante che hai fatto.",
        "Cosa trovi più difficile nell'apprendimento delle lingue e come ti eserciti?",
        "Quale film o serie consiglieresti in questo momento?",
        "Se potessi vivere ovunque nel mondo, dove sarebbe?",
        "Qual è un'abitudine che vorresti migliorare quest'anno?"
      ],
      C1_C2: [
        "In che modo il linguaggio influenza il nostro modo di pensare?",
        "Pensi che l'intelligenza artificiale sostituirà gli insegnanti di lingue?",
        "Qual è la lezione più importante che hai imparato nella vita finora?",
        "Come è cambiata la vita dei giovani rispetto alle generazioni precedenti?",
        "Tutti dovrebbero essere obbligati a parlare fluentemente almeno due lingue straniere?"
      ]
    }
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

  const langQuestions = GENERAL_DECK.questions[targetLangCode] || GENERAL_DECK.questions.en;
  const vocabList = GENERAL_DECK.vocab[targetLangCode] || GENERAL_DECK.vocab.en;

  return {
    questions: [
      ...(langQuestions.intro || []),
      ...(langQuestions[levelKey] || [])
    ],
    vocabulary: vocabList
  };
}

if (typeof module !== 'undefined') {
  module.exports = { GENERAL_DECK, getPromptDeck };
}
