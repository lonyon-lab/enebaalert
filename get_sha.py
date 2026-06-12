import requests
import re
from urllib.parse import urljoin

URL_ENEBA = "https://www.eneba.com/"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
TIMEOUT = 10

# Patrón para buscar el SHA completo (dos hashes de 64 hex separados por _)
PATRON_SHA = re.compile(r'[a-f0-9]{64}_[a-f0-9]{64}')

def descargar_contenido(url):
    for _ in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code == 200:
                return r.text
        except Exception:
            pass
    return None

def obtener_sha():
    # Descargar HTML principal
    html = descargar_contenido(URL_ENEBA)
    if not html:
        print("No se pudo descargar la página principal.")
        return None

    # Buscar en HTML
    match = PATRON_SHA.search(html)
    if match:
        sha = match.group()
        print(f"SHA encontrado en HTML: {sha}")
        return sha

    # Buscar en scripts JS
    print("Buscando en scripts JS...")
    urls_js = re.findall(r'<script[^>]+src=["\']([^"\']+\.js[^"\']*)["\']', html, re.I)
    urls_js = [urljoin(URL_ENEBA, u) for u in urls_js]

    for url_js in urls_js:
        js = descargar_contenido(url_js)
        if js:
            match = PATRON_SHA.search(js)
            if match:
                sha = match.group()
                print(f"SHA encontrado en {url_js}: {sha}")
                return sha

    print("No se encontró el SHA en ningún lugar.")
    return None

def guardar_sha(sha, archivo="sha.txt"):
    with open(archivo, "w") as f:
        f.write(sha)
    print(f"SHA guardado en {archivo}")

if __name__ == "__main__":
    sha = obtener_sha()
    if sha:
        guardar_sha(sha)
    else:
        print("No se pudo obtener el SHA. Revisa la estructura de Eneba.")
