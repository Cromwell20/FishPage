import React, { useMemo, useRef, useState, useEffect } from "react";
import "./About.css";
import defaultData from "./defaultReplies.json";

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 9);
}
// --- search helpers ---
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove accents
}

// 1 substitution allowed (same length, <=1 different char)
function isOneSubstitution(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i] && ++diff > 1) return false;
  }
  return true;
}

// typed term is exactly one char shorter than a word in text
function isOneDeletionOf(longer, shorter) {
  if (longer.length !== shorter.length + 1) return false;
  let i = 0, j = 0, skipped = 0;
  while (i < longer.length && j < shorter.length) {
    if (longer[i] === shorter[j]) { i++; j++; }
    else {
      if (skipped) return false;
      skipped = 1;
      i++; // skip one char in the longer string
    }
  }
  return true; // trailing char is the one skip if needed
}

// term matches if: substring OR (>=3: one deletion) OR (>=4: one substitution)
function termMatches(haystackRaw, haystackWords, term) {
  if (!term) return true;
  if (haystackRaw.includes(term)) return true;

  // try fuzzy matches against individual words
  for (const w of haystackWords) {
    if (w === term) return true;
    if (term.length >= 3 && isOneDeletionOf(w, term)) return true;    // missing 1 letter
    if (term.length >= 4 && isOneSubstitution(w, term)) return true;  // 1 mistyped letter
  }
  return false;
}


export default function SavedRepliesLite() {
  const [replies, setReplies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const editorRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  // Keyboard shortcuts: Ctrl/Cmd+S to save, '/' to focus search
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      } else if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [title, tags, content, editingId, replies]);

const filtered = useMemo(() => {
  const terms = normalize(search).split(/\s+/).filter(Boolean); // AND terms
  return replies
    .filter((r) => {
      if (selectedTags.length && !selectedTags.every((t) => (r.tags || []).includes(t))) return false;
      if (!terms.length) return true;

      const raw = normalize(`${r.title || ""} ${r.content || ""} ${(r.tags || []).join(" ")}`);
      const words = raw.split(/[^a-z0-9]+/).filter(Boolean);

      return terms.every((t) => termMatches(raw, words, t));
    })
    .sort((a, b) => (b.updated || b.created || 0) - (a.updated || a.created || 0));
}, [replies, search, selectedTags]);


  const tagCounts = useMemo(() => {
    const m = new Map();
    replies.forEach((r) => (r.tags || []).forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [replies]);

function toggleTag(t) {
  setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
}

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setTags("");
    setContent("");
  }

  function onSave() {
    const t = title.trim();
    const c = content.trim();
    const tagList = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!t || !c) {
      alert("Please enter a title and content");
      return;
    }
    setReplies((prev) => {
      if (editingId) {
        return prev.map((r) =>
          r.id === editingId
            ? { ...r, title: t, content: c, tags: tagList, updated: Date.now() }
            : r
        );
      }
      return [...prev, { id: uid(), title: t, content: c, tags: tagList, created: Date.now() }];
    });
    resetForm();
  }

  function onEdit(id) {
    const r = replies.find((x) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setTitle(r.title);
    setTags((r.tags || []).join(", "));
    setContent(r.content);
       // Smooth-scroll so the editor sits at the bottom of the viewport
   requestAnimationFrame(() => {
     editorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
   });
  }

  function onDelete(id) {
    if (!window.confirm("Delete this saved reply?")) return;
    setReplies((prev) => prev.filter((r) => r.id !== id));
  }

  function onCopy(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => console.log("Copied"))
      .catch(() => window.prompt("Copy (fallback):", text));
  }

  function exportJSON() {
    const data = { replies, meta: { exportedAt: new Date().toISOString() } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved-replies-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSONFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result || ""));
        let incoming = [];
        if (Array.isArray(parsed)) incoming = parsed; // plain array support
        else if (parsed && Array.isArray(parsed.replies)) incoming = parsed.replies; // wrapped
        else throw new Error("Unsupported format");
        // normalize minimal fields
        const normalized = incoming.map((r) => ({
          id: r.id || uid(),
          title: r.title || "",
          content: r.content || "",
          tags: Array.isArray(r.tags)
            ? r.tags.filter(Boolean)
            : String(r.tags || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
          created: r.created || Date.now(),
          updated: r.updated,
        }));
        setReplies(normalized);
        alert("Imported.");
      } catch (err) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  }

function importDefault() {
  try {
    const parsed = defaultData;
    let incoming = [];
    if (Array.isArray(parsed)) incoming = parsed;
    else if (parsed && Array.isArray(parsed.replies)) incoming = parsed.replies;
    else throw new Error("Unsupported defaultReplies.json format");

    const normalized = incoming.map((r) => ({
      id: r.id || uid(),
      title: r.title || "",
      content: r.content || "",
      tags: Array.isArray(r.tags)
        ? r.tags.filter(Boolean)
        : String(r.tags || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      created: r.created || Date.now(),
      updated: r.updated,
    }));
    setReplies(normalized);
    alert("Default replies imported.");
  } catch (err) {
    alert("Import Default failed: " + err.message);
  }
}
const handleImportDefault = () => {
  try {
    const parsed = defaultData;
    const incoming = Array.isArray(parsed)
      ? parsed
      : (parsed && Array.isArray(parsed.replies) ? parsed.replies : []);
    if (!incoming) throw new Error("Unsupported defaultReplies.json format");

    const normalized = incoming.map((r) => ({
      id: r.id || uid(),
      title: r.title || "",
      content: r.content || "",
      tags: Array.isArray(r.tags)
        ? r.tags.filter(Boolean)
        : String(r.tags || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      created: r.created || Date.now(),
      updated: r.updated,
    }));

    setReplies(normalized);
    alert("Default replies imported.");
  } catch (err) {
    alert("Import Default failed: " + err.message);
  }
};

  return (
    <div className="saved-replies">

       <div className="topbar">
    {/* LEFT: search */}
    <div className="topbar-left">
      <input
        ref={searchRef}
        className="search-input"
        type="text"
        placeholder="Search replies or tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* CENTER: tags (stay in the middle and wrap here only) */}
    <div className="topbar-center">
      <div className="tag-bar">
        <button
  className="tag-btn"
  onClick={() => {
    setSelectedTags([]);
    setSearch("");          // also clear the search field
  }}
>
  All
</button>

        {tagCounts.map(([t, c]) => (
          <button
            key={t}
            className={`tag-btn ${selectedTags.includes(t) ? "selected" : ""}`}
            onClick={() => toggleTag(t)}
            title={`${c} items`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>

    {/* RIGHT: export/import stacked */}
    <div className="topbar-right">
       <button className="btn-sm" onClick={handleImportDefault}>
     Import Default
   </button>
      <button className="btn-sm" onClick={exportJSON}>Export JSON</button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJSONFile(f);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />
      <button className="btn-sm" onClick={() => fileInputRef.current?.click()}>Import JSON</button>
    </div>
  </div>

      {/* List */}
      <div style={{ marginTop: 12 }}>
        <strong>Saved replies</strong>
        {filtered.length === 0 && <div>No saved replies</div>}
        <ul>
          {filtered.map((r) => (
 <li key={r.id} className="reply-item">
   <div className="reply-actions">
     <button className="btn-sm" onClick={() => onEdit(r.id)}>Edit</button>
     <button className="btn-sm danger" onClick={() => onDelete(r.id)}>Del</button>
   </div>
   <div
     className="reply-body"
     title="Click to copy"
     onClick={(ev) => {
       const isBtn = ev.target instanceof HTMLElement && ev.target.tagName === "BUTTON";
       if (!isBtn) onCopy(r.content);
    }}
   >
     <div className="reply-title">{r.title}</div>
<div className="reply-content">{r.content}</div>
     <div className="reply-tags">
       {(r.tags || []).join(", ")}
     </div>
   </div>
 </li>
          ))}
        </ul>
      </div>

{/* Editor */}
<div className="editor-grid" ref={editorRef}>
  {/* Left column rows */}
  <label className="field">
    <input
      className="input"
      type="text"
      placeholder="Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  </label>

  {/* Right column: content (spans all three left rows) */}
  <textarea
    className="editor-content"
    placeholder="Reply content..."
    value={content}
    onChange={(e) => setContent(e.target.value)}
  />

  <label className="field">
    <input
      className="input"
      type="text"
      placeholder="Tags (comma separated)"
      value={tags}
      onChange={(e) => setTags(e.target.value)}
    />
  </label>

  <div className="editor-actions">
    <button className="btn-sm" onClick={onSave}>
      {editingId ? "Update" : "Save"}
    </button>
    {editingId && (
      <button className="btn-sm" onClick={resetForm}>
        Cancel
      </button>
    )}
  </div>
</div>

    </div>
  );
}
