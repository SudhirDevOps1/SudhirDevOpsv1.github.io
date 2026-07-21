import React, { memo, useState } from 'react';
import { Folder, FileText, Image as ImageIcon, Video, File, ChevronRight, HardDrive, Download, Eye, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: string;
  url?: string;
  fileType?: 'image' | 'video' | 'pdf' | 'text' | 'other';
  children?: FileNode[];
}

export const FileExplorerWindow = memo(() => {
  const { openWindow, addToast } = useOS();

  // Real Virtual File System representation including local and online files
  const [vfs, setVfs] = useState<FileNode[]>([
    {
      id: 'root-public',
      name: 'public',
      type: 'folder',
      path: '/public',
      children: [
        {
          id: 'public-resume',
          name: 'resume',
          type: 'folder',
          path: '/public/resume',
          children: [
            { id: 'resume-pdf', name: 'resume.pdf', type: 'file', path: '/public/resume/resume.pdf', size: '142 KB', fileType: 'pdf', url: '/resume/resume.pdf' }
          ]
        },
        {
          id: 'public-image',
          name: 'image',
          type: 'folder',
          path: '/public/image',
          children: [
            { id: 'img-personal', name: 'personal.png', type: 'file', path: '/public/image/personal.png', size: '420 KB', fileType: 'image', url: '/image/personal.png' },
            { id: 'img-logo-png', name: 'logo.png', type: 'file', path: '/public/image/logo.png', size: '280 KB', fileType: 'image', url: '/image/logo.png' },
            { id: 'img-logo-svg', name: 'logo.svg', type: 'file', path: '/public/image/logo.svg', size: '12 KB', fileType: 'image', url: '/image/logo.svg' }
          ]
        },
        {
          id: 'public-wallpaper',
          name: 'wallpaper',
          type: 'folder',
          path: '/public/wallpaper',
          children: [
            { id: 'wp-win11', name: 'win11_bloom.png', type: 'file', path: '/public/wallpaper/win11_bloom.png', size: '850 KB', fileType: 'image', url: '/wallpaper/win11_bloom.png' }
          ]
        },
        {
          id: 'public-video',
          name: 'video',
          type: 'folder',
          path: '/public/video',
          children: [
            { id: 'vid-sample', name: 'demo_presentation.mp4', type: 'file', path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', size: '12.4 MB', fileType: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
            { id: 'vid-nature', name: 'earth_from_space.mp4', type: 'file', path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', size: '18.1 MB', fileType: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
          ]
        }
      ]
    },
    {
      id: 'root-home',
      name: 'home',
      type: 'folder',
      path: '/home',
      children: [
        {
          id: 'home-sudhir',
          name: 'sudhir',
          type: 'folder',
          path: '/home/sudhir',
          children: [
            { id: 'file-notes', name: 'my_notes.txt', type: 'file', path: '/home/sudhir/my_notes.txt', size: '2 KB', fileType: 'text' },
            { id: 'file-projects', name: 'github_repos.json', type: 'file', path: '/home/sudhir/github_repos.json', size: '48 KB', fileType: 'text' }
          ]
        }
      ]
    }
  ]);

  const [currentFolder, setCurrentFolder] = useState<FileNode>(vfs[0]); // Start in /public
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [previewModalFile, setPreviewModalFile] = useState<FileNode | null>(null);

  const handleOpenFolder = (folder: FileNode) => {
    setCurrentFolder(folder);
    setSelectedNode(null);
  };

  const handleOpenFile = (file: FileNode) => {
    setSelectedNode(file);
    setPreviewModalFile(file);
    if (file.fileType === 'pdf') {
      addToast(`Opened PDF document: ${file.name}`, 'info');
    } else if (file.fileType === 'image') {
      openWindow('gallery');
      addToast(`Opened image in Gallery: ${file.name}`, 'success');
    } else if (file.fileType === 'video') {
      openWindow('videoplayer');
      addToast(`Playing video: ${file.name}`, 'success');
    } else if (file.fileType === 'text') {
      openWindow('notepad');
      addToast(`Opened text file: ${file.name}`, 'info');
    }
  };

  const createNewFile = () => {
    if (!newFileName.trim()) return;
    const isPdf = newFileName.endsWith('.pdf');
    const isImg = newFileName.endsWith('.png') || newFileName.endsWith('.jpg') || newFileName.endsWith('.svg');
    const isVid = newFileName.endsWith('.mp4') || newFileName.endsWith('.webm');
    
    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: 'file',
      path: `${currentFolder.path}/${newFileName}`,
      size: '1 KB',
      fileType: isPdf ? 'pdf' : isImg ? 'image' : isVid ? 'video' : 'text',
      url: newFileName.startsWith('http') ? newFileName : undefined,
    };

    const updatedChildren = [...(currentFolder.children || []), newFile];
    setCurrentFolder({ ...currentFolder, children: updatedChildren });
    setNewFileName('');
    addToast(`Created file: ${newFileName}`, 'success');
  };

  const deleteSelected = () => {
    if (!selectedNode) return;
    const updatedChildren = (currentFolder.children || []).filter(c => c.id !== selectedNode.id);
    setCurrentFolder({ ...currentFolder, children: updatedChildren });
    setSelectedNode(null);
    setPreviewModalFile(null);
    addToast(`Deleted: ${selectedNode.name}`, 'info');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', background: '#0a0d14', color: '#fff' }}>
      {/* Navigation Bar */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, background: '#101420' }}>
        <button
          onClick={() => setCurrentFolder(vfs[0])}
          style={{ padding: '4px 10px', border: '1px solid #333', background: '#0a0a0a', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}
        >
          🏠 /public
        </button>
        <div style={{ flex: 1, padding: '4px 10px', background: '#05070a', border: '1px solid #222', borderRadius: 4, color: '#aaa', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <HardDrive size={14} color="var(--accent)" />
          <span>{currentFolder.path}</span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="New file name (e.g. doc.pdf)..."
            style={{ padding: '4px 8px', background: '#000', border: '1px solid #333', borderRadius: 4, color: '#fff', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          />
          <button onClick={createNewFile} title="Create New File" style={{ padding: '4px 8px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Plus size={12} /> Add
          </button>
          {selectedNode && (
            <button onClick={deleteSelected} title="Delete File" style={{ padding: '4px 8px', border: '1px solid #FF4444', background: 'rgba(255,68,68,0.15)', color: '#FF4444', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar Folder Directory Tree */}
        <div style={{ width: 180, borderRight: '1px solid rgba(255,255,255,0.08)', padding: 12, background: '#0d1017' }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 }}>DIRECTORIES</div>
          {vfs.map(node => (
            <div
              key={node.id}
              onClick={() => handleOpenFolder(node)}
              style={{
                padding: '6px 8px', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                background: currentFolder.id === node.id ? 'rgba(var(--accent-rgb),0.15)' : 'transparent',
                color: currentFolder.id === node.id ? 'var(--accent)' : '#aaa', fontSize: 12, marginBottom: 4
              }}
            >
              <Folder size={14} color={currentFolder.id === node.id ? 'var(--accent)' : '#FFD700'} />
              <span>{node.name}</span>
            </div>
          ))}
        </div>

        {/* Main Files Grid */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
            {currentFolder.children?.map(item => {
              const isSelected = selectedNode?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNode(item)}
                  onDoubleClick={() => item.type === 'folder' ? handleOpenFolder(item) : handleOpenFile(item)}
                  style={{
                    padding: 12, border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    background: isSelected ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(0,0,0,0.3)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
                    {item.type === 'folder' ? (
                      <Folder size={36} color="#FFD700" />
                    ) : item.fileType === 'pdf' ? (
                      <FileText size={36} color="#FF5555" />
                    ) : item.fileType === 'image' ? (
                      <ImageIcon size={36} color="#FFB300" />
                    ) : item.fileType === 'video' ? (
                      <Video size={36} color="#BF00FF" />
                    ) : (
                      <File size={36} color="var(--accent)" />
                    )}
                  </div>
                  <div style={{ color: isSelected ? 'var(--accent)' : '#fff', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                    {item.name}
                  </div>
                  {item.size && <div style={{ color: '#666', fontSize: 9, marginTop: 4 }}>{item.size}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected File Preview Drawer */}
        {selectedNode && selectedNode.type === 'file' && (
          <div style={{ width: 260, borderLeft: '1px solid rgba(255,255,255,0.08)', padding: 14, background: '#0d1017', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 10 }}>FILE PREVIEW</div>

            {/* Live Media Embed Preview */}
            {selectedNode.fileType === 'image' && selectedNode.url && (
              <img src={selectedNode.url} alt={selectedNode.name} style={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 6, marginBottom: 12, border: '1px solid #222', background: '#000' }} />
            )}

            {selectedNode.fileType === 'video' && selectedNode.url && (
              <video src={selectedNode.url} controls style={{ width: '100%', maxHeight: 150, borderRadius: 6, marginBottom: 12, border: '1px solid #222', background: '#000' }} />
            )}

            {selectedNode.fileType === 'pdf' && (
              <div style={{ padding: 16, background: '#180a0a', border: '1px solid #FF444444', borderRadius: 6, textAlign: 'center', marginBottom: 12 }}>
                <FileText size={40} color="#FF5555" />
                <div style={{ fontSize: 11, color: '#FF8888', marginTop: 6, fontWeight: 'bold' }}>PDF Document</div>
                <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>{selectedNode.name}</div>
              </div>
            )}

            <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 'bold', marginBottom: 6, wordBreak: 'break-all' }}>
              {selectedNode.name}
            </div>
            <div style={{ color: '#aaa', fontSize: 10, marginBottom: 4 }}>Path: {selectedNode.path}</div>
            <div style={{ color: '#aaa', fontSize: 10, marginBottom: 14 }}>Size: {selectedNode.size || 'Unknown'}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
              <button
                onClick={() => handleOpenFile(selectedNode)}
                style={{ padding: '8px 14px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.2)', color: 'var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Eye size={14} /> Open / Play App
              </button>
              {selectedNode.url && (
                <a
                  href={selectedNode.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: '8px 14px', border: '1px solid #333', background: '#121520', color: '#ccc', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <ExternalLink size={14} /> Open Direct Link
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
export default FileExplorerWindow;
