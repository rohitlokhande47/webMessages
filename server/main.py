import asyncio
import json
import os
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "..", "uploads")), name="uploads")

# In-memory connection sets
websockets = set()
tcp_writers = set()

async def broadcast_message(message: dict):
    text = json.dumps(message)
    # WebSocket clients
    dead = []
    for ws in websockets:
        try:
            await ws.send_text(text)
        except Exception:
            dead.append(ws)
    for d in dead:
        websockets.discard(d)

    # TCP clients: send newline-delimited JSON
    dead_tcp = []
    for writer in list(tcp_writers):
        try:
            writer.write((text + "\n").encode())
            await writer.drain()
        except Exception:
            dead_tcp.append(writer)
    for d in dead_tcp:
        try:
            d.close()
        except Exception:
            pass
        tcp_writers.discard(d)


@app.get("/")
async def index():
    path = os.path.join(os.path.dirname(__file__), "static", "index.html")
    return FileResponse(path)


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), username: str = Form("anonymous")):
    # Save file
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe_name = f"{ts}_{file.filename}"
    dest = os.path.join(UPLOAD_DIR, safe_name)
    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)

    url = f"/uploads/{safe_name}"
    message = {"type": "file", "from": username, "filename": file.filename, "url": url}
    await broadcast_message(message)
    return {"status": "ok", "url": url}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websockets.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = {"type": "message", "from": "web", "text": data}
            await broadcast_message(msg)
    except WebSocketDisconnect:
        websockets.discard(websocket)


async def handle_tcp_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    addr = writer.get_extra_info('peername')
    tcp_writers.add(writer)
    try:
        while True:
            line = await reader.readline()
            if not line:
                break
            text = line.decode().strip()
            try:
                obj = json.loads(text)
                # Expect objects with type/message
                await broadcast_message(obj)
            except Exception:
                # treat as plain text
                await broadcast_message({"type": "message", "from": f"tcp:{addr}", "text": text})
    except Exception:
        pass
    finally:
        tcp_writers.discard(writer)
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass


async def run_tcp_server(host='0.0.0.0', port=9000):
    server = await asyncio.start_server(handle_tcp_client, host, port)
    print(f"TCP server listening on {host}:{port}")
    async with server:
        await server.serve_forever()


class UDPProtocol(asyncio.DatagramProtocol):
    def datagram_received(self, data, addr):
        # Try to save small file datagrams; name by timestamp
        try:
            ts = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
            path = os.path.join(UPLOAD_DIR, f"udp_{ts}")
            with open(path, "wb") as f:
                f.write(data)
            # Broadcast notification
            coro = broadcast_message({"type": "file", "from": f"udp:{addr}", "filename": os.path.basename(path), "url": f"/uploads/{os.path.basename(path)}"})
            asyncio.create_task(coro)
        except Exception as e:
            print("UDP save error:", e)


async def run_udp_server(host='0.0.0.0', port=9001):
    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(lambda: UDPProtocol(), local_addr=(host, port))
    print(f"UDP listener on {host}:{port}")
    # Keep running
    try:
        while True:
            await asyncio.sleep(3600)
    finally:
        transport.close()


@app.on_event("startup")
async def startup_event():
    # Start background TCP and UDP servers
    loop = asyncio.get_event_loop()
    loop.create_task(run_tcp_server())
    loop.create_task(run_udp_server())
