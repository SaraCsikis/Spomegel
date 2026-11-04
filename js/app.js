/**
 * Spomegel - Zuverlässiges Matchmaking & natives WebRTC (Video + Audio/Mikrofon)
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
    mode: "video", // "video" | "text"
    nativeLang: "de",
    targetLang: "fr",
    level: "B1",
    motivation: "regular"
  };

  let currentDeck = null;
  let questionIndex = 0;

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ]
  };

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
        localVideo.muted = true; // Eigenes Video immer stumm
        await localVideo.play().catch(() => {});
      }
      return localStream;
    } catch (err) {
      console.error("Kamera/Mikrofon-Fehler:", err);
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

    // Lokale Kamera- und Mikrofonspuren einbinden
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Wenn der Audio-/Videostream des Partners ankommt
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

        remoteVideo.muted = false; // Partner-Audio aktivieren
        remoteVideo.volume = 1.0;

        remoteVideo.play().catch(err => {
          console.warn("[WebRTC] Autoplay blockiert, warte auf Klick:", err);
          document.addEventListener("click", () => {
            remoteVideo.muted = false;
            remoteVideo.play().catch(() => {});
          }, { once: true });
        });
      }
    };

    // ICE-Kandidaten über MQTT austauschen
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
      console.warn("[MQTT] Notiz:", err.message);
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
        appendSystemMessage("Der Fremde hat die Verbindung getrennt.");
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
    appendSystemMessage("Du bist jetzt mit einem Fremden verbunden. Sag Hallo!");
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

    if (searchStatusText) {
      searchStatusText.textContent = profile.mode === "video" 
        ? "Kamera & Mikrofon werden aktiviert... Suche nach Partner..."
        : "Suche nach passendem Text-Partner...";
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

    if (profile.nativeLang === profile.targetLang) {
      alert("Bitte wähle eine Zielsprache, die sich von deiner Muttersprache unterscheidet!");
      return;
    }

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

  // Zeigt direkt die vollständige längere Liste an Wörtern
  function renderVocabCards() {
    if (!currentDeck || !vocabCardsContainer) return;
    const words = currentDeck.vocabulary || [];
    vocabCardsContainer.innerHTML = "";

    words.forEach(item => {
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
    });
  }

  connectBroker();
});
