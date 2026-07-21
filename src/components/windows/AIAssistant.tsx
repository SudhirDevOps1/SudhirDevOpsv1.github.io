import React, { memo, useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, Code, Terminal, Zap, RefreshCw, HelpCircle } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const PRESET_PROMPTS = [
  "Who is Sudhir Singh?",
  "What are Sudhir's top technical skills?",
  "Show me Sudhir's major GitHub projects",
  "How to contact Sudhir for hire/projects?",
  "How was this Web OS built?",
  "Give me a quick summary of Sudhir's resume"
];

export const AIAssistantWindow = memo(() => {
  const { openWindow } = useOS();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "👋 Hi! I am **Sudhir OS AI Assistant**. I can answer questions about Sudhir Singh's projects, skills, education, or control system features. Ask me anything!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('who is') || q.includes('about') || q.includes('sudhir')) {
      return "👤 **Sudhir Singh** is a passionate **Full-Stack & DevOps Engineer** from Bihar, India. He is currently pursuing his **BCA degree** and has built over **87+ public repositories** on GitHub (@SudhirDevOps1) specializing in React, TypeScript, Node.js, Docker, Kubernetes, and Cloud Architecture.";
    }

    if (q.includes('skill') || q.includes('stack') || q.includes('language') || q.includes('technology')) {
      return "⚡ **Sudhir's Core Stack:**\n\n- **Frontend:** React.js, TypeScript, Next.js, TailwindCSS, HTML5/CSS3\n- **Backend:** Node.js, Express, Python, REST APIs, GraphQL\n- **DevOps & Cloud:** Docker, Kubernetes, CI/CD Pipelines, GitHub Actions, Linux Administration, Nginx, AWS\n- **Databases:** MongoDB, PostgreSQL, Redis";
    }

    if (q.includes('project') || q.includes('repo') || q.includes('github') || q.includes('work')) {
      return "📁 **Top Projects by Sudhir:**\n\n1. **SUDHI OS 3.0** — Interactive Web Desktop OS built with React + Vite.\n2. **DevOps Automation Suite** — CI/CD pipelines & Docker orchestration setups.\n3. **Full-Stack SaaS Portals** — Production web apps with live API integrations.\n\n💡 *Tip: You can open the **PROJECTS/** app on desktop to view live GitHub repos!*";
    }

    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('reach')) {
      return "✉️ **Contact Details:**\n\n- **GitHub:** [SudhirDevOps1](https://github.com/SudhirDevOps1)\n- **Location:** Bihar, India\n- **Status:** Open for DevOps & Full-Stack Engineering Roles / Freelance Work!\n\n💡 *Tip: Double-click the **CONTACT.mail** app on desktop to send a direct message.*";
    }

    if (q.includes('resume') || q.includes('cv')) {
      return "📄 **Resume Summary:**\n\nSudhir Singh is a BCA student with deep hands-on expertise in DevOps tools, containerization, modern web frontend/backend engineering, and open-source contribution.\n\n💡 *You can view his PDF resume in the **EXPLORER.exe** app under `/public/resume/`!*";
    }

    if (q.includes('how') && (q.includes('built') || q.includes('make') || q.includes('os'))) {
      return "🛠️ **How SUDHI OS was built:**\n\n- Built using **React 18 + TypeScript + Vite**\n- Singlefile inlining for production portability\n- Integrated 7+ live public APIs (Open-Meteo, CoinGecko, SpaceX, REST Countries, USGS)\n- Custom Windows 11 snap zones, taskbar, Alt+Tab overlay, and live desktop widgets.";
    }

    if (q.includes('open') || q.includes('launch') || q.includes('app')) {
      if (q.includes('terminal')) { openWindow('terminal'); return "🚀 Opening **Terminal** for you..."; }
      if (q.includes('project')) { openWindow('projects'); return "📂 Opening **Projects** browser..."; }
      if (q.includes('weather')) { openWindow('weather'); return "⛅ Opening **Weather** app..."; }
      if (q.includes('crypto')) { openWindow('crypto'); return "₿ Opening **Crypto** tracker..."; }
      if (q.includes('music')) { openWindow('music-player'); return "🎵 Opening **Music Player**..."; }
    }

    return `🤖 Thanks for asking! I'm trained on Sudhir Singh's portfolio data. Sudhir is a BCA student and DevOps/Full-Stack engineer with 87+ repositories. You can explore his apps on the desktop or ask me specifically about his **skills**, **projects**, **resume**, or **contact info**!`;
  };

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateAIResponse(q);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0b0d14', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      {/* AI Header */}
      <div style={{ padding: '10px 14px', background: '#0e111a', borderBottom: '1px solid #1a1e2e', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ padding: 6, borderRadius: 8, background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)', display: 'flex' }}>
          <Bot size={18} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
            SUDHI AI ASSISTANT <span style={{ fontSize: 9, background: '#00FF8822', color: '#00FF88', padding: '1px 6px', borderRadius: 4, border: '1px solid #00FF8844' }}>ONLINE</span>
          </div>
          <div style={{ fontSize: 9, color: '#666' }}>Powered by Portfolio Knowledge Base</div>
        </div>
      </div>

      {/* Preset Quick Prompts */}
      <div style={{ padding: '8px 10px', background: '#080a10', borderBottom: '1px solid #141724', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {PRESET_PROMPTS.map(p => (
          <button key={p} onClick={() => handleSend(p)}
            style={{ padding: '4px 10px', border: '1px solid #1e2235', background: '#0f121d', color: '#aaa', borderRadius: 12, cursor: 'pointer', fontSize: 10, whiteSpace: 'nowrap', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2235'; e.currentTarget.style.color = '#aaa'; }}
          >
            💬 {p}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            {msg.sender === 'ai' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Bot size={14} color="var(--accent)" />
              </div>
            )}
            <div style={{
              padding: '10px 14px', borderRadius: 12, fontSize: 12, lineHeight: 1.5,
              background: msg.sender === 'user' ? 'rgba(var(--accent-rgb),0.2)' : '#121522',
              border: `1px solid ${msg.sender === 'user' ? 'rgba(var(--accent-rgb),0.4)' : '#1d2236'}`,
              color: msg.sender === 'user' ? '#fff' : '#ddd',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
              <div style={{ fontSize: 8, color: '#555', marginTop: 4, textAlign: 'right' }}>{msg.time}</div>
            </div>
            {msg.sender === 'user' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <User size={14} color="#aaa" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#666', fontSize: 11, padding: 6 }}>
            <Bot size={14} color="var(--accent)" />
            <span>AI is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div style={{ padding: '10px 12px', background: '#0e111a', borderTop: '1px solid #1a1e2e', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI about Sudhir's skills, projects, or resume..."
          style={{ flex: 1, padding: '8px 12px', background: '#07080e', border: '1px solid #1e2235', borderRadius: 8, color: '#fff', outline: 'none', fontSize: 11, fontFamily: 'var(--font-mono)' }}
        />
        <button onClick={() => handleSend()}
          style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#000', cursor: 'pointer', fontWeight: 'bold', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Send size={13} /> Send
        </button>
      </div>
    </div>
  );
});
export default AIAssistantWindow;
