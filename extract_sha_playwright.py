# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  EXPERIMENTO 2: Extraer sha256Hash de Eneba con Playwright                  ║
# ║  Abre la página con un navegador real e intercepta la petición GraphQL    ║
# ║  para capturar el sha256Hash de ProductNoCache                             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

import os
import json
import base64
import requests
from playwright.sync_api import sync_playwright

GITHUB_REPO = "lonyon-lab/enebaalert"
GITHUB_TOKEN = os.environ["GH_TOKEN"]
GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

URL_PRODUCTO = "https://www.eneba.com/es/xbox-xbox-live-gift-card-25-try-xbox-live-key-turkey"


def guardar_en_github(nombre_archivo, contenido_texto):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{nombre_archivo}"
    r = requests.get(url, headers=GITHUB_HEADERS, timeout=10)
    sha_archivo = r.json().get("sha") if r.status_code == 200 else None

    body = {
        "message": f"Actualizar {nombre_archivo}",
        "content": base64.b64encode(contenido_texto.encode("utf-8")).decode("utf-8"),
    }
    if sha_archivo:
        body["sha"] = sha_archivo

    resp = requests.put(url, headers=GITHUB_HEADERS, json=body, timeout=10)
    print(f"Guardado {nombre_archivo} -> status {resp.status_code}")


def main():
    capturas = []
    sha_encontrado = None

    print("Lanzando navegador headless...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        def manejar_request(request):
            nonlocal sha_encontrado
            if "graphql.eneba.com" in request.url and request.method == "POST":
                try:
                    post_data = request.post_data
                    if post_data and "ProductNoCache" in post_data:
                        body_json = json.loads(post_data)
                        sha = body_json.get("extensions", {}).get("persistedQuery", {}).get("sha256Hash")
                        if sha:
                            capturas.append({
                                "operationName": body_json.get("operationName"),
                                "sha256Hash": sha,
                                "url": request.url
                            })
                            if body_json.get("operationName") == "ProductNoCache":
                                sha_encontrado = sha
                                print(f"  -> SHA capturado: {sha[:80]}...")
                except Exception as e:
                    print(f"  Error procesando request: {e}")

        page.on("request", manejar_request)

        print(f"Navegando a {URL_PRODUCTO}")
        try:
            page.goto(URL_PRODUCTO, wait_until="networkidle", timeout=30000)
        except Exception as e:
            print(f"Timeout o error en goto (puede ser normal): {e}")

        # Esperar un poco más por si hay peticiones diferidas
        page.wait_for_timeout(5000)

        # Intentar interactuar: hacer scroll para disparar lazy loading
        try:
            page.mouse.wheel(0, 1000)
            page.wait_for_timeout(3000)
        except Exception:
            pass

        browser.close()

    # Construir resultado
    salida = []
    salida.append("=== RESULTADO EXTRACCIÓN SHA ENEBA (Playwright) ===\n")
    salida.append(f"Página analizada: {URL_PRODUCTO}\n")
    salida.append(f"Peticiones GraphQL con persistedQuery capturadas: {len(capturas)}\n\n")

    if capturas:
        salida.append("--- PETICIONES CAPTURADAS ---\n\n")
        for i, c in enumerate(capturas, 1):
            salida.append(f"#{i} operationName: {c['operationName']}\n")
            salida.append(f"   sha256Hash: {c['sha256Hash']}\n\n")

        if sha_encontrado:
            salida.append("--- SHA DE ProductNoCache ENCONTRADO ---\n")
            salida.append(sha_encontrado + "\n")
        else:
            salida.append("No se encontró específicamente 'ProductNoCache', pero hay otras operaciones capturadas arriba.\n")
    else:
        salida.append("No se capturó ninguna petición GraphQL con persistedQuery.\n")
        salida.append("Posibles causas:\n")
        salida.append("- La página no llegó a hacer esa petición en este contexto (headless/sin región seleccionada)\n")
        salida.append("- Cloudflare u otra protección bloqueó la carga\n")

    contenido_final = "".join(salida)
    print("\n" + contenido_final[:1000])

    guardar_en_github("sha_encontrado_playwright.txt", contenido_final)


if __name__ == "__main__":
    main()
