import requests
import re
from urllib.parse import urljoin, urlparse

# Configuración
URL_ENEBA = "https://www.eneba.com/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
TIMEOUT = 10
SHA_PATTERN = re.compile(r'[a-f0-9]{64}')
ARCHIVO_SALIDA = "sha.txt"

def descargar_contenido(url):
    """Descarga el contenido de una URL con reintentos."""
    for _ in range(3):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if resp.status_code == 200:
                return resp.text
        except Exception:
            pass
    return None

def extraer_sha_del_texto(texto):
    """Devuelve el primer SHA de 64 caracteres encontrado en el texto, o None."""
    if not texto:
        return None
    matches = SHA_PATTERN.findall(texto)
    return matches[0] if matches else None

def obtener_sha():
    # 1. Descargar página principal
    print(f"Descargando {URL_ENEBA}...")
    html = descargar_contenido(URL_ENEBA)
    if not html:
        print("No se pudo descargar la página principal.")
        return None

    # 2. Buscar SHA en el HTML
    sha = extraer_sha_del_texto(html)
    if sha:
        print(f"SHA encontrado en HTML: {sha}")
        return sha

    print("SHA no encontrado en HTML. Buscando en scripts JS...")

    # 3. Extraer URLs de scripts JS
    js_urls = set()
    # Patrón para src="..." y src='...' en <script>
    patron_script = re.compile(r'<script[^>]+src=["\'](.*?\.js(?:\?.*)?)["\']', re.IGNORECASE)
    for match in patron_script.findall(html):
        url_js = urljoin(URL_ENEBA, match)
        # Evitar URLs duplicadas y externas (opcional, puedes mantenerlas)
        js_urls.add(url_js)

    print(f"Encontrados {len(js_urls)} scripts JS. Descargando...")

    # 4. Descargar cada script y buscar el SHA
    for url_js in js_urls:
        print(f"  Analizando {url_js}")
        contenido_js = descargar_contenido(url_js)
        if contenido_js:
            sha = extraer_sha_del_texto(contenido_js)
            if sha:
                print(f"SHA encontrado en {url_js}: {sha}")
                return sha

    print("No se encontró ningún SHA en HTML ni en scripts JS.")
    return None

def guardar_sha(sha, archivo=ARCHIVO_SALIDA):
    with open(archivo, "w") as f:
        f.write(sha)
    print(f"SHA guardado en {archivo}")

if __name__ == "__main__":
    sha = obtener_sha()
    if sha:
        guardar_sha(sha)
    else:
        print("No se pudo obtener el SHA. Revisa la estructura de Eneba.")
