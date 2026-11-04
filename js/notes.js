/**
 * Spomegel Notizen-Modul
 * Speichert Notizen lokal im Browser (localStorage)
 */

const NotesModule = {
  storageKey: "spomegel_user_notes",

  init() {
    this.textarea = document.getElementById("notesTextarea");
    this.statusEl = document.getElementById("notesSaveStatus");
    this.copyBtn = document.getElementById("notesCopyBtn");
    this.downloadBtn = document.getElementById("notesDownloadBtn");
    this.clearBtn = document.getElementById("notesClearBtn");

    if (!this.textarea) return;

    // Gespeicherte Notizen laden
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.textarea.value = saved;
    }

    // Automatisches Speichern beim Tippen
    let timeout = null;
    this.textarea.addEventListener("input", () => {
      if (this.statusEl) this.statusEl.textContent = "Speichern...";
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(this.storageKey, this.textarea.value);
        if (this.statusEl) {
          this.statusEl.textContent = "Gespeichert";
          setTimeout(() => { if (this.statusEl) this.statusEl.textContent = ""; }, 2000);
        }
      }, 500);
    });

    if (this.copyBtn) {
      this.copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(this.textarea.value).then(() => {
          const original = this.copyBtn.textContent;
          this.copyBtn.textContent = "Kopiert!";
          setTimeout(() => { this.copyBtn.textContent = original; }, 2000);
        });
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        const text = this.textarea.value;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spomegel-notizen-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => {
        if (confirm("Notizen wirklich löschen?")) {
          this.textarea.value = "";
          localStorage.removeItem(this.storageKey);
        }
      });
    }
  },

  appendNote(text) {
    if (!this.textarea) return;
    this.textarea.value += (this.textarea.value ? "\n" : "") + text;
    localStorage.setItem(this.storageKey, this.textarea.value);
  }
};

window.NotesModule = NotesModule;
