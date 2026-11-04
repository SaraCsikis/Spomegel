# Spomegel 🌐

> **Sprach Omegle** — Minimalist, real-time text chat for language exchange with strangers.

---

## 🎯 Features

- **No Video / No Audio Permissions**: Pure text-based chat. No camera/microphone popups, zero setup, works everywhere.
- **Language & Level Pairing**: Select your native language, the language you want to learn, and your CEFR proficiency level (A1 – C2).
- **Goal & Topic Matching**: Specify your learning motivation and pick conversation topics (Travel, Daily Life, Food, Culture, Deep Questions).
- **Instant Stranger Matching**: Connects with strangers based on complementary language preferences.
- **Topic Deck & Vocabulary Helper**: Dynamic vocabulary cards and example sentences in your target language with one-click saving to your notes.
- **Progressive Icebreakers**: Guided questions that start with warm-up introductions and progressively advance in difficulty based on your selected level.
- **10-Minute Countdown Timer**: Prominent visual timer with warning indicators to keep chats focused.
- **Skip / Next Partner**: Instant skip (`Esc` key or button) to jump straight to the next stranger in the queue.
- **Personal Notes Section**: Built-in scratchpad saved automatically in your browser (`localStorage`) with one-click copy and `.txt` export.
- **Zero Accounts**: No sign-up, no passwords, no database — completely private and session-based.

---

## 🧪 How to Test Matching in 10 Seconds

Since Spomegel connects strangers in real time over a global matchmaking channel:
1. Open `index.html` in **Tab 1** (or Device 1) and click **"Find Stranger & Start Chat"**.
2. Open `index.html` in **Tab 2** (or Device 2) and click **"Find Stranger & Start Chat"**.
3. **Both tabs will instantly pair up!** You can type messages back and forth and test the timer, questions, and notes.

---

## 📁 Project Structure

```text
Spomegel/
├── index.html            # Main application UI (Lobby, Chat Room, Controls)
├── css/
│   └── style.css         # Ultra-simple, clean styling
├── js/
│   ├── app.js            # Matchmaking queue, real-time messaging, timer, UI
│   ├── prompts.js        # Multilingual vocabulary & progressive question decks
│   └── notes.js          # Persistent personal notes module (localStorage)
├── server.js             # Optional Node.js + Express static server
├── vercel.json           # 1-Click deployment config for Vercel
├── package.json          # Node scripts ("start": "node server.js")
└── README.md             # Project documentation
```

---

## 🚀 How to Run Locally

### Option 1: Direct in Browser
Open `index.html` directly in your browser:
```bash
open index.html
```

### Option 2: Using Node.js
```bash
npm install
npm start
# Then open http://localhost:3000
```

---

## ☁️ 1-Click Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the **Spomegel** repository.
3. Keep default settings (Framework: *Other*, Root Directory: `./`).
4. Click **Deploy**.
