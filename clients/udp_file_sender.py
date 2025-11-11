import socket
import sys

def send_file(filename, host='127.0.0.1', port=9001):
    with open(filename, 'rb') as f:
        data = f.read()
    if len(data) > 60000:
        print('Warning: file may be too large for a single UDP datagram')
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.sendto(data, (host, port))
    print('Sent', len(data), 'bytes to', host, port)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python udp_file_sender.py <file> [host] [port]')
        sys.exit(1)
    fname = sys.argv[1]
    h = sys.argv[2] if len(sys.argv) > 2 else '127.0.0.1'
    p = int(sys.argv[3]) if len(sys.argv) > 3 else 9001
    send_file(fname, h, p)
