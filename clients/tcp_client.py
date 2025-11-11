import asyncio
import json

async def tcp_client(host='127.0.0.1', port=9000):
    reader, writer = await asyncio.open_connection(host, port)
    print('Connected to TCP server')

    async def read_loop():
        while True:
            line = await reader.readline()
            if not line:
                break
            try:
                obj = json.loads(line.decode())
                print('[IN]', obj)
            except Exception:
                print('[IN]', line.decode().strip())

    asyncio.create_task(read_loop())

    try:
        while True:
            txt = input('> ')
            if not txt:
                continue
            # send as plain text
            writer.write((txt + '\n').encode())
            await writer.drain()
    except KeyboardInterrupt:
        print('closing')
        writer.close()
        await writer.wait_closed()

if __name__ == '__main__':
    asyncio.run(tcp_client())
