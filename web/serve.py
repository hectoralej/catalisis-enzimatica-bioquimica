"""Servidor local opcional (el recurso también funciona con doble clic sobre index.html, vía file://).

Uso:  python serve.py [puerto]     →  http://localhost:8765
"""
import http.server
import os
import socketserver
import sys
import webbrowser

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", port), H) as httpd:
    url = f"http://localhost:{port}/index.html"
    print("Sirviendo", url, "(Ctrl+C para salir)")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    httpd.serve_forever()
