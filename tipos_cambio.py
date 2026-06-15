# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  TIPOS DE CAMBIO CENTRALIZADOS (EUR, TRY y FIAT)                              ║
# ║  Se ejecuta cada hora y guarda tipos_cambio.json en el repositorio            ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

import os
import json
import time
import base64
import requests
from datetime import datetime, timezone

# ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
GITHUB_REPO = "lonyon-lab/enebaalert"
ARCHIVO = "tipos_cambio.json"
GITHUB_TOKEN = os.environ["GH_TOKEN"]

FIAT_PUBLICAS = ["EUR", "GBP", "PLN", "SEK", "NOK", "CHF", "USD", "CAD", "AUD", "MXN", "ARS", "BRL"]

# ─── HELPERS HTTP ─────────────────────────────────────────────────────────────
def safe_get(url, **kwargs):
    for intento in range(3):
        try:
            resp = requests.get(url, timeout=kwargs.get("timeout", 10))
            if resp.status_code not in (429, 500, 502, 503, 504):
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

def safe_put(url, **kwargs):
    for intento in range(3):
        try:
            resp = requests.put(url, timeout=kwargs.get("timeout", 10), headers=kwargs.get("headers"), json=kwargs.get("json"))
            if resp.status_code not in (409, 429, 500, 502, 503, 504):
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

# ─── OBTENER TIPOS DE CAMBIO ─────────────────────────────────────────────────
def obtener_tipos():
    """Consulta las dos APIs necesarias y devuelve (tipo_cambio, tipos_fiat)."""
    try:
        # 1. Obtener EUR -> todas las monedas
        r_eur = safe_get("https://open.er-api.com/v6/latest/EUR", timeout=5)
        if not r_eur or r_eur.status_code != 200:
            print("❌ Error obteniendo latest/EUR")
            return None, None
        rates_eur = r_eur.json().get("rates", {})
        try_eur = rates_eur.get("TRY")
        if not try_eur:
            print("❌ TRY no encontrado en latest/EUR")
            return None, None

        # 2. Obtener TRY -> fiat (directo)
        r_try = safe_get("https://open.er-api.com/v6/latest/TRY", timeout=5)
        tipos_fiat = {}
        if r_try and r_try.status_code == 200:
            rates_try = r_try.json().get("rates", {})
            tipos_fiat = {m: round(rates_try[m], 6) for m in FIAT_PUBLICAS if m in rates_try}
        else:
            print("⚠️ No se pudo obtener latest/TRY, se omite tipos_fiat")
            # si falla, tipos_fiat queda vacío

        return round(try_eur, 2), tipos_fiat
    except Exception as e:
        print(f"❌ Excepción en obtener_tipos: {e}")
        return None, None

# ─── GUARDAR EN GITHUB ───────────────────────────────────────────────────────
def guardar_tipos_cambio(tipo_cambio, tipos_fiat):
    ahora = datetime.now(timezone.utc)
    datos = {
        "ultima_actualizacion": ahora.isoformat(),
        "tipo_cambio": tipo_cambio,
        "tipos_fiat": tipos_fiat
    }

    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{ARCHIVO}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }

    # Obtener SHA si el archivo existe
    r = safe_get(url, headers=headers, timeout=10)
    sha = r.json().get("sha") if r and r.status_code == 200 else None

    contenido = json.dumps(datos, indent=2).encode("utf-8")
    body = {
        "message": "Actualizar tipos de cambio",
        "content": base64.b64encode(contenido).decode("utf-8")
    }
    if sha:
        body["sha"] = sha

    res = safe_put(url, headers=headers, json=body, timeout=10)
    if res and res.status_code in (200, 201):
        print("✅ tipos_cambio.json actualizado")
    else:
        print(f"❌ Error guardando: {res.status_code if res else 'sin respuesta'}")

# ─── MAIN ────────────────────────────────────────────────────────────────────
def main():
    print(f"Inicio de actualización de tipos de cambio: {datetime.now(timezone.utc).isoformat()}")
    tipo_cambio, tipos_fiat = obtener_tipos()
    if tipo_cambio is None:
        print("No se pudo obtener los tipos de cambio. Abortando.")
        return
    guardar_tipos_cambio(tipo_cambio, tipos_fiat)

if __name__ == "__main__":
    main()
