# Distributed Chat & File Sharing

A real-time chat application with file sharing capabilities, supporting web browsers, TCP, and UDP clients.

## 🚀 Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Quick deploy**: Push to GitHub → Connect to Render → Auto-deploy with `render.yaml`

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## 🌟 Features

- 🎨 **Modern Web UI** with session-based identity
- 💬 **Real-time Chat** via WebSocket
- 📁 **File Sharing** with image previews
- 👥 **Multi-user** support with individual sessions
- 🌐 **Cross-platform** (Web, TCP, UDP clients)
- 📱 **Responsive** design for mobile/desktop

## 🏃‍♂️ Quick Start (Local)

1. Install dependencies:

```bash
python -m pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

3. Open http://localhost:8000 in your browser to use the web UI.

TCP clients can connect to localhost:9000. UDP senders can send to localhost:9001.

Files uploaded from the web UI are available under `/uploads` and a notification is broadcast to all connected clients.

Notes and next steps

- This is a prototype. For production, add authentication, TLS, proper file chunking for large files, and reliability for UDP transfers.
- You can extend the server to stream files over TCP to raw clients on request.
