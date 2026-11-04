/**
 * Spomegel Main Controller (Minimal & Simple)
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
  const micToggleBtn = document.getElementById("micToggleBtn");
  const camToggleBtn = document.getElementById("camToggleBtn");

  // Media
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
  const videoPlaceholder = document.getElementById("videoPlaceholder");

  // Chat
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
  let currentDeck = null;
  let questionIndex = 0;
  let vocabOffset = 0;
  let isMicMuted = false;
  let isCamOff = false;

  // 10-Minute Timer (600s)
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
      appendSystemMessage(isSkip ? "Partner skipped to the next stranger." : "Partner disconnected.");
      setTimeout(() => {
        engine.skipPartner();
      }, 1000);
    },

    onStatusUpdate: (text) => {
      if (searchStatusText) searchStatusText.textContent = text;
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
    appendSystemMessage("Looking for next partner...");
    resetTimer();
    engine.skipPartner();
  });

  // Leave Call
  leaveBtn.addEventListener("click", () => {
    if (confirm("Leave this conversation?")) {
      engine.leave();
    }
  });

  // Media Toggles
  micToggleBtn.addEventListener("click", () => {
    isMicMuted = !isMicMuted;
    engine.toggleAudio(!isMicMuted);
    micToggleBtn.textContent = isMicMuted ? "Unmute Mic" : "Mute Mic";
  });

  camToggleBtn.addEventListener("click", () => {
    isCamOff = !isCamOff;
    engine.toggleVideo(!isCamOff);
    camToggleBtn.textContent = isCamOff ? "Turn On Cam" : "Turn Off Cam";
  });

  // Chat
  function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    const sent = engine.sendChatMessage(text);
    if (sent) {
      appendChatMessage(text, "me");
      chatInput.value = "";
    } else {
      appendSystemMessage("Chat not connected.");
    }
  }

  chatSendBtn.addEventListener("click", sendChat);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendChat();
    }
  });

  // Hotkey: Esc to skip
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && engine.state === "matched") {
      skipBtn.click();
    }
  });

  function appendChatMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    const label = sender === "me" ? "You: " : "Partner: ";
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
    chatMessages.innerHTML = '<div class="chat-msg system">Chat started. Type a message below.</div>';
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
        appendSystemMessage("⏰ 10 minutes reached! Great chat. Continue or click Next Partner.");
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

  // Practice Deck & Vocab
  function setupPracticeDeck(partnerProfile) {
    const myProfile = engine.profile;
    const topicId = myProfile.topic || "travel";
    const level = myProfile.level || "B1";
    const targetLang = myProfile.targetLang || "fr";

    const langNames = {
      en: "English", de: "German", fr: "French", es: "Spanish", it: "Italian"
    };

    if (practiceBanner) {
      practiceBanner.innerHTML = `
        <strong>You are practicing:</strong> ${langNames[targetLang] || targetLang} (${level}) 
        | <strong>Topic:</strong> ${topicId.toUpperCase()}
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
});
