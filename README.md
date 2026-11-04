# Spomegel 🌐

> **Sprach Omegle** — Real-time peer-to-peer language exchange with strangers.

---

## 🎯 Features

- **Communication Modes**: Choose between **Video**, **Audio-Only**, or **Text-Only** chat before starting.
- **Language & Level Pairing**: Select your native language, the language you want to learn, and your CEFR proficiency level (A1 – C2).
- **Goal & Topic Matching**: Specify your learning motivation (Casual, Regular, Intensive) and pick conversation topics (Travel, Daily Life, Food, Culture, Deep Questions).
- **Instant Stranger Matching**: Connects with strangers based on complementary language preferences.
- **Topic Deck & Vocabulary Cheat Sheet**: Dynamic vocabulary cards and example sentences in your target language, with one-click saving to your notes.
- **Progressive Icebreakers**: Guided questions that start with warm-up introductions and progressively advance in difficulty based on your selected level.
- **10-Minute Countdown Timer**: Prominent visual timer with warning indicators to keep chats focused and energetic.
- **Skip / Next Partner**: Instant skip (`Esc` key or button) to jump straight to the next stranger in the queue.
- **Personal Notes Section**: Built-in scratchpad saved automatically in your browser (`localStorage`) with one-click copy and `.txt` export.
- **Zero Accounts**: No sign-up, no passwords, no database — completely private and session-based.

---

## 📁 Project Structure

```text
Spomegel/
├── index.html            # Main application UI (Lobby, Call Room, Controls)
├── css/
│   └── style.css         # Modern, responsive dark UI
├── js/
│   ├── app.js            # Main controller (Timer, UI state, Deck rendering)
│   ├── signaling.js      # WebRTC peer connection & matchmaking queue
│   ├── prompts.js        # Multilingual vocabulary & progressive question decks
│   └── notes.js          # Persistent personal notes module (localStorage)
├── server.js             # Optional Node.js + Express static server
├── vercel.json           # 1-Click deployment config for Vercel
├── package.json          # Node dependencies & start scripts
└── README.md             # Project documentation
```

---

## 🚀 How to Run Locally

### Option 1: Direct in Browser
Since Spomegel uses CDN-hosted WebRTC and serverless matchmaking, you can directly open `index.html` in your browser:
```bash
open index.html
```

### Option 2: Using Node.js
```bash
# Install dependencies
npm install

# Start local server
npm start
# Open http://localhost:3000
```

---

## ☁️ 1-Click Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the **Spomegel** repository.
3. Keep default settings (Framework: *Other*, Root Directory: `./`).
4. Click **Deploy**! 

The `vercel.json` and static structure are fully configured to run immediately without any extra setup.
