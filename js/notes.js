/**
 * Spomegel Notizen-Modul (Sehr einfach)
 * Speichert Notizen automatisch im Browser
 */

const NotesModule = {
  storageKey: "spomegel_user_notes",

  init() {
    this.textarea = document.getElementById("notesTextarea");
    this.statusEl = document.getElementById("notesSaveStatus");

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
          setTimeout(() => { if (this.statusEl) this.statusEl.textContent = ""; }, 1500);
        }
      }, 400);
    });
  },

  appendNote(text) {
    if (!this.textarea) return;
    this.textarea.value += (this.textarea.value ? "\n" : "") + text;
    localStorage.setItem(this.storageKey, this.textarea.value);
    if (this.statusEl) {
      this.statusEl.textContent = "Gespeichert";
      setTimeout(() => { if (this.statusEl) this.statusEl.textContent = ""; }, 1500);
    }
  }
};

window.NotesModule = NotesModule;
