/**
 * Spomegel - Direktes natives WebRTC über MQTT-Signaling (Zuverlässig & Schnell)
 */

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
  const skipBtn = document.getElementById("skipBtn");
  const leaveBtn = document.getElementById("leaveBtn");

  // Video-Bereich
  const videoSection = document.getElementById("videoSection");
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");

  // Chat-Elemente
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");

  // Status
  const practiceBanner = document.getElementById("practiceBanner");
  const searchStatusText = document.getElementById("searchStatusText");

  // Fragen & Wortschatz
  const currentQuestionText = document.getElementById("currentQuestionText");
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  const vocabCardsContainer = document.getElementById("vocabCardsContainer");
  const nextVocabBtn = document.getElementById("nextVocabBtn");

  // WebRTC & Status-Variablen
  let mqttClient = null;
  let pc = null;
  let localStream = null;
  let pendingCandidates = [];

  const myId = "usr_" + Math.random().toString(36).substring(2, 8);
  let partnerId = null;
  let currentRoomId = null;
  let state = "idle"; // "idle" | "searching" | "matched"
  let searchInterval = null;

  let profile = {
    mode: "video", // "video" | "text"
    nativeLang: "de",
    targetLang: "fr",
    level: "B1",
    motivation: "regular"
  };

  let currentDeck = null;
  let questionIndex = 0;
  let vocabOffset = 0;

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ]
  };

  // Kamera & Mikrofon holen
  async function initCamera() {
    if (localStream && localStream.active) return localStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: true
      });
      if (localVideo) {
        localVideo.srcObject = localStream;
        localVideo.muted = true; // Eigenes Video stummschalten (kein Echo)
        localVideo.play().catch(() => {});
      }
      return localStream;
    } catch (err) {
      console.error("Kamerafehler:", err);
      alert("Kamerazugriff fehlgeschlagen: " + (err.message || err.name));
      return null;
    }
  }

  // Natives WebRTC RTCPeerConnection erstellen
  function createPeerConnection(isInitiator) {
    if (pc) {
      try { pc.close(); } catch(e) {}
    }

    pc = new RTCPeerConnection(rtcConfig);
    pendingCandidates = [];

    // Lokale Kamera- und Audio-Spuren hinzufügen
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Wenn Videostream vom Fremden empfangen wird
    pc.ontrack = (event) => {
      console.log("[WebRTC] Fremder Stream empfangen:", event.streams[0]);
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.play().catch(err => {
          console.warn("[WebRTC] Autoplay blockiert, versuche stumm:", err);
          remoteVideo.muted = true;
          remoteVideo.play().catch(() => {});
        });
      }
    };

    // ICE-Kandidaten (Netzwerkpfade) über MQTT austauschen
    pc.onicecandidate = (event) => {
      if (event.candidate && currentRoomId && mqttClient) {
        mqttClient.publish(`spomegel/room/${currentRoomId}`, JSON.stringify({
          type: "SIGNAL_ICE",
          senderId: myId,
          candidate: event.candidate
        }));
      }
    };

    // Wenn Initiator: Offer (Verbindungsangebot) erstellen
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          console.log("[WebRTC] Erstelle Angebot (Offer)...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          mqttClient.publish(`spomegel/room/${currentRoomId}`, JSON.stringify({
            type: "SIGNAL_OFFER",
            senderId: myId,
            sdp: pc.localDescription
          }));
        } catch (e) {
          console.error("[WebRTC] Fehler beim Offer:", e);
        }
      };
    }
  }

  // MQTT-Verbindung aufbauen
  function connectBroker() {
    if (mqttClient && mqttClient.connected) return;

    mqttClient = mqtt.connect("wss://broker.emqx.io:8084/mqtt", {
      clientId: `spm_${myId}_${Math.random().toString(16).substring(2, 6)}`,
      clean: true,
      reconnectPeriod: 2500
    });

    mqttClient.on("connect", () => {
      mqttClient.subscribe(`spomegel/user/${myId}`, { qos: 1 });
    });

    mqttClient.on("message", (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        handleIncomingMessage(topic, data);
      } catch (e) {}
    });
  }

  async function handleIncomingMessage(topic, data) {
    // 1. Private Einladung
    if (topic === `spomegel/user/${myId}`) {
      if (data.type === "INVITE" && state === "searching") {
        partnerId = data.from;
        joinRoom(data.roomId, data.partnerProfile, false);
      }
    }
    // 2. Warteschlange
    else if (topic === "spomegel/queue") {
      if (state === "searching" && data.id && data.id !== myId) {
        checkMatchCandidate(data);
      }
    }
    // 3. Im Raum: Chat & WebRTC-Signale
    else if (topic === `spomegel/room/${currentRoomId}`) {
      if (data.senderId === myId) return; // Eigene Nachrichten ignorieren

      if (data.type === "CHAT") {
        appendChatMessage(data.text, "partner");
      }
      else if (data.type === "SIGNAL_OFFER") {
        console.log("[WebRTC] SIGNAL_OFFER empfangen");
        if (profile.mode === "video") {
          if (!pc) createPeerConnection(false);
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

          // Gespeicherte ICE-Kandidaten nachholen
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
        console.log("[WebRTC] SIGNAL_ANSWER empfangen");
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
        appendSystemMessage("Der Fremde hat die Verbindung getrennt.");
        setTimeout(() => {
          if (state === "matched") startSearch();
        }, 1200);
      }
    }
  }

  // Strenges Matchmaking
  function checkMatchCandidate(candidate) {
    if (state !== "searching") return;

    // Modus muss exakt übereinstimmen
    if (candidate.mode !== profile.mode) return;

    // Sprache muss exakt passen
    const isTandemMatch =
      candidate.nativeLang === profile.targetLang &&
      candidate.targetLang === profile.nativeLang;

    const isSharedPractice = candidate.targetLang === profile.targetLang;

    if (!isTandemMatch && !isSharedPractice) {
      return; // Kein passender Partner
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
      mqttClient.subscribe(`spomegel/room/${roomId}`, { qos: 1 });
    }

    // Video-Setup
    if (profile.mode === "video") {
      videoSection.classList.remove("hidden");
      // Initiator erstellt PeerConnection sofort, Receiver erstellt sie beim Offer oder vorbereitend
      createPeerConnection(isInitiator);
    } else {
      videoSection.classList.add("hidden");
    }

    // UI umschalten
    searchOverlay.classList.add("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.remove("hidden");

    clearChat();
    appendSystemMessage("Du bist jetzt mit einem Fremden verbunden. Sag Hallo!");
    setupPracticeDeck(partnerProfile);
  }

  async function startSearch() {
    state = "searching";
    currentRoomId = null;
    partnerId = null;

    searchOverlay.classList.remove("hidden");
    lobbyScreen.classList.add("hidden");
    callRoom.classList.add("hidden");

    if (searchStatusText) {
      searchStatusText.textContent = profile.mode === "video" 
        ? "Kamera aktivieren und nach passendem Video-Partner suchen..."
        : "Nach passendem Text-Partner im Netzwerk suchen...";
    }

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
    }, 2000);
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
    if (remoteVideo) remoteVideo.srcObject = null;
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

  function skip() {
    if (currentRoomId && mqttClient) {
      mqttClient.publish(
        `spomegel/room/${currentRoomId}`,
        JSON.stringify({ type: "LEAVE", senderId: myId })
      );
      mqttClient.unsubscribe(`spomegel/room/${currentRoomId}`);
    }
    cleanupCall();
    startSearch();
  }

  // Event Listener
  startBtn.addEventListener("click", () => {
    profile.mode = document.querySelector('input[name="mode"]:checked')?.value || "video";
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

  function setupPracticeDeck(partnerProfile) {
    const level = profile.level || "B1";
    const targetLang = profile.targetLang || "fr";

    const langNames = {
      en: "Englisch", de: "Deutsch", fr: "Französisch", es: "Spanisch", it: "Italienisch"
    };

    if (practiceBanner) {
      const isTandem = partnerProfile && partnerProfile.nativeLang === targetLang;
      if (isTandem) {
        practiceBanner.textContent = `Du übst: ${langNames[targetLang] || targetLang} (${level}) | Partner ist Muttersprachler (${langNames[partnerProfile.nativeLang]})`;
      } else {
        practiceBanner.textContent = `Du übst: ${langNames[targetLang] || targetLang} (${level})`;
      }
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
