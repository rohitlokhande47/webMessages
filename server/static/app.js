const usernameInput = document.getElementById('username');
const messages = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const clientsCount = document.getElementById('clientsCount');
const nameModal = document.getElementById('nameModal');
const sessionNameInput = document.getElementById('sessionNameInput');
const enterBtn = document.getElementById('enterBtn');
const randomNameBtn = document.getElementById('randomNameBtn');

// Session-scoped identity (new every tab / browser session)
let sessionName = sessionStorage.getItem('wm_session_name') || '';
let sessionColor = sessionStorage.getItem('wm_session_color') || '';

// Check if this is a real user browser (not a health check or bot)
function isRealUserAgent() {
  const ua = navigator.userAgent.toLowerCase();
  const isBot = /bot|crawler|spider|health|monitor|check/.test(ua);
  const hasJavaScript = typeof window !== 'undefined';
  return hasJavaScript && !isBot;
}

function randomName() {
  const adj = ['Sunny','Quiet','Brave','Curious','Mellow','Swift','Clever','Bold','Kind','Frost'];
  const noun = ['Fox','Sparrow','Otter','Raven','Dolphin','Hawk','Panda','Maple','Cedar','Orchid'];
  return `${adj[Math.floor(Math.random()*adj.length)]} ${noun[Math.floor(Math.random()*noun.length)]}`;
}

function colorForName(name){
  // simple hash -> hue
  let h=0; for(let i=0;i<name.length;i++){h = (h<<5)-h + name.charCodeAt(i); h |= 0}
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 55%)`;
}

function showModal(){
  nameModal.setAttribute('aria-hidden','false');
  sessionNameInput.focus();
}

function hideModal(){
  nameModal.setAttribute('aria-hidden','true');
}

function setSession(name){
  sessionName = name.trim().slice(0,30) || randomName();
  sessionColor = colorForName(sessionName);
  sessionStorage.setItem('wm_session_name', sessionName);
  sessionStorage.setItem('wm_session_color', sessionColor);
  usernameInput.value = sessionName;
  usernameInput.setAttribute('readonly','true');
  
  // Add welcome message
  setTimeout(() => {
    appendSystem(`Welcome ${sessionName}! You've joined the chat.`);
  }, 500);
}

// If no session name yet AND this is a real user, show modal and block connecting
if(!sessionName && isRealUserAgent()){
  showModal();
  sessionNameInput.value = randomName();
} else if (sessionName) {
  setSession(sessionName);
  startWebSocket();
} else {
  // For bots/health checks, don't show modal or start websocket
  document.body.innerHTML = '<div style="padding:20px;text-align:center;font-family:sans-serif;"><h1>WebMessages Chat</h1><p>Please visit with a web browser to join the chat.</p></div>';
}

randomNameBtn.addEventListener('click', ()=>{
  sessionNameInput.value = randomName();
  sessionNameInput.focus();
});

enterBtn.addEventListener('click', ()=>{
  const v = sessionNameInput.value.trim() || randomName();
  setSession(v);
  hideModal();
  startWebSocket();
});

sessionNameInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ enterBtn.click(); } });

let ws = null;
function startWebSocket(){
  if(ws) return;
  ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
  ws.onopen = () => appendSystem('Connected');
  ws.onclose = () => appendSystem('Disconnected');
  ws.onmessage = (ev) => {
    try {
      const obj = JSON.parse(ev.data);
      if (obj.type === 'message') {
        appendMessage(obj.from || 'unknown', obj.text);
      } else if (obj.type === 'file') {
        appendFile(obj.from, obj.filename, obj.url);
      } else if (obj.type === 'clients') {
        clientsCount.innerText = obj.count;
      }
    } catch (e) {
      appendSystem(ev.data);
    }
  }
}

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const t = msgInput.value.trim();
  if (!t || !ws || ws.readyState !== WebSocket.OPEN) return;
  const payload = { from: sessionName || 'web', text: t };
  ws.send(JSON.stringify(payload));
  msgInput.value = '';
});

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = fileInput.files[0];
  if (!f) return alert('Choose a file');
  const uname = sessionName || 'web';
  const fd = new FormData();
  fd.append('file', f);
  fd.append('username', uname);
  const res = await fetch('/upload', { method: 'POST', body: fd });
  const j = await res.json();
  if (j.url) appendSystem('Uploaded: ' + j.url);
});

function appendMessage(from, text) {
  const li = document.createElement('li');
  li.className = 'message' + (from === (sessionName || 'web') ? ' you' : '');

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.innerText = (from || 'U').slice(0,1).toUpperCase();
  avatar.style.background = colorForName(from || 'U');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerText = text;

  const meta = document.createElement('div');
  meta.className = 'meta';
  const now = new Date();
  meta.innerText = `${from} • ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

  bubble.appendChild(meta);

  li.appendChild(avatar);
  li.appendChild(bubble);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function appendFile(from, filename, url) {
  const li = document.createElement('li');
  li.className = 'message';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.innerText = (from || 'U').slice(0,1).toUpperCase();
  avatar.style.background = colorForName(from || 'U');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const a = document.createElement('a');
  a.href = url;
  a.className = 'file-link';
  a.target = '_blank';
  a.innerText = filename;

  // if image, show preview
  if (filename.match(/\.(png|jpe?g|gif|webp)$/i)) {
    const img = document.createElement('img');
    img.src = url;
    a.prepend(img);
  }

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerText = `${from}`;

  bubble.appendChild(a);
  bubble.appendChild(meta);

  li.appendChild(avatar);
  li.appendChild(bubble);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function appendSystem(text) {
  const li = document.createElement('li');
  li.className = 'message';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.style.background = 'transparent';
  bubble.style.boxShadow = 'none';
  bubble.style.color = 'var(--muted)';
  bubble.innerText = text;
  li.appendChild(bubble);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
