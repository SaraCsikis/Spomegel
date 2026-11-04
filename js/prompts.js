/**
 * Spomegel Prompts & Vocabulary Database
 * Supports progressive difficulty (A1 -> C2) and topic-based vocab cards
 */

const TOPICS = {
  travel: {
    id: "travel",
    title: "✈️ Travel & Holidays",
    vocab: {
      en: [
        { word: "Journey / Trip", example: "Have a safe journey!" },
        { word: "Destination", example: "What is your next destination?" },
        { word: "Luggage", example: "I only travel with carry-on luggage." },
        { word: "Border / Customs", example: "We passed through customs quickly." },
        { word: "Flight attendant", example: "The flight attendant was very friendly." },
        { word: "Sightseeing", example: "Let's do some sightseeing today." },
        { word: "Local cuisine", example: "I love tasting authentic local cuisine." }
      ],
      de: [
        { word: "die Reise (Trip)", example: "Gute Reise!" },
        { word: "das Reiseziel (Destination)", example: "Was ist dein nächstes Reiseziel?" },
        { word: "das Gepäck (Luggage)", example: "Ich reise nur mit Handgepäck." },
        { word: "der Zoll (Customs)", example: "Wir sind schnell durch den Zoll gekommen." },
        { word: "Sehenswürdigkeiten (Sightseeing)", example: "Wir haben viele Sehenswürdigkeiten besucht." },
        { word: "die Unterkunft (Accommodation)", example: "Unsere Unterkunft war direkt am Meer." }
      ],
      fr: [
        { word: "le voyage (Trip)", example: "Bon voyage !" },
        { word: "la destination (Destination)", example: "Quelle est ta prochaine destination ?" },
        { word: "les bagages (Luggage)", example: "Je voyage léger avec un seul bagage." },
        { word: "la douane (Customs)", example: "Nous sommes passés par la douane." },
        { word: "visiter (To visit/sightsee)", example: "J'aimerais visiter le centre historique." },
        { word: "le billet (Ticket)", example: "J'ai réservé mon billet d'avion." }
      ],
      es: [
        { word: "el viaje (Trip)", example: "¡Buen viaje!" },
        { word: "el destino (Destination)", example: "¿Cuál es tu próximo destino?" },
        { word: "el equipaje (Luggage)", example: "Solo llevo equipaje de mano." },
        { word: "la aduana (Customs)", example: "Pasamos por la aduana sin problemas." },
        { word: "el alojamiento (Accommodation)", example: "El alojamiento estaba en el centro." }
      ]
    },
    questions: {
      intro: [
        "What is the best country or city you have ever visited?",
        "Do you prefer traveling to the beach, mountains, or bustling cities?",
        "What is the top destination on your bucket list?"
      ],
      A1_A2: [
        "How do you travel: by train, plane, or car?",
        "What do you always pack in your suitcase?",
        "What food do you like to eat when you are on vacation?"
      ],
      B1_B2: [
        "Describe a memorable adventure or funny mistake you experienced abroad.",
        "Do you prefer guided tours or exploring spontaneously on your own? Why?",
        "How has traveling changed your perspective on different cultures?"
      ],
      C1_C2: [
        "Is mass tourism causing more harm than good to historical destinations?",
        "How will eco-tourism and flight shaming shape the future of global travel?",
        "Can someone ever truly understand a culture as a short-term tourist?"
      ]
    }
  },

  daily: {
    id: "daily",
    title: "☕ Daily Life & Habits",
    vocab: {
      en: [
        { word: "Morning routine", example: "My morning routine starts at 7 AM." },
        { word: "Commute", example: "How long is your daily commute?" },
        { word: "To unwind / relax", example: "I like to unwind with a good book." },
        { word: "Productive", example: "Today was a very productive day." },
        { word: "Habit", example: "Walking every morning is a great habit." }
      ],
      de: [
        { word: "die Morgenroutine", example: "Meine Morgenroutine beginnt mit Kaffee." },
        { word: "der Arbeitsweg (Commute)", example: "Mein Arbeitsweg dauert 20 Minuten." },
        { word: "abschalten / entspannen", example: "Abends kann ich gut bei Musik entspannen." },
        { word: "die Gewohnheit (Habit)", example: "Gute Gewohnheiten machen das Leben leichter." },
        { word: "der Feierabend", example: "Schönen Feierabend!" }
      ],
      fr: [
        { word: "le quotidien (Daily life)", example: "Dans mon quotidien, j'aime cuisiner." },
        { word: "le trajet (Commute)", example: "Mon trajet en métro est court." },
        { word: "se détendre (To unwind)", example: "J'aime me détendre après le travail." },
        { word: "l'habitude (Habit)", example: "C'est une excellente habitude." }
      ],
      es: [
        { word: "la rutina diaria", example: "Mi rutina diaria es muy tranquila." },
        { word: "el trayecto (Commute)", example: "Tengo un trayecto corto al trabajo." },
        { word: "relajarse (To relax)", example: "Me gusta relajarme escuchando música." },
        { word: "la costumbre (Habit)", example: "Tengo la costumbre de madrugar." }
      ]
    },
    questions: {
      intro: [
        "Are you an early bird or a night owl?",
        "What does a perfect Sunday look like for you?",
        "What is the first thing you do right after waking up?"
      ],
      A1_A2: [
        "What time do you usually wake up and go to sleep?",
        "What is your favorite meal of the day?",
        "What do you like to do after school or work?"
      ],
      B1_B2: [
        "What is one daily habit you would like to start or break this year?",
        "How do you deal with stress during a busy work or study week?",
        "Do you spend too much screen time on your phone? How do you balance it?"
      ],
      C1_C2: [
        "Has modern productivity culture created an obsession with work over well-being?",
        "How do societal routines differ between your culture and other countries you know?",
        "Do routines liberate human creativity or suppress spontaneity?"
      ]
    }
  },

  food: {
    id: "food",
    title: "🍕 Food & Cooking",
    vocab: {
      en: [
        { word: "Recipe", example: "I tried a new pasta recipe yesterday." },
        { word: "Ingredients", example: "Fresh ingredients make all the difference." },
        { word: "Spicy / Mild", example: "Is this curry very spicy?" },
        { word: "Homemade", example: "Nothing beats homemade bread." },
        { word: "Diet / Nutrition", example: "A balanced diet gives you energy." }
      ],
      de: [
        { word: "das Rezept", example: "Dieses Rezept stammt von meiner Großmutter." },
        { word: "die Zutaten (Ingredients)", example: "Wir brauchen frische Zutaten." },
        { word: "scharf / mild", example: "Das Essen ist ziemlich scharf." },
        { word: "selbstgemacht (Homemade)", example: "Selbstgemachte Pizza schmeckt am besten." },
        { word: "der Geschmack (Taste/Flavor)", example: "Der Geschmack ist köstlich." }
      ],
      fr: [
        { word: "la recette (Recipe)", example: "C'est une recette traditionnelle." },
        { word: "les ingrédients", example: "Achetons des ingrédients frais au marché." },
        { word: "épicé (Spicy)", example: "Ce plat est un peu trop épicé pour moi." },
        { word: "fait maison (Homemade)", example: "Le dessert est fait maison." },
        { word: "délicieux (Delicious)", example: "C'est absolument délicieux !" }
      ],
      es: [
        { word: "la receta (Recipe)", example: "Es una receta de mi familia." },
        { word: "los ingredientes", example: "Compramos ingredientes frescos." },
        { word: "picante (Spicy)", example: "¿Esta salsa es muy picante?" },
        { word: "casero (Homemade)", example: "Me encanta la comida casera." }
      ]
    },
    questions: {
      intro: [
        "What is your all-time favorite meal to eat?",
        "Do you enjoy cooking, or do you prefer eating out / ordering delivery?",
        "Is there any food you absolutely refuse to eat?"
      ],
      A1_A2: [
        "What do you usually eat for breakfast?",
        "Can you cook any signature dishes?",
        "What is the most famous dish from your country?"
      ],
      B1_B2: [
        "Teach me briefly how to prepare your favorite traditional dish.",
        "What is the strangest or most exotic food you have ever tasted?",
        "Do you think fast food culture is replacing traditional dining?"
      ],
      C1_C2: [
        "How is food intertwined with national identity and cultural heritage?",
        "Can ethical consumerism and plant-based diets genuinely combat climate change?",
        "What are the cultural philosophies surrounding dining etiquette in your home country?"
      ]
    }
  },

  culture: {
    id: "culture",
    title: "🎭 Culture & Traditions",
    vocab: {
      en: [
        { word: "Tradition / Custom", example: "It is an ancient tradition." },
        { word: "Celebration / Festival", example: "The spring festival lasts three days." },
        { word: "Stereotype", example: "We shouldn't rely on cultural stereotypes." },
        { word: "Heritage", example: "Preserving cultural heritage is essential." },
        { word: "Hospitality", example: "They treated us with warm hospitality." }
      ],
      de: [
        { word: "der Brauch / die Tradition", example: "Ein schöner Brauch im Frühling." },
        { word: "das Fest / Feiertag", example: "An diesem Feiertag kommt die Familie zusammen." },
        { word: "die Gastfreundschaft", example: "Ihre Gastfreundschaft war überwältigend." },
        { word: "das Klischee (Stereotype)", example: "Nicht jedes Klischee stimmt." }
      ],
      fr: [
        { word: "la tradition", example: "C'est une tradition séculaire." },
        { word: "la fête / célébration", example: "Une fête très animée dans le village." },
        { word: "l'hospitalité (Hospitality)", example: "Merci pour votre généreuse hospitalité." },
        { word: "le patrimoine (Heritage)", example: "Le patrimoine culturel est riche." }
      ],
      es: [
        { word: "la costumbre / tradición", example: "Es una tradición muy antigua." },
        { word: "la fiesta / celebración", example: "La fiesta patronal es divertida." },
        { word: "la hospitalidad", example: "Nos recibieron con gran hospitalidad." }
      ]
    },
    questions: {
      intro: [
        "What is the most important national holiday or celebration in your country?",
        "What is one positive stereotype about people from your region?",
        "What surprised you most when you first visited another country?"
      ],
      A1_A2: [
        "How do people in your country celebrate New Year's or birthdays?",
        "What kind of music is popular where you live?",
        "What traditional clothes or festivals do you celebrate?"
      ],
      B1_B2: [
        "Describe a cultural tradition that might seem unusual to a foreigner.",
        "How do people greet each other in your country (handshake, hug, kiss)?",
        "How has globalization influenced traditional customs among younger generations?"
      ],
      C1_C2: [
        "Does globalization risk homogenizing cultural diversity into a single Western mold?",
        "How does language shape cognitive thought and worldview according to your experience?",
        "What historical events have most deeply influenced the collective mindset of your society?"
      ]
    }
  },

  deep: {
    id: "deep",
    title: "💡 Deep Questions & Philosophy",
    vocab: {
      en: [
        { word: "Perspective", example: "That gave me a fresh perspective on life." },
        { word: "Philosophy", example: "What is your personal life philosophy?" },
        { word: "Dilemma", example: "It is an interesting moral dilemma." },
        { word: "Gratitude", example: "Practicing gratitude brings peace of mind." },
        { word: "Future generation", example: "We must think of future generations." }
      ],
      de: [
        { word: "die Perspektive", example: "Eine neue Perspektive auf die Dinge." },
        { word: "die Lebenseinstellung", example: "Eine positive Lebenseinstellung hilft immer." },
        { word: "die Dankbarkeit (Gratitude)", example: "Dankbarkeit führt zu Zufriedenheit." },
        { word: "die Entscheidung (Decision)", example: "Manchmal ist die Entscheidung schwer." }
      ],
      fr: [
        { word: "la perspective", example: "Une perspective très intéressante." },
        { word: "la gratitude", example: "Exprimer sa gratitude chaque jour." },
        { word: "la sagesse (Wisdom)", example: "Avec l'âge vient la sagesse." },
        { word: "l'avenir (Future)", example: "Pensons à l'avenir." }
      ],
      es: [
        { word: "la perspectiva", example: "Una perspectiva diferente de ver el mundo." },
        { word: "la gratitud", example: "La gratitud abre muchas puertas." },
        { word: "el destino (Destiny)", example: "¿Crees en el destino?" }
      ]
    },
    questions: {
      intro: [
        "If you could have dinner with any historical figure, who would it be and why?",
        "What is one piece of advice you would give to your 15-year-old self?",
        "If you won 10 million dollars tomorrow, what would you do with your life?"
      ],
      A1_A2: [
        "What makes you truly happy on a simple day?",
        "Do you believe luck or hard work is more important?",
        "What is your dream job and why?"
      ],
      B1_B2: [
        "If you could instantly become fluent in any three languages, which would you pick?",
        "Do you think artificial intelligence will make humanity happier or more isolated?",
        "What is a lesson you learned the hard way?"
      ],
      C1_C2: [
        "Is privacy dead in the digital age, and do modern societies actually value it?",
        "If humanity discovers intelligent extraterrestrial life, how would philosophy and religion react?",
        "Is absolute free will an illusion shaped by neurobiology and socio-economic determinism?"
      ]
    }
  }
};

/**
 * Returns icebreaker questions and vocabulary for the chosen level and topic
 */
function getPromptDeck(topicId, levelCode, targetLangCode) {
  const topic = TOPICS[topicId] || TOPICS.travel;
  
  // Normalize level
  let levelKey = "A1_A2";
  if (levelCode.startsWith("B")) levelKey = "B1_B2";
  if (levelCode.startsWith("C")) levelKey = "C1_C2";

  // Get vocabulary in target language (or English fallback)
  const langKey = (topic.vocab[targetLangCode]) ? targetLangCode : "en";
  const vocabList = topic.vocab[langKey] || topic.vocab.en;

  return {
    topicTitle: topic.title,
    introQuestions: topic.questions.intro,
    levelQuestions: topic.questions[levelKey] || topic.questions.A1_A2,
    vocabulary: vocabList
  };
}

if (typeof module !== 'undefined') {
  module.exports = { TOPICS, getPromptDeck };
}
