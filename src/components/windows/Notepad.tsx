import React, { memo, useState } from 'react';
import { loadSavedState, saveState } from '../../lib/storage';

export const NotepadWindow = memo(() => {
  const [content, setContent] = useState(() => {
    return loadSavedState().notes || 'Welcome to SUDHI OS Notepad!\n\nYour notes will persist automatically across refreshes.\nStart typing...';
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    saveState({ notes: text });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)' }}>
      <div style={{ padding: 8, borderBottom: '1px solid #222', display: 'flex', gap: 8, background: '#050505' }}>
        <button onClick={() => setContent('')} style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>🗑️ Clear</button>
      </div>

      <textarea value={content} onChange={handleChange} style={{ flex: 1, padding: 16, background: '#000', border: 'none', color: '#aaa', fontFamily: 'var(--font-mono)', fontSize: 13, resize: 'none', outline: 'none' }} />

      <div style={{ padding: '4px 12px', borderTop: '1px solid #222', background: '#050505', fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
        <span>Lines: {content.split('\n').length}</span>
        <span>Characters: {content.length}</span>
      </div>
    </div>
  );
});
export default NotepadWindow;
