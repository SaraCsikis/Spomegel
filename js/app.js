/**
 * Spomegel - Ultra-Simple Text Chat & Matchmaking Engine
 * Uses public MQTT over WebSockets for instant, zero-server stranger pairing
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Notes Module
  if (window.NotesModule) {
    window.NotesModule.init();
  }

  // Screens
  const lobbyScreen = document.getElementById("lobbyScreen");
  const callRoom = document.getElementById("callRoom");
  const searchOverlay = document.getElementById("searchOverlay");

  // Buttons
  const startBtn = document.getElementById("startBtn");
  const cancelSearchBtn = document.getElementById("cancelSearchBtn");
  const skipBtn = document.getElementById("skipBtn");
  const leaveBtn = document.getElementById("leaveBtn");

  // Chat Elements
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");

  // Status & Timer
  const timerDisplay = document.getElementById("timerDisplay");
  const practiceBanner = document.getElementById("practiceBanner");
  const searchStatusText = document.getElementById("searchStatusText");

  // Topic & Vocab
  const currentTopicTitle = document.getElementById("currentTopicTitle");
  const currentQuestionText = document.getElementById("currentQuestionText");
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  const vocabCardsContainer = document.getElementById("vocabCardsContainer");
  const nextVocabBtn = document.getElementById("nextVocabBtn");

  // State
  let mqttClient = null;
  let myId = "user_" + Math.random().toString(36).substring(2, 8);
  let currentRoomId = null;
  let state = "idle"; // "idle" | "searching" | "matched"
  let searchInterval = null;
  let searchStartTime = 0;

  let profile = {
    nativeLang: "de",
    targetLang: "fr",
    level: "B1",
    motivation: "regular",
    topic: "travel"
  };

  let currentDeck = null;
  let questionIndex = 0;
  let vocabOffset = 0;

  // 10-Minute Timer (600s)
  const TOTAL_SECONDS = 600;
  let timerRemaining = TOTAL_SECONDS;
  let timerInterval = null;

  // Connect to public secure MQTT broker
  function connectBroker() {
    if (mqttClient && mqttClient.connected) return;

    // Connect to EMQX public websocket broker
    mqttClient = mqtt.connect("wss://broker.emqx.io:8084/mqtt", {
      clientId: `spm_${myId}_${Math.random().toString(16).substring(2, 6)}`,
      clean: true,
      reconnectPeriod: 2500
    });

    mqttClient.on("connect", () => {
      console.log("Connected to Spomegel network. My ID:", myId);
      // Subscribe to private channel for match invitations
      mqttClient.subscribe(`spomegel/user/${myId}`, { qos: 1 });
    });

    mqttClient.on("message", (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        handleIncomingMessage(topic, data);
      } catch (e) {
        // Ignore unparseable
      }
    });

    mqttClient.on("error", (err) => {
      console.warn("Network notice:", err.message);
    });
  }

  // Handle incoming messages
  function handleIncomingMessage(topic, data) {
    // 1. Direct invitation received
    if (topic === `spomegel/user/${myId}`) {
      if (data.type === "INVITE" && state === "searching") {
        console.log("Matched with partner via invite from:", data.from);
        joinRoom(data.roomId, data.partnerProfile);
      }
    }
    // 2. Queue broadcast
    else if (topic === "spomegel/queue") {
      if (state === "searching" && data.id && data.id !== myId) {
        checkMatchCandidate(data);
      }
    }
    // 3. In-Room Chat Message or Command
    else if (topic === `spomegel/room/${currentRoomId}`) {
      if (data.type === "CHAT") {
        appendChatMessage(data.text, data.senderId === myId ? "me" : "partner");
      } else if (data.type === "LEAVE") {
        appendSystemMessage("Stranger has disconnected.");
        setTimeout(() => {
          if (state === "matched") startSearch();
        }, 1200);
      }
    }
  }

  // Check if someone in the queue matches our criteria
  function checkMatchCandidate(candidate) {
    if (state !== "searching") return;

    const waitSec = (Date.now() - searchStartTime) / 1000;

    // Check language match
    const isComplementary =
      candidate.nativeLang === profile.targetLang &&
      candidate.targetLang === profile.nativeLang;

    const isSameTarget = candidate.targetLang === profile.targetLang;
    const isRelaxedMatch = waitSec > 6; // Pair with anyone waiting if > 6s

    if (isComplementary || isSameTarget || isRelaxedMatch) {
      // Deterministic tie-breaker: user with higher ID creates room
      if (myId > candidate.id) {
        const roomId = "room_" + Math.random().toString(36).substring(2, 9);
        console.log("Inviting candidate:", candidate.id, "to room:", roomId);

        // Send direct invite
        mqttClient.publish(
          `spomegel/user/${candidate.id}`,
          JSON.stringify({
            type: "INVITE",
            from: myId,
            roomId: roomId,
            partnerProfile: profile
          })
        );

        // Join room ourselves
        joinRoom(roomId, candidate);
      }
    }
  }

  // Join chat room
  function joinRoom(roomId, partnerProfile) {
    state = "matched";
    currentRoomId = roomId;

    clearInterval(searchInterval);
    if (mqttClient) {
      mqttClient.unsubscribe("spomegel/queue");
      mqttClient.subscribe(`spomegel/room/${roomId}`, { qos: 1 });
    }

    // Switch UI
    searchOverlay.classList.add("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.remove("hidden");

    // Setup chat & deck
    clearChat();
    appendSystemMessage("You are now connected with a stranger! Say hi!");
    startTimer();
    setupPracticeDeck(partnerProfile);
  }

  // Start Searching
  function startSearch() {
    state = "searching";
    searchStartTime = Date.now();
    currentRoomId = null;

    searchOverlay.classList.remove("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.add("hidden");

    if (searchStatusText) {
      searchStatusText.textContent = "Looking for someone to practice with...";
    }

    connectBroker();

    // Subscribe to matchmaking queue
    if (mqttClient && mqttClient.connected) {
      mqttClient.subscribe("spomegel/queue", { qos: 0 });
    }

    // Broadcast presence every 2 seconds
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
      id: myId,
      nativeLang: profile.nativeLang,
      targetLang: profile.targetLang,
      level: profile.level,
      topic: profile.topic,
      timestamp: Date.now()
    };

    mqttClient.publish("spomegel/queue", JSON.stringify(payload));
  }

  // Disconnect / Leave
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
    clearInterval(searchInterval);
    resetTimer();

    searchOverlay.classList.add("hidden");
    callRoom.classList.add("hidden");
    lobbyScreen.classList.remove("hidden");
  }

  // Skip / Next
  function skip() {
    if (currentRoomId && mqttClient) {
      mqttClient.publish(
        `spomegel/room/${currentRoomId}`,
        JSON.stringify({ type: "LEAVE" })
      );
      mqttClient.unsubscribe(`spomegel/room/${currentRoomId}`);
    }
    resetTimer();
    startSearch();
  }

  // UI Event Handlers
  startBtn.addEventListener("click", () => {
    profile.nativeLang = document.getElementById("nativeLang").value;
    profile.targetLang = document.getElementById("targetLang").value;
    profile.level = document.getElementById("levelSelect").value;
    profile.motivation = document.getElementById("motivationSelect").value;
    profile.topic = document.getElementById("topicSelect").value;

    if (profile.nativeLang === profile.targetLang) {
      alert("Please choose a target language different from your native language!");
      return;
    }

    startSearch();
  });

  cancelSearchBtn.addEventListener("click", leave);
  leaveBtn.addEventListener("click", () => {
    if (confirm("Disconnect and return to the start screen?")) {
      leave();
    }
  });

  skipBtn.addEventListener("click", skip);

  // Chat input
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

    chatInput.value = "";
  }

  chatSendBtn.addEventListener("click", sendChat);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChat();
  });

  // Hotkey: Esc to skip
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state === "matched") {
      skip();
    }
  });

  function appendChatMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    const label = sender === "me" ? "You: " : "Stranger: ";
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

  // 10-Minute Timer
  function startTimer() {
    resetTimer();
    timerRemaining = TOTAL_SECONDS;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timerRemaining--;
      updateTimerDisplay();

      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        appendSystemMessage("⏰ 10 minutes reached! Great conversation. Continue or click Next Stranger.");
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

  // Setup Topic & Vocab Deck
  function setupPracticeDeck(partnerProfile) {
    const topicId = profile.topic || "travel";
    const level = profile.level || "B1";
    const targetLang = profile.targetLang || "fr";

    const langNames = {
      en: "English", de: "German", fr: "French", es: "Spanish", it: "Italian"
    };

    if (practiceBanner) {
      practiceBanner.innerHTML = `
        <span>🎯 <strong>You are practicing:</strong> ${langNames[targetLang] || targetLang} (${level})</span>
        <span><strong>Topic:</strong> ${topicId.toUpperCase()}</span>
      `;
    }

    if (window.getPromptDeck) {
      currentDeck = window.getPromptDeck(topicId, level, targetLang);
      questionIndex = 0;
      vocabOffset = 0;

      if (currentTopicTitle) currentTopicTitle.textContent = currentDeck.topicTitle;
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
        <button class="small vocab-add-btn" title="Save to notes">+ Note</button>
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

  // Pre-connect broker in background
  connectBroker();
});
