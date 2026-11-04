/**
 * Spomegel Main Application Controller
 * Handles UI transitions, 10-minute timer, vocab decks, chat, and media controls
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Notes Module
  if (window.NotesModule) {
    window.NotesModule.init();
  }

  // UI Elements
  const lobbyScreen = document.getElementById("lobbyScreen");
  const callRoom = document.getElementById("callRoom");
  const searchOverlay = document.getElementById("searchOverlay");
  const startBtn = document.getElementById("startBtn");
  const skipBtn = document.getElementById("skipBtn");
  const leaveBtn = document.getElementById("leaveBtn");
  const cancelSearchBtn = document.getElementById("cancelSearchBtn");

  // Media Elements
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
  const micToggleBtn = document.getElementById("micToggleBtn");
  const camToggleBtn = document.getElementById("camToggleBtn");
  const videoPlaceholder = document.getElementById("videoPlaceholder");

  // Chat Elements
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");

  // Timer & Practice Bar Elements
  const timerDisplay = document.getElementById("timerDisplay");
  const timerCircle = document.getElementById("timerCircle");
  const practiceBanner = document.getElementById("practiceBanner");

  // Topic & Vocab Elements
  const currentTopicTitle = document.getElementById("currentTopicTitle");
  const currentQuestionText = document.getElementById("currentQuestionText");
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  const vocabCardsContainer = document.getElementById("vocabCardsContainer");
  const nextVocabBtn = document.getElementById("nextVocabBtn");

  // Sidebar Tab Switching
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetPanel = document.getElementById(btn.dataset.tab);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });

  // State
  let currentDeck = null;
  let questionIndex = 0;
  let vocabOffset = 0;
  let isMicMuted = false;
  let isCamOff = false;

  // 10-Minute Timer State (10 * 60 = 600 seconds)
  const TOTAL_SECONDS = 600;
  let timerRemaining = TOTAL_SECONDS;
  let timerInterval = null;

  // Initialize WebRTC & Matchmaking Engine
  const engine = new SpomegelEngine({
    onStateChange: (state, data) => {
      if (state === "searching") {
        searchOverlay.classList.remove("hidden");
        lobbyScreen.classList.add("hidden");
        callRoom.classList.add("hidden");
      } else if (state === "matched") {
        searchOverlay.classList.add("hidden");
        lobbyScreen.classList.add("hidden");
        callRoom.classList.remove("hidden");
        startTimer();
        setupPracticeDeck(data?.partnerProfile);
      } else if (state === "idle") {
        searchOverlay.classList.add("hidden");
        callRoom.classList.add("hidden");
        lobbyScreen.classList.remove("hidden");
        resetTimer();
        clearChat();
      }
    },

    onLocalStream: (stream) => {
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.play().catch(() => {});
      }
    },

    onRemoteStream: (stream) => {
      if (remoteVideo) {
        if (stream) {
          remoteVideo.srcObject = stream;
          remoteVideo.play().catch(() => {});
          if (videoPlaceholder) videoPlaceholder.classList.add("hidden");
        } else {
          remoteVideo.srcObject = null;
          if (videoPlaceholder) videoPlaceholder.classList.remove("hidden");
        }
      }
    },

    onChatMessage: (msg) => {
      appendChatMessage(msg.text, "partner");
    },

    onPartnerLeft: (isSkip) => {
      appendSystemMessage(isSkip ? "Partner skipped to the next person." : "Partner disconnected.");
      // Prompt user or automatically search next
      setTimeout(() => {
        engine.skipPartner();
      }, 1000);
    },

    onStatusUpdate: (text) => {
      const statusPill = document.getElementById("searchStatusText");
      if (statusPill) statusPill.textContent = text;
    }
  });

  // Start Searching
  startBtn.addEventListener("click", () => {
    const mode = document.querySelector('input[name="mode"]:checked')?.value || "video";
    const nativeLang = document.getElementById("nativeLang").value;
    const targetLang = document.getElementById("targetLang").value;
    const level = document.getElementById("levelSelect").value;
    const motivation = document.getElementById("motivationSelect").value;
    const topic = document.getElementById("topicSelect").value;

    if (nativeLang === targetLang) {
      alert("Please select a target language different from your native language!");
      return;
    }

    engine.startSearch({
      mode,
      nativeLang,
      targetLang,
      level,
      motivation,
      topic
    });
  });

  // Cancel Search
  cancelSearchBtn.addEventListener("click", () => {
    engine.leave();
  });

  // Skip / Next Partner
  skipBtn.addEventListener("click", () => {
    appendSystemMessage("Searching for a new partner...");
    resetTimer();
    engine.skipPartner();
  });

  // Leave Call
  leaveBtn.addEventListener("click", () => {
    if (confirm("Leave this conversation and return to the lobby?")) {
      engine.leave();
    }
  });

  // Toggle Microphone
  micToggleBtn.addEventListener("click", () => {
    isMicMuted = !isMicMuted;
    engine.toggleAudio(!isMicMuted);
    micToggleBtn.classList.toggle("btn-danger", isMicMuted);
    micToggleBtn.innerHTML = isMicMuted ? "🔇 Mic Off" : "🎤 Mic On";
  });

  // Toggle Camera
  camToggleBtn.addEventListener("click", () => {
    isCamOff = !isCamOff;
    engine.toggleVideo(!isCamOff);
    camToggleBtn.classList.toggle("btn-danger", isCamOff);
    camToggleBtn.innerHTML = isCamOff ? "📷 Cam Off" : "📹 Cam On";
  });

  // Chat message send
  function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    const sent = engine.sendChatMessage(text);
    if (sent) {
      appendChatMessage(text, "me");
      chatInput.value = "";
    } else {
      appendSystemMessage("Chat not connected yet.");
    }
  }

  chatSendBtn.addEventListener("click", sendChat);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendChat();
    }
  });

  // Keyboard shortcut: ESC to skip to next partner
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && engine.state === "matched") {
      skipBtn.click();
    }
  });

  function appendChatMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chat-bubble chat-${sender}`;
    div.innerHTML = `<span class="sender-name">${sender === "me" ? "You" : "Stranger"}</span><p class="bubble-text"></p>`;
    div.querySelector(".bubble-text").textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendSystemMessage(text) {
    const div = document.createElement("div");
    div.className = "chat-system-msg";
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function clearChat() {
    chatMessages.innerHTML = "";
  }

  // 10-Minute Countdown Timer
  function startTimer() {
    resetTimer();
    timerRemaining = TOTAL_SECONDS;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timerRemaining--;
      updateTimerDisplay();

      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        appendSystemMessage("⏰ 10 minutes reached! Great job! Feel free to keep talking or click Next Partner.");
        alert("10 minutes reached! You can continue chatting or click Next Partner to practice with someone new.");
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
    if (timerDisplay) timerDisplay.textContent = formatted;

    // Visual color cues
    if (timerDisplay) {
      timerDisplay.classList.remove("timer-warning", "timer-danger");
      if (timerRemaining <= 60) {
        timerDisplay.classList.add("timer-danger");
      } else if (timerRemaining <= 180) {
        timerDisplay.classList.add("timer-warning");
      }
    }
  }

  // Setup Topic Deck & Vocabulary Cards
  function setupPracticeDeck(partnerProfile) {
    const myProfile = engine.profile;
    const topicId = myProfile.topic || "travel";
    const level = myProfile.level || "B1";
    const targetLang = myProfile.targetLang || "fr";

    // Update banner
    const langNames = {
      en: "English", de: "German", fr: "French", es: "Spanish", it: "Italian"
    };

    if (practiceBanner) {
      practiceBanner.innerHTML = `
        🎯 <strong>You are practicing:</strong> <span class="badge-lang">${langNames[targetLang] || targetLang}</span> (${level}) 
        &nbsp;|&nbsp; <strong>Topic:</strong> <span class="badge-topic">${topicId.toUpperCase()}</span>
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

    // Show 3 words at a time
    for (let i = 0; i < 3; i++) {
      const item = words[(vocabOffset + i) % words.length];
      if (!item) continue;
      const card = document.createElement("div");
      card.className = "vocab-card";
      card.innerHTML = `
        <div class="vocab-word">${item.word}</div>
        <div class="vocab-example">"${item.example}"</div>
        <button class="vocab-add-btn" title="Save to your notes">➕ Add to Notes</button>
      `;

      card.querySelector(".vocab-add-btn").addEventListener("click", () => {
        if (window.NotesModule) {
          window.NotesModule.appendNote(`• ${item.word}: ${item.example}`);
        }
      });

      vocabCardsContainer.appendChild(card);
    }
  }

  if (nextVocabBtn) {
    nextVocabBtn.addEventListener("click", () => {
      vocabOffset += 3;
      renderVocabCards();
    });
  }
});
