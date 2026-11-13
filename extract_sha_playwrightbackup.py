# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  ACTUALIZADOR DE SHA ENEBA (Playwright)                                     ║
# ║  Abre la página con un navegador real, intercepta la petición GraphQL      ║
# ║  para capturar el sha256Hash de ProductNoCache, lo compara con el SHA      ║
# ║  actual de check_price.py y lo actualiza si ha cambiado.                   ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

import os
import re
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

TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

URL_PRODUCTO = "https://www.eneba.com/es/xbox-xbox-live-gift-card-25-try-xbox-live-key-turkey"


def send_telegram(msg):
    try:
        requests.get(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            params={"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "HTML"},
            timeout=10
        )
    except Exception as e:
        print(f"Error enviando Telegram: {e}")


def leer_archivo_github(nombre_archivo):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{nombre_archivo}"
    r = requests.get(url, headers=GITHUB_HEADERS, timeout=10)
    if r.status_code != 200:
        return None, None
    data = r.json()
    contenido = base64.b64decode(data["content"]).decode("utf-8")
    return contenido, data["sha"]


def guardar_archivo_github(nombre_archivo, contenido_texto, sha_archivo):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{nombre_archivo}"
    body = {
        "message": f"Actualizar {nombre_archivo} (SHA Eneba)",
        "content": base64.b64encode(contenido_texto.encode("utf-8")).decode("utf-8"),
        "sha": sha_archivo,
    }
    resp = requests.put(url, headers=GITHUB_HEADERS, json=body, timeout=10)
    return resp.status_code in (200, 201)


def extraer_sha_con_playwright():
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
                        if sha and body_json.get("operationName") == "ProductNoCache":
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

        page.wait_for_timeout(5000)

        try:
            page.mouse.wheel(0, 1000)
            page.wait_for_timeout(3000)
        except Exception:
            pass

        browser.close()

    return sha_encontrado


def main():
    sha_nuevo = extraer_sha_con_playwright()

    if not sha_nuevo:
        print("No se pudo extraer el SHA con Playwright.")
        send_telegram(
            "❌ <b>Actualización de SHA fallida</b>\n"
            "No se pudo capturar el sha256Hash con Playwright. "
            "Eneba puede haber cambiado su estructura o bloqueado la carga."
        )
        return

    print(f"SHA extraído: {sha_nuevo}")

    # Leer check_price.py actual
    contenido, sha_archivo = leer_archivo_github("check_price.py")
    if contenido is None:
        print("No se pudo leer check_price.py desde GitHub.")
        send_telegram("❌ <b>Error:</b> No se pudo leer check_price.py desde GitHub para comparar el SHA.")
        return

    # Buscar el SHA actual con regex
    match = re.search(r'SHA = "([^"]+)"', contenido)
    if not match:
        print("No se encontró la variable SHA en check_price.py.")
        send_telegram("❌ <b>Error:</b> No se encontró la variable SHA en check_price.py.")
        return

    sha_actual = match.group(1)
    print(f"SHA actual en check_price.py: {sha_actual}")

    if sha_nuevo == sha_actual:
        print("El SHA no ha cambiado.")
        send_telegram("ℹ️ <b>SHA sin cambios</b>\nEl SHA extraído coincide con el actual en check_price.py.")
        return

    # SHA distinto: actualizar check_price.py
    contenido_nuevo = contenido.replace(f'SHA = "{sha_actual}"', f'SHA = "{sha_nuevo}"')

    if guardar_archivo_github("check_price.py", contenido_nuevo, sha_archivo):
        print("check_price.py actualizado con el nuevo SHA.")
        send_telegram(
            "✅ <b>SHA actualizado automáticamente</b>\n"
            f"Antiguo: <code>{sha_actual[:40]}...</code>\n"
            f"Nuevo: <code>{sha_nuevo[:40]}...</code>"
        )
    else:
        print("Error al guardar check_price.py en GitHub.")
        send_telegram("❌ <b>Error:</b> El SHA cambió pero no se pudo actualizar check_price.py en GitHub.")


if __name__ == "__main__":
    main()
