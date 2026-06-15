# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  ENEBA PRICE TRACKER - SCRIPT PREMIUM (SOLO TRY, ALTA FRECUENCIA)           ║
# ║  Actualiza estado_try_premium.json y notifica al Worker                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

import os
import json
import time
import base64
import requests
import random
from datetime import datetime, timezone

# ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
SHA = "c3aaf0194bab3a8481512069d9bbc707037714c0a60f603497bc820f00a91c11_50e5e0d9351bb05ab629b0eda9b116ae4d96fbb6861836383bc404f1ab5e3680094635224c07d364fff371b7517712ebd33ce0f05504f2fa7e9d66e321168e02"

GITHUB_REPO = "lonyon-lab/enebaalert"
GITHUB_TOKEN = os.environ["GH_TOKEN"]
NOTIFY_SECRET = os.environ.get("NOTIFY_SECRET", "")
WORKER_URL = "https://tryeneba-bot.ealonyon.workers.dev/notify"

HEADERS_ENEBA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*",
    "Accept-Language": "es_ES",
    "content-type": "application/json",
    "Origin": "https://www.eneba.com",
    "Referer": "https://www.eneba.com/",
    "Connection": "keep-alive"
}

GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

# Slugs de las tarjetas TRY que interesan al bot público
SLUGS_TRY = [
    {"slug": "xbox-xbox-live-gift-card-25-try-xbox-live-key-turkey",  "valor": 25},
    {"slug": "xbox-xbox-live-gift-card-50-try-xbox-live-key-turkey",  "valor": 50},
    {"slug": "xbox-xbox-live-gift-card-100-try-xbox-live-key-turkey", "valor": 100},
    {"slug": "xbox-xbox-live-gift-card-300-try-xbox-live-key-turkey", "valor": 300},
]

# Monedas fiat que el bot muestra (para obtener tipos de cambio directos)
FIAT_PUBLICAS = ["EUR", "GBP", "PLN", "SEK", "NOK", "CHF", "USD", "CAD", "AUD", "MXN", "ARS", "BRL"]

# ─── SESIÓN Y HELPERS ─────────────────────────────────────────────────────────
session = requests.Session()
session.headers.update(HEADERS_ENEBA)

def safe_get(url, **kwargs):
    for intento in range(3):
        try:
            resp = session.get(url, timeout=kwargs.get("timeout", 10), headers=kwargs.get("headers"), params=kwargs.get("params"))
            if resp.status_code not in (429, 500, 502, 503, 504):
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

def safe_post(url, **kwargs):
    for intento in range(3):
        try:
            resp = session.post(url, timeout=kwargs.get("timeout", 10), json=kwargs.get("json"), headers=kwargs.get("headers"))
            if resp.status_code not in (429, 500, 502, 503, 504):
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

def safe_put(url, **kwargs):
    for intento in range(3):
        try:
            resp = session.put(url, timeout=kwargs.get("timeout", 10), json=kwargs.get("json"), headers=kwargs.get("headers"))
            if resp.status_code not in (409, 429, 500, 502, 503, 504):
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

# ─── SCRAPING DE UN SLUG ─────────────────────────────────────────────────────
def get_price(slug):
    body = {
        "operationName": "ProductNoCache",
        "variables": {
            "isProductVariantSearch": True,
            "isCheapestAuctionIncluded": True,
            "loadCoinsValue": False,
            "currency": "EUR",
            "context": {"country": "ES", "region": "spain", "language": "es_ES"},
            "slug": slug,
            "language": "es_ES",
            "version": 3,
            "abTests": ["CFD755"],
            "packContext": {"country": "ES", "region": "spain", "language": "es_ES"}
        },
        "extensions": {
            "persistedQuery": {"version": 1, "sha256Hash": SHA}
        }
    }

    try:
        r = safe_post("https://graphql.eneba.com/graphql/", json=body, timeout=10)
        if not r or r.status_code != 200:
            return None

        data = r.json()
        if "errors" in data:
            return None

        edges = data["data"]["productNoCache"]["auctions"]["edges"]
        prices = [
            e["node"]["price"]["amount"]
            for e in edges
            if e["node"]["isInStock"]
            and e["node"]["isCurrentlyAvailable"]
            and e["node"]["price"]["amount"] > 0
        ]
        if prices:
            return min(prices) / 100  # devolver en euros
        return None
    except Exception:
        return None

# ─── OBTENER TIPOS DE CAMBIO ─────────────────────────────────────────────────
def get_tipos_cambio():
    """Obtiene tipo de cambio TRY/EUR y los tipos TRY→fiat para las monedas del bot."""
    try:
        r = safe_get("https://open.er-api.com/v6/latest/EUR", timeout=5)
        if r and r.status_code == 200:
            rates = r.json().get("rates", {})
            try_eur = rates.get("TRY", 0)

            r2 = safe_get("https://open.er-api.com/v6/latest/TRY", timeout=5)
            tipos_fiat = {}
            if r2 and r2.status_code == 200:
                rates2 = r2.json().get("rates", {})
                tipos_fiat = {m: round(rates2[m], 6) for m in FIAT_PUBLICAS if m in rates2}

            return round(try_eur, 2), tipos_fiat
    except Exception:
        pass
    return 0, {}

# ─── GUARDAR JSON PREMIUM EN GITHUB ─────────────────────────────────────────
def guardar_estado_premium(datos):
    nombre_archivo = "estado_try_premium.json"
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{nombre_archivo}"

    r = safe_get(url, headers=GITHUB_HEADERS, timeout=10)
    sha = r.json().get("sha") if r and r.status_code == 200 else None

    contenido = json.dumps(datos, indent=2).encode("utf-8")
    body = {
        "message": "Actualizar estado premium TRY",
        "content": base64.b64encode(contenido).decode("utf-8")
    }
    if sha:
        body["sha"] = sha

    res = safe_put(url, headers=GITHUB_HEADERS, json=body, timeout=10)
    if res and res.status_code in (200, 201):
        print("✅ estado_try_premium.json actualizado")
        return True
    else:
        print(f"❌ Error guardando premium: {res.status_code if res else 'sin respuesta'}")
        return False

# ─── NOTIFICAR AL WORKER ────────────────────────────────────────────────────
def notificar_worker(datos):
    if not NOTIFY_SECRET:
        print("⚠️ NOTIFY_SECRET no configurado. No se notifica al Worker.")
        return

    payload = {"secret": NOTIFY_SECRET, "datos": datos}
    try:
        r = safe_post(WORKER_URL, json=payload, timeout=10)
        if r and r.status_code == 200:
            print("✅ Worker notificado")
        else:
            print(f"⚠️ Worker respondió {r.status_code if r else 'sin respuesta'}")
    except Exception as e:
        print(f"❌ Error notificando al Worker: {e}")

# ─── MAIN ────────────────────────────────────────────────────────────────────
def main():
    ahora = datetime.now(timezone.utc)
    print(f"Inicio del escaneo premium TRY: {ahora.isoformat()}")

    # 1. Tipos de cambio
    tipo_cambio, tipos_fiat = get_tipos_cambio()
    print(f"Cambio TRY/EUR: {tipo_cambio}")

    # 2. Scraping de tarjetas TRY
    precios = {}
    for item in SLUGS_TRY:
        precio = get_price(item["slug"])
        if precio is not None:
            precios[str(item["valor"])] = round(precio, 4)
            print(f"  {item['valor']} TRY → {precio:.2f}€")
        else:
            print(f"  {item['valor']} TRY → sin stock o error")
        time.sleep(random.uniform(0.3, 0.7))

    # 3. Construir JSON
    datos = {
        "ultima_actualizacion": ahora.isoformat(),
        "tipo_cambio": tipo_cambio,
        "precios": precios,
        "tipos_fiat": tipos_fiat
    }

    # 4. Guardar en GitHub
    if guardar_estado_premium(datos):
        # 5. Notificar al Worker para que distribuya los datos frescos
        notificar_worker(datos)

if __name__ == "__main__":
    main()
