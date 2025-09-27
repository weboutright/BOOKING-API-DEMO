#!/usr/bin/env python3
"""
Simple HTTP server with CORS enabled for booking system development
"""
import http.server
import socketserver
import json
from urllib.parse import parse_qs, urlparse

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    PORT = 8080
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT} with CORS enabled")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()
