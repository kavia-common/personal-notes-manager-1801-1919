import React, { useState, useEffect, useRef } from "react";
import "./style.css";

// Color theme constants
const COLORS = {
  primary: "#1976d2",
  secondary: "#424242",
  accent: "#ffca28",
  background: "#fff",
  text: "#222",
  grayLight: "#f6f7fa",
  grayDark: "#ddd",
};

function uuid() {
  // Simple unique id for demo notes
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// PUBLIC_INTERFACE
function loadNotes() {
  /** Loads notes from localStorage as an array of {id, title, content, updated} */
  try {
    const data = JSON.parse(localStorage.getItem("notes_v1") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
function saveNotes(notes) {
  /** Saves notes to localStorage */
  localStorage.setItem("notes_v1", JSON.stringify(notes));
}

// PUBLIC_INTERFACE
function NotesApp() {
  /**
   * Minimal Notes App main component. 
   * Layout: header at top, notes list sidebar at left, content/editor at right.
   */
  const [notes, setNotes] = useState(() => loadNotes());
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "" });

  const editorTitleRef = useRef(null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    // Focus title input when entering edit mode
    if (isEditing && editorTitleRef.current) editorTitleRef.current.focus();
  }, [isEditing, selectedId]);

  function handleSelect(id) {
    setSelectedId(id);
    setIsEditing(false);
    setDraft({ title: "", content: "" });
  }

  function handleNewNote() {
    setSelectedId(null);
    setIsEditing(true);
    setDraft({ title: "", content: "" });
  }

  function handleEditNote() {
    const note = notes.find((n) => n.id === selectedId);
    if (note) {
      setIsEditing(true);
      setDraft({ title: note.title, content: note.content });
    }
  }

  function handleDeleteNote(id) {
    if (!window.confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    setIsEditing(false);
  }

  function handleSaveNote() {
    if (!draft.title.trim()) return;
    if (selectedId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId
            ? { ...n, title: draft.title, content: draft.content, updated: Date.now() }
            : n
        )
      );
    } else {
      const newNote = {
        id: uuid(),
        title: draft.title,
        content: draft.content,
        updated: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedId(newNote.id);
    }
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setDraft({ title: "", content: "" });
  }

  // Filtering notes by search
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="notes-root" style={{
      background: COLORS.background, color: COLORS.text, minHeight: "100vh"
    }}>
      <header className="notes-header">
        <span className="notes-brand" style={{ color: COLORS.primary }}>
          🗒️ Notes
        </span>
        <nav>
          <button
            className="accent"
            style={{ background: COLORS.accent, color: COLORS.secondary }}
            onClick={handleNewNote}
          >
            + New Note
          </button>
        </nav>
      </header>
      <div className="notes-main">
        {/* Sidebar */}
        <aside className="notes-sidebar" style={{ borderRight: `1px solid ${COLORS.grayDark}` }}>
          <input
            className="notes-search"
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: `1px solid ${COLORS.grayDark}`,
              padding: "0.5em",
              margin: "1em 0",
              borderRadius: 6,
              width: "95%",
              background: COLORS.grayLight,
              color: COLORS.text,
            }}
          />
          <ul className="notes-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredNotes.length === 0 && (
              <li className="notes-list-empty">No notes found.</li>
            )}
            {filteredNotes.map((note) => (
              <li
                className={"notes-list-item" + (note.id === selectedId ? " selected" : "")}
                key={note.id}
                onClick={() => handleSelect(note.id)}
                style={{
                  background: note.id === selectedId ? COLORS.accent + "22" : "transparent",
                  borderRadius: 6,
                  marginBottom: 2,
                  padding: "0.6em 0.7em",
                  cursor: "pointer",
                  fontWeight: note.id === selectedId ? 600 : 400,
                }}
              >
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {note.title || <i>(No title)</i>}
                </div>
                <div className="notes-list-date" style={{ fontSize: "0.8em", color: COLORS.secondary }}>
                  {new Date(note.updated).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </aside>
        {/* Content / Editor */}
        <main className="notes-content">
          {/* If we're editing or new, show form */}
          {isEditing ? (
            <section className="note-editor">
              <input
                ref={editorTitleRef}
                type="text"
                className="note-title-input"
                autoFocus
                placeholder="Title"
                value={draft.title}
                maxLength={100}
                required
                onChange={e => setDraft(draft => ({ ...draft, title: e.target.value }))}
                style={{
                  fontSize: "1.5rem",
                  width: "99%",
                  padding: "0.6em",
                  marginBottom: "1em",
                  background: COLORS.grayLight,
                  border: `1px solid ${COLORS.grayDark}`,
                  borderRadius: 8,
                  color: COLORS.text,
                }}
              />
              <textarea
                className="note-content-input"
                placeholder="Type your note here..."
                value={draft.content}
                rows={14}
                style={{
                  width: "99%",
                  resize: "vertical",
                  background: COLORS.grayLight,
                  border: `1px solid ${COLORS.grayDark}`,
                  borderRadius: 8,
                  color: COLORS.text,
                  padding: "0.7em 0.8em",
                  marginBottom: "1.5em",
                  fontFamily: "inherit"
                }}
                onChange={e => setDraft(draft => ({ ...draft, content: e.target.value }))}
              />
              <div>
                <button
                  className="primary"
                  style={{ background: COLORS.primary, color: "#fff", marginRight: 10 }}
                  onClick={handleSaveNote}
                  disabled={!draft.title.trim()}
                  title={draft.title.trim() ? undefined : "Title required"}
                >
                  Save
                </button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            </section>
          ) : selectedNote ? (
            <section className="note-viewer">
              <div>
                <h2 style={{
                  color: COLORS.primary, margin: "0 0 0.2em 0", fontWeight: 500
                }}>
                  {selectedNote.title || <i>(No title)</i>}
                </h2>
                <div className="notes-timestamp" style={{ color: COLORS.secondary, fontSize: "0.9em" }}>
                  Edited: {new Date(selectedNote.updated).toLocaleString()}
                </div>
                <hr />
                <article
                  className="note-content"
                  style={{
                    margin: "1.3em 0 2em 0",
                    whiteSpace: "pre-wrap",
                    fontSize: "1.08rem",
                    lineHeight: 1.74,
                  }}
                >
                  {selectedNote.content}
                </article>
                <div style={{ marginTop: "2em" }}>
                  <button
                    onClick={handleEditNote}
                    className="primary"
                    style={{ background: COLORS.primary, color: "#fff", marginRight: 10 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="secondary"
                    style={{ background: COLORS.secondary, color: "#fff" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="note-empty">
              <div style={{ color: COLORS.secondary, fontSize: "1.12em", marginTop: 80 }}>
                <p>Select a note or create a new one to get started.</p>
              </div>
            </section>
          )}
        </main>
      </div>
      <footer className="notes-footer">
        <span>Built with <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">Vite</a></span>
      </footer>
    </div>
  );
}

export default NotesApp;
