import socketserver
from time import sleep
from socketserver import ThreadingMixIn
import threading
import cv2
from http.server import BaseHTTPRequestHandler, HTTPServer
from depth_camera.main import logger

class TCPServerRequest(socketserver.BaseRequestHandler):
    def handle(self):
        header = ('HTTP/1.0 200 OK\r\nServer: Mozarella/2.2\r\nAccept-Range: bytes\r\n'
                  'Connection: close\r\nMax-Age: 0\r\nExpires: 0\r\nCache-Control: no-cache, private\r\n'
                  'Pragma: no-cache\r\nContent-Type: application/json\r\n\r\n')
        self.request.send(header.encode())
        while True:
            sleep(0.1)
            if hasattr(self.server, 'datatosend'):
                self.request.send(self.server.datatosend.encode() + "\r\n".encode())
                
class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    pass

class ServerManager:
    """Manages TCP and HTTP servers for streaming"""
    
    def __init__(self, tcp_port: int = 8070, http_port: int = 8090):
        self.tcp_port = tcp_port
        self.http_port = http_port
        self.server_tcp = None
        self.server_http = None
        self.tcp_thread = None
        self.http_thread = None
        self.running = False
        
    def start(self):
        """Start both TCP and HTTP servers"""
        try:
            self.server_tcp = socketserver.TCPServer(('localhost', self.tcp_port), TCPServerRequest)
            self.tcp_thread = threading.Thread(target=self.server_tcp.serve_forever)
            self.tcp_thread.daemon = True
            self.tcp_thread.start()
            
            self.server_http = ThreadedHTTPServer(('localhost', self.http_port), VideoStreamHandler)
            self.http_thread = threading.Thread(target=self.server_http.serve_forever)
            self.http_thread.daemon = True
            self.http_thread.start()
            
            self.running = True
            logger.info(f"Servers started - TCP: {self.tcp_port}, HTTP: {self.http_port}")
            
        except Exception as e:
            logger.error(f"Failed to start servers: {e}")
            raise


class VideoStreamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'multipart/x-mixed-replace; boundary=--jpgboundary')
        self.end_headers()
        while True:
            sleep(0.1)
            if hasattr(self.server, 'frametosend'):
                ok, encoded = cv2.imencode('.jpg', self.server.frametosend)
                self.wfile.write("--jpgboundary".encode())
                self.send_header('Content-type', 'image/jpeg')
                self.send_header('Content-length', str(len(encoded)))
                self.end_headers()
                self.wfile.write(encoded)
                self.end_headers()

