# Distributed Chat & File Sharing (Prototype)

This repository contains a prototype distributed chat application with file sharing. It demonstrates:

- A Python FastAPI web app with WebSocket chat for browsers
- A background TCP server (port 9000) that accepts raw TCP clients
- A UDP listener (port 9001) that can receive small file datagrams
- File upload via HTTP which stores files under `uploads/` and notifies connected clients
- Example clients: Python TCP client, UDP file sender, Java TCP client skeleton

Quick start

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
