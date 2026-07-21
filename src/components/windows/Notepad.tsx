import React, { memo, useState, useRef, useCallback } from 'react';
import { Save, Trash2, Download, Search, Plus, X, Bold, Italic, Underline, AlignLeft } from 'lucide-react';
import { loadSavedState, saveState } from '../../lib/storage';

interface NoteFile {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  wordCount: number;
}

export const NotepadWindow = memo(() => {
  const [files, setFiles] = useState<NoteFile[]>(() => {
    const saved = loadSavedState();
    return saved.noteFiles || [
      { id: 'welcome', name: 'welcome.txt', content: 'Welcome to SUDHI OS Notepad! ✨\n\nThis is a real Notepad with:\n• Multiple tabs/files\n• Auto-save to browser storage\n• Word count & line count\n• Find & Replace\n• Download as .txt\n• Font size control\n\nStart typing to save automatically...', lastModified: new Date().toLocaleTimeString(), wordCount: 0 },
    ];
  });

  const [activeId, setActiveId] = useState('welcome');
  const [fontSize, setFontSize] = useState(13);
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [wordWrap, setWordWrap] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files.find(f => f.id === activeId) || files[0];

  const updateContent = useCallback((content: string) => {
    const now = new Date().toLocaleTimeString();
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const updated = files.map(f => f.id === activeId ? { ...f, content, lastModified: now, wordCount } : f);
    setFiles(updated);
    saveState({ noteFiles: updated });
  }, [activeId, files]);

  const newFile = () => {
    const id = `note-${Date.now()}`;
    const newNote: NoteFile = { id, name: `note-${files.length + 1}.txt`, content: '', lastModified: new Date().toLocaleTimeString(), wordCount: 0 };
    const updated = [...files, newNote];
    setFiles(updated);
    setActiveId(id);
    saveState({ noteFiles: updated });
  };

  const closeFile = (id: string) => {
    if (files.length === 1) return;
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    if (activeId === id) setActiveId(updated[0].id);
    saveState({ noteFiles: updated });
  };

  const renameFile = (id: string, name: string) => {
    const updated = files.map(f => f.id === id ? { ...f, name } : f);
    setFiles(updated);
    saveState({ noteFiles: updated });
  };

  const downloadFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = activeFile.name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFind = () => {
    if (!findText) return;
    const content = activeFile.content;
    const idx = content.toLowerCase().indexOf(findText.toLowerCase());
    if (idx !== -1 && textareaRef.current) {
      textareaRef.current.setSelectionRange(idx, idx + findText.length);
      textareaRef.current.focus();
    }
  };

  const handleReplace = () => {
    const newContent = activeFile.content.replace(new RegExp(findText, 'gi'), replaceText);
    updateContent(newContent);
  };

  const insertText = (before: string, after: string = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = activeFile.content.substring(start, end);
    const newContent = activeFile.content.substring(0, start) + before + sel + after + activeFile.content.substring(end);
    updateContent(newContent);
    setTimeout(() => ta.setSelectionRange(start + before.length, end + before.length), 0);
  };

  const lines = activeFile.content.split('\n').length;
  const words = activeFile.wordCount;
  const chars = activeFile.content.length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', background: '#0c0c0c' }}>
      {/* Menu Bar */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: 6, alignItems: 'center', background: '#090909', flexWrap: 'wrap' }}>
        <button onClick={newFile} title="New File" style={btnStyle}><Plus size={13} /> New</button>
        <button onClick={downloadFile} title="Download" style={btnStyle}><Download size={13} /> Save</button>
        <button onClick={() => updateContent('')} title="Clear" style={btnStyle}><Trash2 size={13} /> Clear</button>
        <div style={{ width: 1, height: 20, background: '#222' }} />
        <button onClick={() => insertText('**', '**')} title="Bold" style={btnStyle}><Bold size={13} /></button>
        <button onClick={() => insertText('_', '_')} title="Italic" style={btnStyle}><Italic size={13} /></button>
        <button onClick={() => insertText('~~', '~~')} title="Strikethrough" style={btnStyle}><Underline size={13} /></button>
        <div style={{ width: 1, height: 20, background: '#222' }} />
        <button onClick={() => setShowFind(v => !v)} style={{ ...btnStyle, color: showFind ? 'var(--accent)' : '#aaa' }}><Search size={13} /> Find</button>
        <div style={{ width: 1, height: 20, background: '#222' }} />
        <span style={{ color: '#555', fontSize: 10 }}>Font:</span>
        <button onClick={() => setFontSize(v => Math.max(10, v - 1))} style={smallBtn}>A-</button>
        <span style={{ color: '#666', fontSize: 10, minWidth: 20, textAlign: 'center' }}>{fontSize}</span>
        <button onClick={() => setFontSize(v => Math.min(24, v + 1))} style={smallBtn}>A+</button>
        <button onClick={() => setWordWrap(v => !v)} style={{ ...btnStyle, color: wordWrap ? 'var(--accent)' : '#aaa' }}><AlignLeft size={13} /></button>
      </div>

      {/* Find & Replace */}
      {showFind && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..."
            style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleFind()} />
          <input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace with..."
            style={inputStyle} />
          <button onClick={handleFind} style={accentBtn}>Find</button>
          <button onClick={handleReplace} style={accentBtn}>Replace All</button>
          <button onClick={() => setShowFind(false)} style={btnStyle}><X size={12} /></button>
        </div>
      )}

      {/* File Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', background: '#080808', overflowX: 'auto' }}>
        {files.map(f => (
          <div key={f.id}
            onClick={() => setActiveId(f.id)}
            style={{
              padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              borderRight: '1px solid #1a1a1a', whiteSpace: 'nowrap',
              background: f.id === activeId ? '#0c0c0c' : '#050505',
              borderBottom: f.id === activeId ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize: 11, color: f.id === activeId ? 'var(--accent)' : '#666',
              transition: 'all 0.15s',
            }}
          >
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => renameFile(f.id, e.currentTarget.textContent || f.name)}
              style={{ outline: 'none', minWidth: 40 }}
            >{f.name}</span>
            {files.length > 1 && (
              <span onClick={e => { e.stopPropagation(); closeFile(f.id); }} style={{ color: '#444', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</span>
            )}
          </div>
        ))}
        <button onClick={newFile} style={{ padding: '6px 10px', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}>+</button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={activeFile.content}
        onChange={e => updateContent(e.target.value)}
        spellCheck
        style={{
          flex: 1, padding: '14px 16px', background: '#0c0c0c', border: 'none', outline: 'none',
          color: '#d4d4d4', fontFamily: 'var(--font-mono)', fontSize: fontSize,
          resize: 'none', lineHeight: 1.7,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowX: wordWrap ? 'hidden' : 'auto',
          caretColor: 'var(--accent)',
        }}
        placeholder="Start typing..."
        autoFocus
      />

      {/* Status Bar */}
      <div style={{ padding: '4px 12px', borderTop: '1px solid #1a1a1a', background: '#060606', fontSize: 10, color: '#444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Ln {lines}, Col {(textareaRef.current?.selectionStart || 0) + 1}</span>
        <span style={{ color: '#333' }}>|</span>
        <span>{words} words · {chars} chars · {lines} lines</span>
        <span style={{ color: '#333' }}>|</span>
        <span>Saved {activeFile.lastModified}</span>
        <span style={{ color: '#333' }}>|</span>
        <span>UTF-8 · {wordWrap ? 'Wrap' : 'No wrap'}</span>
      </div>
    </div>
  );
});

const btnStyle: React.CSSProperties = {
  padding: '4px 8px', border: '1px solid #252525', background: '#111', color: '#aaa',
  borderRadius: 4, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
  fontFamily: 'var(--font-mono)',
};
const smallBtn: React.CSSProperties = {
  padding: '2px 6px', border: '1px solid #252525', background: '#111', color: '#aaa',
  borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)',
};
const accentBtn: React.CSSProperties = {
  padding: '4px 10px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)',
  color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', fontSize: 11,
};
const inputStyle: React.CSSProperties = {
  padding: '4px 8px', background: '#111', border: '1px solid #333', color: '#fff',
  borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none', width: 140,
};

export default NotepadWindow;
