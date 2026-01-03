let sessionId = localStorage.getItem("sessionId") || `session_${Date.now()}`;
let conversations = JSON.parse(localStorage.getItem("conversations") || "{}");

function save() {
  localStorage.setItem("conversations", JSON.stringify(conversations));
  localStorage.setItem("sessionId", sessionId);
}

function renderConversations() {
  const list = document.getElementById("conversationsList");
  list.innerHTML = '';
  const entries = Object.entries(conversations).sort((a, b) => b[1].time - a[1].time);
  
  if (entries.length === 0) {
    list.innerHTML = '<div class="px-4 py-10 text-center text-slate-400 text-xs font-medium">No history found</div>';
    return;
  }

  entries.forEach(([id, conv]) => {
    const div = document.createElement("div");
    div.className = `group flex items-center justify-between p-3 mb-1 rounded-xl cursor-pointer transition-all duration-200 ${
      id === sessionId ? "bg-white shadow-sm ring-1 ring-slate-200 text-slate-900" : "text-slate-500 hover:bg-slate-200/50"
    }`;
    div.innerHTML = `
      <div class="flex items-center gap-3 overflow-hidden">
        <svg class="shrink-0 ${id === sessionId ? "text-slate-600" : "text-slate-400"}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="truncate text-sm font-medium">${conv.title}</span>
      </div>
      <button class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    `;
    const deleteBtn = div.querySelector('button');
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteChat(id);
    };
    div.onclick = () => loadChat(id);
    list.appendChild(div);
  });
}

function detectLanguage(code) {
  const c = code.trim().toLowerCase();
  if (c.includes('<!doctype') || c.includes('<html') || c.includes('<div') || c.includes('<body')) return 'html';
  if (c.match(/[.#]\w+\s*\{/) || c.includes('display:') || c.includes('background:')) return 'css';
  if (c.includes('const ') || c.includes('let ') || c.includes('function ') || c.includes('=>')) return 'javascript';
  if (c.includes('def ') || c.includes('import ') || c.includes('print(')) return 'python';
  if (c.includes('public class') || c.includes('System.out')) return 'java';
  if (c.includes('#include') || c.includes('int main')) return 'c++';
  if (c.match(/\b(select|insert|update|delete|from|where)\b/i)) return 'sql';
  return 'code';
}

function highlightCode(code) {
  let h = escapeHtml(code);
  h = h.replace(/(\/\/.*|#.*)/g, '<span class="hl-comment">$1</span>');
  h = h.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="hl-string">$1</span>');
  const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|extends|async|await|def|elif|try|except|with|as|yield|break|continue|range|in)\b/g;
  h = h.replace(keywords, '<span class="hl-keyword">$1</span>');
  h = h.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');
  h = h.replace(/\b([a-zA-Z_]\w*)(?=\s*\()/g, '<span class="hl-func">$1</span>');
  return h;
}

function formatContent(text) {
  const codeBlocks = [];
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const id = `c_${Math.random().toString(36).substr(2, 5)}`;
    const trimmedCode = code.trim();
    const detectedLang = lang || detectLanguage(trimmedCode);
    codeBlocks.push({ id, lang: detectedLang, code: trimmedCode });
    return `___CODE_BLOCK_${id}___`;
  });

  text = text.replace(/\*\*([^*]+)\*\*/g, '<b class="font-bold text-slate-900">$1</b>');
  text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>');

  let html = text.split('\n').map(l => l.trim() ? `<p class="mb-4 last:mb-0 text-slate-700 leading-relaxed">${l}</p>` : '').join('');

  codeBlocks.forEach(b => {
    const blockHtml = `
      <div class="my-6 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div class="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-200">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${b.lang}</span>
          <button onclick="copyCode('${b.id}')" class="text-[10px] text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span class="copy-text">Copy</span>
          </button>
        </div>
        <pre class="p-5 overflow-x-auto"><code id="${b.id}" class="text-[13px] font-mono leading-relaxed block">${highlightCode(b.code)}</code></pre>
      </div>`;
    html = html.replace(`___CODE_BLOCK_${b.id}___`, blockHtml);
  });
  return html;
}

function escapeHtml(t) {
  const div = document.createElement('div');
  div.textContent = t;
  return div.innerHTML;
}

function copyCode(id) {
  const code = document.getElementById(id).innerText;
  navigator.clipboard.writeText(code).then(() => {
    const btn = event.target.closest('button');
    const span = btn.querySelector('.copy-text');
    span.innerText = 'Copied!';
    setTimeout(() => span.innerText = 'Copy', 2000);
  });
}

function addMessage(role, content, scroll = true) {
  const msgs = document.getElementById("messages");
  const welcome = msgs.querySelector(".welcome-container");
  if (welcome) welcome.remove();
  
  const isUser = role === "user";
  const container = document.createElement("div");
  container.className = `w-full max-w-4xl mx-auto px-6 mb-10 flex ${isUser ? "justify-end" : "justify-start"}`;
  
  const inner = document.createElement("div");
  inner.className = `flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse text-right" : ""}`;
  inner.innerHTML = `
    <div class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-black ${isUser ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700 shadow-sm"}">
      ${isUser ? "U" : "AI"}
    </div>
    <div class="min-w-0">
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">${isUser ? "You" : "Reviewer"}</div>
      <div class="message-content text-[15px] leading-relaxed text-slate-800">${formatContent(content)}</div>
    </div>
  `;
  container.appendChild(inner);
  msgs.appendChild(container);
  if (scroll) setTimeout(() => container.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
}

async function sendMessage() {
  const input = document.getElementById("input");
  const text = input.innerText.trim();
  if (!text) return;
  
  const btn = document.getElementById("sendBtn");
  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = 'Sending...';
  
  const userMessage = text;
  input.innerText = "";

  addMessage("user", userMessage);
  showLoading();

  try {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: userMessage, sessionId }),
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    hideLoading();
    
    if (data.error) {
      addMessage("assistant", `Error: ${data.error}`);
    } else {
      addMessage("assistant", data.review);
      if (!conversations[sessionId]) {
        conversations[sessionId] = { title: userMessage.substring(0, 35) + '...', time: Date.now() };
        save();
        renderConversations();
      }
    }
  } catch (err) {
    hideLoading();
    console.error('Error:', err);
    addMessage("assistant", `Network error: ${err.message}. Please check your connection and try again.`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function showLoading() {
  const container = document.createElement("div");
  container.id = "loading-container";
  container.className = "w-full max-w-4xl mx-auto px-6 mb-10 flex justify-start";
  container.innerHTML = `<div class="flex items-center gap-3 text-slate-400 text-sm italic font-medium">
    <div class="flex gap-1.5">
      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
    </div> 
    Analyzing code...
  </div>`;
  document.getElementById("messages").appendChild(container);
  setTimeout(() => container.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
}

function hideLoading() {
  document.getElementById("loading-container")?.remove();
}

function newChat() {
  sessionId = `session_${Date.now()}`;
  save();
  
  const msgs = document.getElementById("messages");
  msgs.innerHTML = `
    <div class="welcome-container w-full max-w-4xl mx-auto px-6 text-center pt-16">
      <h1 class="text-4xl font-medium text-slate-900 tracking-tight mb-4">Code Review, Simplified.</h1>
      <p class="text-slate-500 text-lg mb-12 max-w-2xl mx-auto">Instant professional feedback on performance, logic, and security vulnerabilities.</p>
      
      <div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button class="prompt-btn p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-slate-400 transition-all group shadow-sm">
          <span class="block font-medium text-slate-900 mb-1">Find Bugs</span>
          <span class="text-xs text-slate-400">Analyze logic and syntax errors</span>
        </button>
        <button class="prompt-btn p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-slate-400 transition-all group shadow-sm">
          <span class="block font-medium text-slate-900 mb-1">Optimize</span>
          <span class="text-xs text-slate-400">Improve execution performance</span>
        </button>
      </div>
    </div>
  `;
  
  document.querySelectorAll('.prompt-btn').forEach((btn, i) => {
    btn.onclick = () => {
      const prompts = ['Review this code for bugs:\n\n', 'Optimize this code for speed:\n\n'];
      document.getElementById('input').innerText = prompts[i];
      document.getElementById('input').focus();
    };
  });
  
  renderConversations();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('-translate-x-full');
  sidebar.classList.toggle('w-0');
}

async function loadChat(id) {
  sessionId = id;
  save();
  renderConversations();
  
  const msgs = document.getElementById("messages");
  msgs.innerHTML = '<div class="w-full max-w-4xl mx-auto px-6 py-10 text-center text-slate-400">Loading...</div>';
  
  try {
    const res = await fetch(`/api/history/${id}`);
    if (!res.ok) throw new Error('Failed to load chat');
    
    const data = await res.json();
    msgs.innerHTML = '';
    
    if (data.history && data.history.length > 0) {
      data.history.forEach(msg => addMessage(msg.role, msg.content, false));
    } else {
      msgs.innerHTML = '<div class="w-full max-w-4xl mx-auto px-6 py-10 text-center text-slate-400">No messages found</div>';
    }
  } catch (err) {
    console.error('Load error:', err);
    msgs.innerHTML = '<div class="w-full max-w-4xl mx-auto px-6 py-10 text-center text-red-500">Failed to load conversation</div>';
  }
}

function deleteChat(id) {
  if (!confirm("Delete this conversation?")) return;
  delete conversations[id];
  save();
  
  if (sessionId === id) {
    newChat();
  } else {
    renderConversations();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  const input = document.getElementById("input");
  
  sendBtn.onclick = sendMessage;
  
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  renderConversations();
  
  if (conversations[sessionId]) {
    loadChat(sessionId);
  }
});