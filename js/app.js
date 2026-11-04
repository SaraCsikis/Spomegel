/**
 * Spomegel - Video & Text Chat mit Matchmaking (Deutsch & Minimal)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Notizen-Modul initialisieren
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
  const skipBtn = document.getElementById("skipBtn");
  const leaveBtn = document.getElementById("leaveBtn");

  // Video-Elemente
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");

  // Chat-Elemente
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");

  // Status & Timer
  const timerDisplay = document.getElementById("timerDisplay");
  const practiceBanner = document.getElementById("practiceBanner");
  const searchStatusText = document.getElementById("searchStatusText");

  // Fragen & Wortschatz
  const currentQuestionText = document.getElementById("currentQuestionText");
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  const vocabCardsContainer = document.getElementById("vocabCardsContainer");
  const nextVocabBtn = document.getElementById("nextVocabBtn");

  // Status-Variablen
  let mqttClient = null;
  let peer = null;
  let myPeerId = "user_" + Math.random().toString(36).substring(2, 8);
  let partnerPeerId = null;
  let currentCall = null;
  let localStream = null;
  let currentRoomId = null;
  let state = "idle"; // "idle" | "searching" | "matched"
  let searchInterval = null;
  let searchStartTime = 0;

  let profile = {
    nativeLang: "de",
    targetLang: "fr",
    level: "B1",
    motivation: "regular"
  };

  let currentDeck = null;
  let questionIndex = 0;
  let vocabOffset = 0;

  // 10-Minuten-Timer (600 Sekunden)
  const TOTAL_SECONDS = 600;
  let timerRemaining = TOTAL_SECONDS;
  let timerInterval = null;

  // Kamera & Mikrofon starten
  async function initCamera() {
    if (localStream) return localStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: true
      });
      if (localVideo) {
        localVideo.srcObject = localStream;
        localVideo.play().catch(() => {});
      }
      return localStream;
    } catch (err) {
      console.warn("Kamera konnte nicht aktiviert werden:", err);
      return null;
    }
  }

  // PeerJS für Video initialisieren
  function initPeer() {
    if (peer && !peer.destroyed) return;

    peer = new Peer(myPeerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" }
        ]
      }
    });

    peer.on("open", (id) => {
      myPeerId = id;
      console.log("PeerJS bereit mit ID:", id);
    });

    peer.on("call", (incomingCall) => {
      console.log("Eingehender Video-Anruf von:", incomingCall.peer);
      currentCall = incomingCall;
      incomingCall.answer(localStream || undefined);

      incomingCall.on("stream", (remoteStream) => {
        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream;
          remoteVideo.play().catch(() => {});
        }
      });

      incomingCall.on("close", () => {
        if (remoteVideo) remoteVideo.srcObject = null;
      });
    });

    peer.on("error", (err) => {
      console.warn("PeerJS Hinweis:", err.type || err.message);
    });
  }

  // MQTT-Verbindung für Matchmaking & Textchat
  function connectBroker() {
    if (mqttClient && mqttClient.connected) return;

    mqttClient = mqtt.connect("wss://broker.emqx.io:8084/mqtt", {
      clientId: `spm_${myId}_${Math.random().toString(16).substring(2, 6)}`,
      clean: true,
      reconnectPeriod: 2500
    });

    mqttClient.on("connect", () => {
      mqttClient.subscribe(`spomegel/user/${myPeerId}`, { qos: 1 });
    });

    mqttClient.on("message", (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        handleIncomingMessage(topic, data);
      } catch (e) {}
    });
  }

  function handleIncomingMessage(topic, data) {
    if (topic === `spomegel/user/${myPeerId}`) {
      if (data.type === "INVITE" && state === "searching") {
        partnerPeerId = data.from;
        joinRoom(data.roomId, data.partnerProfile, false);
      }
    } else if (topic === "spomegel/queue") {
      if (state === "searching" && data.id && data.id !== myPeerId) {
        checkMatchCandidate(data);
      }
    } else if (topic === `spomegel/room/${currentRoomId}`) {
      if (data.type === "CHAT") {
        appendChatMessage(data.text, data.senderId === myPeerId ? "me" : "partner");
      } else if (data.type === "LEAVE") {
        appendSystemMessage("Der Fremde hat die Verbindung getrennt.");
        setTimeout(() => {
          if (state === "matched") startSearch();
        }, 1200);
      }
    }
  }

  function checkMatchCandidate(candidate) {
    if (state !== "searching") return;

    const waitSec = (Date.now() - searchStartTime) / 1000;
    const isComplementary =
      candidate.nativeLang === profile.targetLang &&
      candidate.targetLang === profile.nativeLang;

    const isSameTarget = candidate.targetLang === profile.targetLang;
    const isRelaxed = waitSec > 6;

    if (isComplementary || isSameTarget || isRelaxed) {
      if (myPeerId > candidate.id) {
        const roomId = "room_" + Math.random().toString(36).substring(2, 9);
        partnerPeerId = candidate.id;

        mqttClient.publish(
          `spomegel/user/${candidate.id}`,
          JSON.stringify({
            type: "INVITE",
            from: myPeerId,
            roomId: roomId,
            partnerProfile: profile
          })
        );

        joinRoom(roomId, candidate, true);
      }
    }
  }

  function joinRoom(roomId, partnerProfile, isInitiator) {
    state = "matched";
    currentRoomId = roomId;

    clearInterval(searchInterval);
    if (mqttClient) {
      mqttClient.unsubscribe("spomegel/queue");
      mqttClient.subscribe(`spomegel/room/${roomId}`, { qos: 1 });
    }

    // Video-Verbindung aufbauen
    if (isInitiator && partnerPeerId && localStream && peer) {
      setTimeout(() => {
        console.log("Starte Video-Anruf zu:", partnerPeerId);
        const call = peer.call(partnerPeerId, localStream);
        currentCall = call;
        call.on("stream", (remoteStream) => {
          if (remoteVideo) {
            remoteVideo.srcObject = remoteStream;
            remoteVideo.play().catch(() => {});
          }
        });
        call.on("close", () => {
          if (remoteVideo) remoteVideo.srcObject = null;
        });
      }, 500);
    }

    // UI umschalten
    searchOverlay.classList.add("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.remove("hidden");

    clearChat();
    appendSystemMessage("Du bist jetzt mit einem Fremden verbunden. Sag Hallo!");
    startTimer();
    setupPracticeDeck(partnerProfile);
  }

  async function startSearch() {
    state = "searching";
    searchStartTime = Date.now();
    currentRoomId = null;
    partnerPeerId = null;

    searchOverlay.classList.remove("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.add("hidden");

    if (searchStatusText) {
      searchStatusText.textContent = "Kamera aktivieren und nach Partner suchen...";
    }

    await initCamera();
    initPeer();
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
    }, 2000);
  }

  function broadcastQueuePresence() {
    if (!mqttClient || !mqttClient.connected || state !== "searching") return;

    const payload = {
      id: myPeerId,
      nativeLang: profile.nativeLang,
      targetLang: profile.targetLang,
      level: profile.level,
      timestamp: Date.now()
    };

    mqttClient.publish("spomegel/queue", JSON.stringify(payload));
  }

  function cleanupCall() {
    if (currentCall) {
      try { currentCall.close(); } catch(e) {}
      currentCall = null;
    }
    if (remoteVideo) remoteVideo.srcObject = null;
  }

  function leave() {
    if (currentRoomId && mqttClient) {
      mqttClient.publish(
        `spomegel/room/${currentRoomId}`,
        JSON.stringify({ type: "LEAVE" })
      );
      mqttClient.unsubscribe(`spomegel/room/${currentRoomId}`);
    }

    state = "idle";
    currentRoomId = null;
    partnerPeerId = null;
    clearInterval(searchInterval);
    cleanupCall();
    resetTimer();

    // Kamera stoppen
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    if (localVideo) localVideo.srcObject = null;

    searchOverlay.classList.add("hidden");
    callRoom.classList.add("hidden");
    lobbyScreen.classList.remove("hidden");
  }

  function skip() {
    if (currentRoomId && mqttClient) {
      mqttClient.publish(
        `spomegel/room/${currentRoomId}`,
        JSON.stringify({ type: "LEAVE" })
      );
      mqttClient.unsubscribe(`spomegel/room/${currentRoomId}`);
    }
    cleanupCall();
    resetTimer();
    startSearch();
  }

  // Event Listener
  startBtn.addEventListener("click", () => {
    profile.nativeLang = document.getElementById("nativeLang").value;
    profile.targetLang = document.getElementById("targetLang").value;
    profile.level = document.getElementById("levelSelect").value;
    profile.motivation = document.getElementById("motivationSelect").value;

    if (profile.nativeLang === profile.targetLang) {
      alert("Bitte wähle eine Zielsprache, die sich von deiner Muttersprache unterscheidet!");
      return;
    }

    startSearch();
  });

  cancelSearchBtn.addEventListener("click", leave);
  leaveBtn.addEventListener("click", () => {
    if (confirm("Verbindung trennen und zur Startseite zurückkehren?")) {
      leave();
    }
  });

  skipBtn.addEventListener("click", skip);

  function sendChat() {
    const text = chatInput.value.trim();
    if (!text || !currentRoomId || !mqttClient) return;

    mqttClient.publish(
      `spomegel/room/${currentRoomId}`,
      JSON.stringify({
        type: "CHAT",
        senderId: myPeerId,
        text: text
      })
    );

    chatInput.value = "";
  }

  chatSendBtn.addEventListener("click", sendChat);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChat();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state === "matched") {
      skip();
    }
  });

  function appendChatMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    const label = sender === "me" ? "Du: " : "Fremder: ";
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

  // 10-Minuten-Timer
  function startTimer() {
    resetTimer();
    timerRemaining = TOTAL_SECONDS;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timerRemaining--;
      updateTimerDisplay();

      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        appendSystemMessage("10 Minuten erreicht! Tolles Gespräch. Ihr könnt weiterreden oder auf Nächster Fremder klicken.");
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerRemaining = TOTAL_SECONDS;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;
    const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    if (timerDisplay) {
      timerDisplay.textContent = formatted;
      timerDisplay.classList.remove("warning", "danger");
      if (timerRemaining <= 60) {
        timerDisplay.classList.add("danger");
      } else if (timerRemaining <= 180) {
        timerDisplay.classList.add("warning");
      }
    }
  }

  // Deck & Wortschatz
  function setupPracticeDeck(partnerProfile) {
    const level = profile.level || "B1";
    const targetLang = profile.targetLang || "fr";

    const langNames = {
      en: "Englisch", de: "Deutsch", fr: "Französisch", es: "Spanisch", it: "Italienisch"
    };

    if (practiceBanner) {
      practiceBanner.textContent = `Du übst: ${langNames[targetLang] || targetLang} (${level})`;
    }

    if (window.getPromptDeck) {
      currentDeck = window.getPromptDeck(level, targetLang);
      questionIndex = 0;
      vocabOffset = 0;

      renderCurrentQuestion();
      renderVocabCards();
    }
  }

  function renderCurrentQuestion() {
    if (!currentDeck) return;
    const allQuestions = [...currentDeck.introQuestions, ...currentDeck.levelQuestions];
    const q = allQuestions[questionIndex % allQuestions.length];
    if (currentQuestionText) {
      currentQuestionText.textContent = q;
    }
  }

  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener("click", () => {
      questionIndex++;
      renderCurrentQuestion();
    });
  }

  function renderVocabCards() {
    if (!currentDeck || !vocabCardsContainer) return;
    const words = currentDeck.vocabulary || [];
    vocabCardsContainer.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      const item = words[(vocabOffset + i) % words.length];
      if (!item) continue;
      const li = document.createElement("li");
      li.innerHTML = `
        <span><strong>${item.word}</strong>: <em>"${item.example}"</em></span>
        <button class="small vocab-add-btn" title="Zu Notizen hinzufügen">+ Notiz</button>
      `;

      li.querySelector(".vocab-add-btn").addEventListener("click", () => {
        if (window.NotesModule) {
          window.NotesModule.appendNote(`• ${item.word}: ${item.example}`);
        }
      });

      vocabCardsContainer.appendChild(li);
    }
  }

  if (nextVocabBtn) {
    nextVocabBtn.addEventListener("click", () => {
      vocabOffset += 4;
      renderVocabCards();
    });
  }
});
