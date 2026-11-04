/**
 * Spomegel - Matchmaking & natives WebRTC (Video + Audio)
 */

// UI translations keyed by native language code
const UI_STRINGS = {
  de: {
    title: "Gespräch starten",
    mode: "Modus:",
    video: "Video",
    text: "Nur Text",
    speaks: "Ich spreche:",
    learns: "Ich möchte lernen:",
    level: "Mein Sprachniveau:",
    motivation: "Motivation:",
    casual: "Locker",
    regular: "Regelmäßig",
    intensive: "Intensiv",
    startBtn: "Partner suchen",
    searching: "Suche nach einem Gesprächspartner...",
    cancelBtn: "Abbrechen",
    sendBtn: "Senden",
    leaveBtn: "Trennen",
    stranger: "Fremder:",
    you: "Du:",
    questionsHeading: "Fragen zum Reden",
    vocabHeading: "Wortschatz-Hilfe",
    notesHeading: "Notizen",
    notesSaved: "Gespeichert",
    notesPlaceholder: "Notizen hier eintragen...",
    msgPlaceholder: "Nachricht schreiben...",
    connected: "Du bist jetzt mit einem Fremden verbunden. Sag Hallo!",
    partnerLeft: "Der Fremde hat die Verbindung getrennt.",
    sameLanguageAlert: "Bitte wähle eine Zielsprache, die sich von deiner Muttersprache unterscheidet!",
    practicing: "Du übst:",
    nativeSpeaker: "Partner ist Muttersprachler",
    langNames: { de: "Deutsch", en: "Englisch", fr: "Französisch", es: "Spanisch", it: "Italienisch" }
  },
  en: {
    title: "Start a conversation",
    mode: "Mode:",
    video: "Video",
    text: "Text only",
    speaks: "I speak:",
    learns: "I want to learn:",
    level: "My language level:",
    motivation: "Motivation:",
    casual: "Casual",
    regular: "Regular",
    intensive: "Intensive",
    startBtn: "Find partner",
    searching: "Searching for a conversation partner...",
    cancelBtn: "Cancel",
    sendBtn: "Send",
    leaveBtn: "Disconnect",
    stranger: "Stranger:",
    you: "You:",
    questionsHeading: "Conversation questions",
    vocabHeading: "Vocabulary help",
    notesHeading: "Notes",
    notesSaved: "Saved",
    notesPlaceholder: "Write your notes here...",
    msgPlaceholder: "Write a message...",
    connected: "You are now connected with a stranger. Say hello!",
    partnerLeft: "The stranger has disconnected.",
    sameLanguageAlert: "Please choose a target language different from your native language!",
    practicing: "Practising:",
    nativeSpeaker: "Partner is a native speaker",
    langNames: { de: "German", en: "English", fr: "French", es: "Spanish", it: "Italian" }
  },
  fr: {
    title: "Démarrer une conversation",
    mode: "Mode :",
    video: "Vidéo",
    text: "Texte seulement",
    speaks: "Je parle :",
    learns: "Je veux apprendre :",
    level: "Mon niveau :",
    motivation: "Motivation :",
    casual: "Casual",
    regular: "Régulier",
    intensive: "Intensif",
    startBtn: "Trouver un partenaire",
    searching: "Recherche d'un partenaire...",
    cancelBtn: "Annuler",
    sendBtn: "Envoyer",
    leaveBtn: "Déconnecter",
    stranger: "Inconnu :",
    you: "Toi :",
    questionsHeading: "Questions pour parler",
    vocabHeading: "Aide au vocabulaire",
    notesHeading: "Notes",
    notesSaved: "Enregistré",
    notesPlaceholder: "Écris tes notes ici...",
    msgPlaceholder: "Écrire un message...",
    connected: "Tu es maintenant connecté à un inconnu. Dis bonjour !",
    partnerLeft: "L'inconnu a coupé la connexion.",
    sameLanguageAlert: "Choisis une langue cible différente de ta langue maternelle !",
    practicing: "Tu pratiques :",
    nativeSpeaker: "Le partenaire est locuteur natif",
    langNames: { de: "Allemand", en: "Anglais", fr: "Français", es: "Espagnol", it: "Italien" }
  },
  es: {
    title: "Iniciar una conversación",
    mode: "Modo:",
    video: "Vídeo",
    text: "Solo texto",
    speaks: "Hablo:",
    learns: "Quiero aprender:",
    level: "Mi nivel:",
    motivation: "Motivación:",
    casual: "Informal",
    regular: "Regular",
    intensive: "Intensivo",
    startBtn: "Buscar pareja",
    searching: "Buscando pareja de conversación...",
    cancelBtn: "Cancelar",
    sendBtn: "Enviar",
    leaveBtn: "Desconectar",
    stranger: "Desconocido:",
    you: "Tú:",
    questionsHeading: "Preguntas para hablar",
    vocabHeading: "Ayuda con el vocabulario",
    notesHeading: "Notas",
    notesSaved: "Guardado",
    notesPlaceholder: "Escribe tus notas aquí...",
    msgPlaceholder: "Escribe un mensaje...",
    connected: "Ahora estás conectado con un desconocido. ¡Di hola!",
    partnerLeft: "El desconocido se ha desconectado.",
    sameLanguageAlert: "¡Elige un idioma objetivo diferente a tu idioma nativo!",
    practicing: "Practicando:",
    nativeSpeaker: "El compañero es hablante nativo",
    langNames: { de: "Alemán", en: "Inglés", fr: "Francés", es: "Español", it: "Italiano" }
  },
  it: {
    title: "Inizia una conversazione",
    mode: "Modalità:",
    video: "Video",
    text: "Solo testo",
    speaks: "Parlo:",
    learns: "Voglio imparare:",
    level: "Il mio livello:",
    motivation: "Motivazione:",
    casual: "Informale",
    regular: "Regolare",
    intensive: "Intensivo",
    startBtn: "Trova un partner",
    searching: "Ricerca di un partner...",
    cancelBtn: "Annulla",
    sendBtn: "Invia",
    leaveBtn: "Disconnetti",
    stranger: "Sconosciuto:",
    you: "Tu:",
    questionsHeading: "Domande per parlare",
    vocabHeading: "Aiuto con il vocabolario",
    notesHeading: "Note",
    notesSaved: "Salvato",
    notesPlaceholder: "Scrivi le tue note qui...",
    msgPlaceholder: "Scrivi un messaggio...",
    connected: "Sei ora connesso con uno sconosciuto. Di' ciao!",
    partnerLeft: "Lo sconosciuto si è disconnesso.",
    sameLanguageAlert: "Scegli una lingua obiettivo diversa dalla tua lingua madre!",
    practicing: "Stai praticando:",
    nativeSpeaker: "Il partner è madrelingua",
    langNames: { de: "Tedesco", en: "Inglese", fr: "Francese", es: "Spagnolo", it: "Italiano" }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.NotesModule) {
    window.NotesModule.init();
  }

  // Bildschirme
  const lobbyScreen = document.getElementById("lobbyScreen");
  const callRoom = document.getElementById("callRoom");
  const searchOverlay = document.getElementById("searchOverlay");

  // Buttons
  const startBtn = document.getElementById("startBtn");
  const cancelSearchBtn = document.getElementById("cancelSearchBtn");
  const leaveBtn = document.getElementById("leaveBtn");

  // Video-Bereich
  const videoSection = document.getElementById("videoSection");
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");

  // Chat-Elemente
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");

  // Status & Fragen
  const practiceBanner = document.getElementById("practiceBanner");
  const questionsList = document.getElementById("questionsList");
  const vocabCardsContainer = document.getElementById("vocabCardsContainer");

  // WebRTC & Status-Variablen
  let mqttClient = null;
  let pc = null;
  let localStream = null;
  let pendingCandidates = [];

  const myId = "usr_" + Math.random().toString(36).substring(2, 9);
  let partnerId = null;
  let currentRoomId = null;
  let state = "idle"; // "idle" | "searching" | "matched"
  let searchInterval = null;
  let searchStartTime = 0;

  let profile = {
    mode: "video",
    nativeLang: "de",
    targetLang: "fr",
    level: "B1",
    motivation: "regular"
  };

  let currentDeck = null;

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ]
  };

  // Apply UI strings for the given native language
  function applyUI(lang) {
    const s = UI_STRINGS[lang] || UI_STRINGS.de;

    document.getElementById("ui-title").textContent = s.title;
    document.getElementById("ui-mode").textContent = s.mode;
    document.getElementById("ui-video").textContent = s.video;
    document.getElementById("ui-text").textContent = s.text;
    document.getElementById("ui-speaks").textContent = s.speaks;
    document.getElementById("ui-learns").textContent = s.learns;
    document.getElementById("ui-level").textContent = s.level;
    document.getElementById("ui-motivation").textContent = s.motivation;
    document.getElementById("ui-casual").textContent = s.casual;
    document.getElementById("ui-regular").textContent = s.regular;
    document.getElementById("ui-intensive").textContent = s.intensive;
    document.getElementById("startBtn").textContent = s.startBtn;
    document.getElementById("ui-searching").textContent = s.searching;
    document.getElementById("cancelSearchBtn").textContent = s.cancelBtn;
    document.getElementById("chatSendBtn").textContent = s.sendBtn;
    document.getElementById("leaveBtn").textContent = s.leaveBtn;
    document.getElementById("ui-stranger").textContent = s.stranger;
    document.getElementById("ui-you").textContent = s.you;
    document.getElementById("ui-questions-heading").textContent = s.questionsHeading;
    document.getElementById("ui-vocab-heading").textContent = s.vocabHeading;
    document.getElementById("ui-notes-heading").textContent = s.notesHeading;
    document.getElementById("notesSaveStatus").textContent = s.notesSaved;
    document.getElementById("notesTextarea").placeholder = s.notesPlaceholder;
    document.getElementById("chatInput").placeholder = s.msgPlaceholder;
  }

  // Re-apply UI when native language dropdown changes
  document.getElementById("nativeLang").addEventListener("change", (e) => {
    applyUI(e.target.value);
  });

  // Kamera & Mikrofon holen (mit Echounterdrückung)
  async function initCamera() {
    if (localStream && localStream.active) return localStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      if (localVideo) {
        localVideo.srcObject = localStream;
        localVideo.muted = true;
        await localVideo.play().catch(() => {});
      }
      return localStream;
    } catch (err) {
      console.error("Kamera/Mikrofon-Fehler:", err);
      const s = UI_STRINGS[profile.nativeLang] || UI_STRINGS.de;
      alert("Kamera- und Mikrofonzugriff erforderlich: " + (err.message || err.name));
      return null;
    }
  }

  // Natives WebRTC erstellen
  function createPeerConnection() {
    if (pc) {
      try { pc.close(); } catch(e) {}
    }

    pc = new RTCPeerConnection(rtcConfig);
    pendingCandidates = [];

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.ontrack = (event) => {
      console.log("[WebRTC] Partner-Spur empfangen:", event.track.kind);
      if (remoteVideo) {
        if (event.streams && event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
        } else {
          let stream = remoteVideo.srcObject;
          if (!stream) {
            stream = new MediaStream();
            remoteVideo.srcObject = stream;
          }
          stream.addTrack(event.track);
        }

        remoteVideo.muted = false;
        remoteVideo.volume = 1.0;

        remoteVideo.play().catch(err => {
          console.warn("[WebRTC] Autoplay blockiert:", err);
          document.addEventListener("click", () => {
            remoteVideo.muted = false;
            remoteVideo.play().catch(() => {});
          }, { once: true });
        });
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && currentRoomId && mqttClient) {
        mqttClient.publish(`spomegel/room/${currentRoomId}`, JSON.stringify({
          type: "SIGNAL_ICE",
          senderId: myId,
          candidate: event.candidate
        }));
      }
    };

    return pc;
  }

  // MQTT-Verbindung aufbauen
  function connectBroker() {
    if (mqttClient) {
      if (mqttClient.connected && state === "searching") {
        mqttClient.subscribe("spomegel/queue", { qos: 0 });
      }
      return;
    }

    mqttClient = mqtt.connect("wss://broker.emqx.io:8084/mqtt", {
      clientId: `spm_${myId}_${Math.random().toString(16).substring(2, 6)}`,
      clean: true,
      reconnectPeriod: 2000
    });

    mqttClient.on("connect", () => {
      console.log("[MQTT] Verbunden als:", myId);
      mqttClient.subscribe(`spomegel/user/${myId}`, { qos: 1 });
      if (state === "searching") {
        mqttClient.subscribe("spomegel/queue", { qos: 0 });
        broadcastQueuePresence();
      }
    });

    mqttClient.on("message", (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        handleIncomingMessage(topic, data);
      } catch (e) {}
    });

    mqttClient.on("error", (err) => {
      console.warn("[MQTT] Fehler:", err.message);
    });
  }

  async function handleIncomingMessage(topic, data) {
    if (topic === `spomegel/user/${myId}`) {
      if (data.type === "INVITE" && state === "searching") {
        partnerId = data.from;
        joinRoom(data.roomId, data.partnerProfile, false);
      }
    }
    else if (topic === "spomegel/queue") {
      if (state === "searching" && data.id && data.id !== myId) {
        checkMatchCandidate(data);
      }
    }
    else if (topic === `spomegel/room/${currentRoomId}`) {
      if (data.senderId === myId) return;

      if (data.type === "ROOM_JOINED") {
        if (profile.mode === "video" && pc) {
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            await pc.setLocalDescription(offer);
            mqttClient.publish(`spomegel/room/${currentRoomId}`, JSON.stringify({
              type: "SIGNAL_OFFER",
              senderId: myId,
              sdp: pc.localDescription
            }));
          } catch (e) {
            console.error("[WebRTC] Offer-Fehler:", e);
          }
        }
      }
      else if (data.type === "CHAT") {
        appendChatMessage(data.text, "partner");
      }
      else if (data.type === "SIGNAL_OFFER") {
        if (profile.mode === "video") {
          if (!pc) createPeerConnection();
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

          while (pendingCandidates.length) {
            await pc.addIceCandidate(pendingCandidates.shift()).catch(() => {});
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          mqttClient.publish(`spomegel/room/${currentRoomId}`, JSON.stringify({
            type: "SIGNAL_ANSWER",
            senderId: myId,
            sdp: pc.localDescription
          }));
        }
      }
      else if (data.type === "SIGNAL_ANSWER") {
        if (pc && profile.mode === "video") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          while (pendingCandidates.length) {
            await pc.addIceCandidate(pendingCandidates.shift()).catch(() => {});
          }
        }
      }
      else if (data.type === "SIGNAL_ICE") {
        if (profile.mode === "video") {
          const candidate = new RTCIceCandidate(data.candidate);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(candidate).catch(() => {});
          } else {
            pendingCandidates.push(candidate);
          }
        }
      }
      else if (data.type === "LEAVE") {
        const s = UI_STRINGS[profile.nativeLang] || UI_STRINGS.de;
        appendSystemMessage(s.partnerLeft);
      }
    }
  }

  // Matchmaking
  function checkMatchCandidate(candidate) {
    if (state !== "searching") return;
    if (candidate.mode !== profile.mode) return;

    const isTandem =
      candidate.nativeLang === profile.targetLang &&
      candidate.targetLang === profile.nativeLang;

    const isSameTarget = candidate.targetLang === profile.targetLang;

    const waitSec = (Date.now() - searchStartTime) / 1000;
    const isOverlap =
      waitSec > 6 &&
      (candidate.nativeLang === profile.nativeLang ||
       candidate.nativeLang === profile.targetLang ||
       candidate.targetLang === profile.nativeLang);

    if (!isTandem && !isSameTarget && !isOverlap) {
      return;
    }

    if (myId > candidate.id) {
      const roomId = "room_" + Math.random().toString(36).substring(2, 9);
      partnerId = candidate.id;

      mqttClient.publish(
        `spomegel/user/${candidate.id}`,
        JSON.stringify({
          type: "INVITE",
          from: myId,
          roomId: roomId,
          partnerProfile: profile
        })
      );

      joinRoom(roomId, candidate, true);
    }
  }

  function joinRoom(roomId, partnerProfile, isInitiator) {
    state = "matched";
    currentRoomId = roomId;

    clearInterval(searchInterval);
    if (mqttClient) {
      mqttClient.unsubscribe("spomegel/queue");
      mqttClient.subscribe(`spomegel/room/${roomId}`, { qos: 1 }, () => {
        if (!isInitiator) {
          mqttClient.publish(`spomegel/room/${roomId}`, JSON.stringify({
            type: "ROOM_JOINED",
            senderId: myId
          }));
        }
      });
    }

    if (profile.mode === "video") {
      videoSection.classList.remove("hidden");
      createPeerConnection();
    } else {
      videoSection.classList.add("hidden");
    }

    searchOverlay.classList.add("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.remove("hidden");

    clearChat();
    const s = UI_STRINGS[profile.nativeLang] || UI_STRINGS.de;
    appendSystemMessage(s.connected);
    setupPracticeDeck(partnerProfile);
  }

  async function startSearch() {
    state = "searching";
    currentRoomId = null;
    partnerId = null;
    searchStartTime = Date.now();

    searchOverlay.classList.remove("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.add("hidden");

    if (profile.mode === "video") {
      await initCamera();
    }

    connectBroker();

    if (mqttClient && mqttClient.connected) {
      mqttClient.subscribe("spomegel/queue", { qos: 0 });
    }

    broadcastQueuePresence();
    clearInterval(searchInterval);
    searchInterval = setInterval(() => {
      if (state === "searching") {
        broadcastQueuePresence();
      } else {
        clearInterval(searchInterval);
      }
    }, 1500);
  }

  function broadcastQueuePresence() {
    if (!mqttClient || !mqttClient.connected || state !== "searching") return;

    const payload = {
      id: myId,
      mode: profile.mode,
      nativeLang: profile.nativeLang,
      targetLang: profile.targetLang,
      level: profile.level,
      timestamp: Date.now()
    };

    mqttClient.publish("spomegel/queue", JSON.stringify(payload));
  }

  function cleanupCall() {
    if (pc) {
      try { pc.close(); } catch(e) {}
      pc = null;
    }
    pendingCandidates = [];
    if (remoteVideo) {
      remoteVideo.srcObject = null;
      remoteVideo.muted = false;
    }
  }

  function leave() {
    if (currentRoomId && mqttClient) {
      mqttClient.publish(
        `spomegel/room/${currentRoomId}`,
        JSON.stringify({ type: "LEAVE", senderId: myId })
      );
      mqttClient.unsubscribe(`spomegel/room/${currentRoomId}`);
    }

    state = "idle";
    currentRoomId = null;
    partnerId = null;
    clearInterval(searchInterval);
    cleanupCall();

    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    if (localVideo) localVideo.srcObject = null;

    searchOverlay.classList.add("hidden");
    callRoom.classList.add("hidden");
    lobbyScreen.classList.remove("hidden");
  }

  // Event Listener
  startBtn.addEventListener("click", () => {
    profile.mode = document.querySelector('input[name="mode"]:checked')?.value || "video";
    profile.nativeLang = document.getElementById("nativeLang").value;
    profile.targetLang = document.getElementById("targetLang").value;
    profile.level = document.getElementById("levelSelect").value;
    profile.motivation = document.getElementById("motivationSelect").value;

    const s = UI_STRINGS[profile.nativeLang] || UI_STRINGS.de;

    if (profile.nativeLang === profile.targetLang) {
      alert(s.sameLanguageAlert);
      return;
    }

    // Apply UI in native language
    applyUI(profile.nativeLang);

    startSearch();
  });

  cancelSearchBtn.addEventListener("click", leave);
  leaveBtn.addEventListener("click", leave);

  function sendChat() {
    const text = chatInput.value.trim();
    if (!text || !currentRoomId || !mqttClient) return;

    mqttClient.publish(
      `spomegel/room/${currentRoomId}`,
      JSON.stringify({
        type: "CHAT",
        senderId: myId,
        text: text
      })
    );

    appendChatMessage(text, "me");
    chatInput.value = "";
  }

  chatSendBtn.addEventListener("click", sendChat);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChat();
  });

  function appendChatMessage(text, sender) {
    const s = UI_STRINGS[profile.nativeLang] || UI_STRINGS.de;
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    const label = sender === "me" ? s.you + " " : s.stranger + " ";
    div.innerHTML = `<strong>${label}</strong><span class="msg-text"></span>`;
    div.querySelector(".msg-text").textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendSystemMessage(text) {
    const div = document.createElement("div");
    div.className = "chat-msg system";
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function clearChat() {
    chatMessages.innerHTML = "";
  }

  function setupPracticeDeck(partnerProfile) {
    const level = profile.level || "B1";
    const targetLang = profile.targetLang || "fr";
    const s = UI_STRINGS[profile.nativeLang] || UI_STRINGS.de;
    const langNames = s.langNames;

    if (practiceBanner) {
      const isTandem = partnerProfile && partnerProfile.nativeLang === targetLang;
      if (isTandem) {
        practiceBanner.textContent = `${s.practicing} ${langNames[targetLang] || targetLang} (${level}) | ${s.nativeSpeaker} (${langNames[partnerProfile.nativeLang]})`;
      } else {
        practiceBanner.textContent = `${s.practicing} ${langNames[targetLang] || targetLang} (${level})`;
      }
    }

    if (window.getPromptDeck) {
      currentDeck = window.getPromptDeck(level, targetLang);
      renderQuestionsList();
      renderVocabCards();
    }
  }

  // Show all questions as a plain list
  function renderQuestionsList() {
    if (!currentDeck || !questionsList) return;
    questionsList.innerHTML = "";
    (currentDeck.questions || []).forEach(q => {
      const li = document.createElement("li");
      li.textContent = q;
      questionsList.appendChild(li);
    });
  }

  // Vocab cards — no "+ Notiz" button
  function renderVocabCards() {
    if (!currentDeck || !vocabCardsContainer) return;
    const words = currentDeck.vocabulary || [];
    vocabCardsContainer.innerHTML = "";

    words.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<span><strong>${item.word}</strong>: <em>"${item.example}"</em></span>`;
      vocabCardsContainer.appendChild(li);
    });
  }

  connectBroker();
});
