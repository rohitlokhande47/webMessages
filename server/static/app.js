const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
const messages = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const usernameInput = document.getElementById('username');

ws.onopen = () => {
  appendSystem('Connected to server');
}

ws.onmessage = (ev) => {
  try {
    const obj = JSON.parse(ev.data);
    if (obj.type === 'message') {
      appendMessage(obj.from || 'unknown', obj.text);
    } else if (obj.type === 'file') {
      appendFile(obj.from, obj.filename, obj.url);
    }
  } catch (e) {
    appendMessage('server', ev.data);
  }
}

ws.onclose = () => appendSystem('Disconnected');

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const t = msgInput.value.trim();
  if (!t) return;
  ws.send(t);
  msgInput.value = '';
});

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = fileInput.files[0];
  if (!f) return alert('Choose a file');
  const username = usernameInput.value || 'web';
  const fd = new FormData();
  fd.append('file', f);
  fd.append('username', username);
  const res = await fetch('/upload', { method: 'POST', body: fd });
  const j = await res.json();
  if (j.url) appendSystem('Uploaded: ' + j.url);
});

function appendMessage(from, text) {
  const li = document.createElement('li');
  li.innerText = '[' + from + '] ' + text;
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
}

function appendFile(from, filename, url) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = url;
  a.innerText = `File from ${from}: ${filename}`;
  a.target = '_blank';
  li.appendChild(a);
  messages.appendChild(li);
}

function appendSystem(text) {
  const li = document.createElement('li');
  li.className = 'system';
  li.innerText = text;
  messages.appendChild(li);
}
