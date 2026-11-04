/**
 * Spomegel WebRTC & Matchmaking Signaling Engine
 * Uses PeerJS (WebRTC audio/video/data) + public MQTT broker for instant matchmaking
 * No accounts, no servers, zero configuration needed on Vercel or local
 */

class SpomegelEngine {
  constructor(options = {}) {
    this.options = options;
    this.peer = null;
    this.myPeerId = null;
    this.partnerPeerId = null;
    this.localStream = null;
    this.currentCall = null;
    this.dataConn = null;
    this.mqttClient = null;
    this.state = "idle"; // "idle" | "searching" | "matched"

    this.profile = {
      mode: "video", // "video" | "audio" | "text"
      nativeLang: "de",
      targetLang: "fr",
      level: "B1",
      topic: "travel",
      motivation: "regular"
    };

    this.waitingPeers = new Map();
    this.searchStartTime = 0;
    this.searchInterval = null;

    // Event callbacks
    this.onStateChange = options.onStateChange || (() => {});
    this.onRemoteStream = options.onRemoteStream || (() => {});
    this.onLocalStream = options.onLocalStream || (() => {});
    this.onChatMessage = options.onChatMessage || (() => {});
    this.onPartnerLeft = options.onPartnerLeft || (() => {});
    this.onStatusUpdate = options.onStatusUpdate || (() => {});
  }

  /**
   * Initializes local media stream based on selected mode
   */
  async setupMedia(mode) {
    this.profile.mode = mode;

    if (this.localStream) {
      // If stream already matches mode, reuse it
      return this.localStream;
    }

    try {
      if (mode === "video") {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
      } else if (mode === "audio") {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true }
        });
      } else {
        // Text mode - no audio or video needed
        this.localStream = null;
      }

      if (this.localStream) {
        this.onLocalStream(this.localStream);
      }
      return this.localStream;
    } catch (err) {
      console.warn("Could not obtain requested media:", err);
      // Fallback to text mode if camera/mic permission denied
      this.localStream = null;
      this.profile.mode = "text";
      this.onStatusUpdate("Microphone/Camera permission denied. Switched to Text Mode.");
      return null;
    }
  }

  /**
   * Initializes PeerJS and public MQTT broker connection
   */
  async initPeer() {
    if (this.peer && !this.peer.destroyed && this.myPeerId) {
      return this.myPeerId;
    }

    return new Promise((resolve, reject) => {
      // Connect to free public PeerJS cloud
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const peerId = `spomegel-${Date.now().toString(36)}-${randomSuffix}`;

      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" }
          ]
        }
      });

      this.peer.on("open", (id) => {
        this.myPeerId = id;
        console.log("PeerJS ready with ID:", id);
        this.setupPeerListeners();
        this.setupMQTT();
        resolve(id);
      });

      this.peer.on("error", (err) => {
        console.error("PeerJS error:", err);
        this.onStatusUpdate(`Connection error: ${err.type || err.message}`);
      });
    });
  }

  /**
   * Listen for incoming calls & data connections
   */
  setupPeerListeners() {
    // Incoming video/audio call
    this.peer.on("call", (incomingCall) => {
      console.log("Incoming call from:", incomingCall.peer);
      this.currentCall = incomingCall;
      incomingCall.answer(this.localStream || undefined);

      incomingCall.on("stream", (remoteStream) => {
        console.log("Received remote media stream");
        this.onRemoteStream(remoteStream);
      });

      incomingCall.on("close", () => {
        this.handlePartnerDisconnect();
      });

      incomingCall.on("error", (err) => {
        console.error("Call error:", err);
      });
    });

    // Incoming data connection (chat, commands)
    this.peer.on("connection", (conn) => {
      console.log("Incoming data connection from:", conn.peer);
      this.setupDataConnection(conn);
    });
  }

  /**
   * Connect to public MQTT broker for matchmaking queue
   */
  setupMQTT() {
    if (this.mqttClient && this.mqttClient.connected) return;

    // Use EMQX public secure websocket broker
    const brokerUrl = "wss://broker.emqx.io:8084/mqtt";
    const clientId = `spm_${this.myPeerId}_${Math.random().toString(16).substr(2, 6)}`;

    this.mqttClient = mqtt.connect(brokerUrl, {
      clientId,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 3000
    });

    this.mqttClient.on("connect", () => {
      console.log("Connected to matchmaking broker");
      // Subscribe to personal handshake channel and global queue
      this.mqttClient.subscribe(`spomegel/peer/${this.myPeerId}`, { qos: 1 });
      this.mqttClient.subscribe(`spomegel/queue`, { qos: 0 });
    });

    this.mqttClient.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleBrokerMessage(topic, data);
      } catch (e) {
        // Ignore unparseable messages
      }
    });

    this.mqttClient.on("error", (err) => {
      console.warn("MQTT broker notice:", err.message);
    });
  }

  /**
   * Handle incoming messages from the matchmaking broker
   */
  handleBrokerMessage(topic, data) {
    if (topic === `spomegel/peer/${this.myPeerId}`) {
      // Private message to me
      if (data.type === "MATCH_OFFER" && this.state === "searching") {
        this.handleMatchOffer(data);
      } else if (data.type === "MATCH_ACCEPT" && this.state === "searching") {
        this.handleMatchAccepted(data);
      }
    } else if (topic === "spomegel/queue") {
      // Someone joined or updated in the queue
      if (data.peerId && data.peerId !== this.myPeerId && this.state === "searching") {
        this.evaluatePotentialMatch(data);
      }
    }
  }

  /**
   * Start searching for a stranger
   */
  async startSearch(userProfile) {
    this.profile = { ...this.profile, ...userProfile };
    this.state = "searching";
    this.searchStartTime = Date.now();
    this.waitingPeers.clear();
    this.onStateChange("searching");
    this.onStatusUpdate("Looking for a conversation partner...");

    await this.setupMedia(this.profile.mode);
    await this.initPeer();

    // Broadcast queue presence periodically
    this.broadcastQueuePresence();
    clearInterval(this.searchInterval);
    this.searchInterval = setInterval(() => {
      if (this.state === "searching") {
        this.broadcastQueuePresence();
      } else {
        clearInterval(this.searchInterval);
      }
    }, 2500);
  }

  broadcastQueuePresence() {
    if (!this.mqttClient || !this.mqttClient.connected || !this.myPeerId) return;

    const payload = {
      peerId: this.myPeerId,
      mode: this.profile.mode,
      nativeLang: this.profile.nativeLang,
      targetLang: this.profile.targetLang,
      level: this.profile.level,
      topic: this.profile.topic,
      timestamp: Date.now()
    };

    this.mqttClient.publish("spomegel/queue", JSON.stringify(payload));
  }

  /**
   * Checks if an incoming queue peer matches our language and mode preferences
   */
  evaluatePotentialMatch(candidate) {
    if (this.state !== "searching") return;

    // Must be same communication mode (Video with Video, Audio with Audio, Text with Text)
    if (candidate.mode !== this.profile.mode) return;

    const waitSeconds = (Date.now() - this.searchStartTime) / 1000;

    // Level 1: Perfect complementary match (e.g., I speak DE, want FR; they speak FR, want DE)
    const isComplementary =
      candidate.nativeLang === this.profile.targetLang &&
      candidate.targetLang === this.profile.nativeLang;

    // Level 2: Shared target language (both learning the same language)
    const isSameTarget = candidate.targetLang === this.profile.targetLang;

    // Level 3: Relaxed match if waiting more than 8 seconds
    const isRelaxedMatch = waitSeconds > 8;

    if (isComplementary || isSameTarget || isRelaxedMatch) {
      // Deterministic tie-breaker: peer with higher ID initiates the offer
      if (this.myPeerId > candidate.peerId) {
        this.sendMatchOffer(candidate);
      }
    }
  }

  sendMatchOffer(candidate) {
    console.log("Sending match offer to:", candidate.peerId);
    const offer = {
      type: "MATCH_OFFER",
      from: this.myPeerId,
      profile: this.profile
    };
    this.mqttClient.publish(`spomegel/peer/${candidate.peerId}`, JSON.stringify(offer));
  }

  handleMatchOffer(data) {
    if (this.state !== "searching") return;

    console.log("Received match offer from:", data.from);
    this.partnerPeerId = data.from;
    this.partnerProfile = data.profile;

    // Send accept back
    const accept = {
      type: "MATCH_ACCEPT",
      from: this.myPeerId,
      profile: this.profile
    };
    this.mqttClient.publish(`spomegel/peer/${data.from}`, JSON.stringify(accept));

    // Transition to matched
    this.finalizeMatch(data.from, data.profile, false);
  }

  handleMatchAccepted(data) {
    if (this.state !== "searching") return;

    console.log("Match accepted by:", data.from);
    this.partnerPeerId = data.from;
    this.partnerProfile = data.profile;

    // We initiated, so we start the WebRTC call and data connection
    this.finalizeMatch(data.from, data.profile, true);
  }

  /**
   * Finalizes the match and sets up WebRTC call & data channel
   */
  finalizeMatch(partnerId, partnerProfile, isInitiator) {
    this.state = "matched";
    clearInterval(this.searchInterval);
    this.onStateChange("matched", { partnerId, partnerProfile });
    this.onStatusUpdate("Connected with stranger!");

    if (isInitiator) {
      // Initiate data connection
      const conn = this.peer.connect(partnerId, { reliable: true });
      this.setupDataConnection(conn);

      // Initiate media call if in video or audio mode
      if (this.localStream) {
        const call = this.peer.call(partnerId, this.localStream);
        this.currentCall = call;
        call.on("stream", (remoteStream) => {
          this.onRemoteStream(remoteStream);
        });
        call.on("close", () => this.handlePartnerDisconnect());
      }
    }
  }

  setupDataConnection(conn) {
    this.dataConn = conn;

    conn.on("open", () => {
      console.log("Data connection open with:", conn.peer);
    });

    conn.on("data", (data) => {
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch(e) {}
      }

      if (data.type === "CHAT") {
        this.onChatMessage(data);
      } else if (data.type === "SKIP") {
        this.handlePartnerDisconnect(true);
      } else if (data.type === "TOPIC_UPDATE") {
        if (this.options.onTopicSync) this.options.onTopicSync(data);
      }
    });

    conn.on("close", () => {
      this.handlePartnerDisconnect();
    });
  }

  sendChatMessage(text) {
    if (!this.dataConn || !this.dataConn.open) return false;
    const msg = {
      type: "CHAT",
      sender: "me",
      text,
      timestamp: Date.now()
    };
    this.dataConn.send(msg);
    return true;
  }

  syncTopic(topicId, level) {
    if (!this.dataConn || !this.dataConn.open) return;
    this.dataConn.send({
      type: "TOPIC_UPDATE",
      topicId,
      level
    });
  }

  /**
   * Skip to the next stranger
   */
  skipPartner() {
    if (this.dataConn && this.dataConn.open) {
      try { this.dataConn.send({ type: "SKIP" }); } catch(e) {}
    }
    this.cleanupCall();
    // Restart search immediately
    this.startSearch(this.profile);
  }

  /**
   * Partner left or skipped
   */
  handlePartnerDisconnect(isSkip = false) {
    if (this.state !== "matched") return;
    console.log("Partner disconnected.");
    this.cleanupCall();
    this.onPartnerLeft(isSkip);
  }

  /**
   * Clean up active call and data connection while keeping local media
   */
  cleanupCall() {
    if (this.currentCall) {
      try { this.currentCall.close(); } catch(e) {}
      this.currentCall = null;
    }
    if (this.dataConn) {
      try { this.dataConn.close(); } catch(e) {}
      this.dataConn = null;
    }
    this.partnerPeerId = null;
    this.onRemoteStream(null);
  }

  /**
   * Leave call completely and return to lobby
   */
  leave() {
    this.state = "idle";
    clearInterval(this.searchInterval);
    this.cleanupCall();

    // Stop camera and microphone
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.mqttClient) {
      try {
        this.mqttClient.unsubscribe(`spomegel/queue`);
      } catch(e) {}
    }

    this.onStateChange("idle");
    this.onStatusUpdate("Left call");
  }

  toggleAudio(enabled) {
    if (!this.localStream) return;
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  toggleVideo(enabled) {
    if (!this.localStream) return;
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
}

window.SpomegelEngine = SpomegelEngine;
