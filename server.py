import os
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
import requests
import base64

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)

# Ensure local PNG fallbacks exist
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
os.makedirs(ASSETS_DIR, exist_ok=True)
IMAGES_DIR = os.path.join(ASSETS_DIR, 'images')
os.makedirs(IMAGES_DIR, exist_ok=True)

# 1x1 PNG base64 (dark slate)
PNG_1X1_BASE64 = (
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/woAAhEBhYcbF8UAAAAASUVORK5CYII='
)

def ensure_fallback_pngs():
    small_path = os.path.join(ASSETS_DIR, 'fallback-300.png')
    large_path = os.path.join(ASSETS_DIR, 'fallback-600.png')
    data = base64.b64decode(PNG_1X1_BASE64)
    try:
        if not os.path.exists(small_path):
            with open(small_path, 'wb') as f:
                f.write(data)
        if not os.path.exists(large_path):
            with open(large_path, 'wb') as f:
                f.write(data)
    except Exception:
        pass

ensure_fallback_pngs()

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/proxy-img':
            qs = urllib.parse.parse_qs(parsed.query)
            src = qs.get('src', [''])[0]
            if not src:
                self.send_response(400)
                self.end_headers()
                return
            try:
                r = requests.get(src, headers={
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://opennana.com/awesome-prompt-gallery/'
                }, timeout=20)
                if r.status_code != 200:
                    self.send_response(502)
                    self.end_headers()
                    return
                ct = r.headers.get('Content-Type', 'image/jpeg')
                self.send_response(200)
                self.send_header('Content-Type', ct)
                self.send_header('Cache-Control', 'public, max-age=86400')
                self.end_headers()
                self.wfile.write(r.content)
            except Exception:
                self.send_response(502)
                self.end_headers()
            return
        return super().do_GET()

def main():
    server = HTTPServer(('', 8080), Handler)
    print('Serving on http://localhost:8080/')
    server.serve_forever()

if __name__ == '__main__':
    main()