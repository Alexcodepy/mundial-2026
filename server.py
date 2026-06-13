#!/usr/bin/env python3
# Sirve los archivos estáticos y proxea /api/matches a football-data.org
# para no exponer la API key en el navegador.
# Uso: FOOTBALL_DATA_KEY="tu_key" python3 server.py

import http.server
import socketserver
import urllib.request
import urllib.error
import json
import os


def _load_env_file():
    # Lee FOOTBALL_DATA_KEY desde .env si no está ya en el entorno
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.environ.get("FOOTBALL_DATA_KEY") or not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_env_file()
API_KEY = os.environ.get("FOOTBALL_DATA_KEY", "").strip()
COMPETITION = "WC"  # World Cup en football-data.org
PORT = int(os.environ.get("PORT", "4321"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/matches"):
            self._serve_api()
        else:
            super().do_GET()

    def _serve_api(self):
        if not API_KEY:
            return self._json({"error": "no_key"})
        url = f"https://api.football-data.org/v4/competitions/{COMPETITION}/matches"
        req = urllib.request.Request(url, headers={"X-Auth-Token": API_KEY})
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                payload = r.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(payload)
        except urllib.error.HTTPError as e:
            self._json({"error": "http", "code": e.code})
        except Exception as e:
            self._json({"error": "fetch", "detail": str(e)})

    def _json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    estado = "con API key" if API_KEY else "SIN API key (modo datos manuales)"
    print(f"Mundial 2026 -> http://localhost:{PORT}  [{estado}]")
    httpd.serve_forever()
