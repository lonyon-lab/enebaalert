# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  ENEBA PRICE TRACKER (CORREGIDO MULTI-COPA)                                 ║
# ║  Trackea ratios de tarjetas Xbox en Eneba y avisa por Telegram               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ─── SHA (ACTUALIZAR SI LA API FALLA) ────────────────────────────────────────
SHA = "c3aaf0194bab3a8481512069d9bbc707037714c0a60f603497bc820f00a91c11_50e5e0d9351bb05ab629b0eda9b116ae4d96fbb6861836383bc404f1ab5e3680094635224c07d364fff371b7517712ebd33ce0f05504f2fa7e9d66e321168e02"

# ─── UMBRALES (EDITAR AQUÍ) ───────────────────────────────────────────────────
UMBRALES = {
    "TRY": {"umbral": 52.7,   "umbral_bajo": 48},
    "BRL": {"umbral": 6.8,    "umbral_bajo": 5.5},
    "CLP": {"umbral": 42,     "umbral_bajo": 33},
    "COP": {"umbral": 4300,   "umbral_bajo": 3300},
    "ZAR": {"umbral": 20.5,   "umbral_bajo": 16},
    "SAR": {"umbral": 4.45,   "umbral_bajo": 3.2},
    "TWD": {"umbral": 38,     "umbral_bajo": 30},
    "HKD": {"umbral": 9.2,    "umbral_bajo": 7.2},
    "JPY": {"umbral": 167,    "umbral_bajo": 155},
}

# ─── CONFIGURACIÓN DE MONEDAS ─────────────────────────────────────────────────
MONEDAS = {
    "TRY": {
        "nombre": "Lira turca",
        "bandera": "🇹🇷",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-25-try-xbox-live-key-turkey",  "valor": 25},
            {"slug": "xbox-xbox-live-gift-card-50-try-xbox-live-key-turkey",  "valor": 50},
            {"slug": "xbox-xbox-live-gift-card-100-try-xbox-live-key-turkey", "valor": 100},
            {"slug": "xbox-xbox-live-gift-card-300-try-xbox-live-key-turkey", "valor": 300},
        ],
        "umbral": UMBRALES["TRY"]["umbral"],
        "umbral_bajo": UMBRALES["TRY"]["umbral_bajo"],
    },
    "BRL": {
        "nombre": "Real brasileño",
        "bandera": "🇧🇷",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-5-brl-xbox-live-key-brazil",   "valor": 5},
            {"slug": "xbox-xbox-live-gift-card-10-brl-xbox-live-key-brazil",  "valor": 10},
            {"slug": "xbox-xbox-live-gift-card-15-brl-xbox-live-key-brazil",  "valor": 15},
            {"slug": "xbox-xbox-live-gift-card-20-brl-xbox-live-key-brazil",  "valor": 20},
            {"slug": "xbox-xbox-live-gift-card-30-brl-xbox-live-key-brazil",  "valor": 30},
            {"slug": "xbox-xbox-live-gift-card-40-brl-xbox-live-key-brazil",  "valor": 40},
            {"slug": "xbox-xbox-live-gift-card-50-brl-xbox-live-key-brazil",  "valor": 50},
            {"slug": "xbox-xbox-live-gift-card-100-brl-xbox-live-key-brazil", "valor": 100},
        ],
        "umbral": UMBRALES["BRL"]["umbral"],
        "umbral_bajo": UMBRALES["BRL"]["umbral_bajo"],
    },
    "CLP": {
        "nombre": "Peso chileno",
        "bandera": "🇨🇱",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-10-000-clp-xbox-live-key-chile", "valor": 10000},
            {"slug": "xbox-xbox-live-gift-card-20-000-clp-xbox-live-key-chile", "valor": 20000},
            {"slug": "xbox-xbox-live-gift-card-35-000-clp-xbox-live-key-chile", "valor": 35000},
        ],
        "umbral": UMBRALES["CLP"]["umbral"],
        "umbral_bajo": UMBRALES["CLP"]["umbral_bajo"],
    },
    "COP": {
        "nombre": "Peso colombiano",
        "bandera": "🇨🇴",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-30-000-cop-key-colombia",   "valor": 30000},
            {"slug": "xbox-xbox-live-gift-card-55-000-cop-key-colombia",   "valor": 55000},
            {"slug": "xbox-xbox-live-gift-card-100-000-cop-key-colombia",  "valor": 100000},
            {"slug": "xbox-xbox-live-gift-card-150-000-cop-key-colombia",  "valor": 150000},
        ],
        "umbral": UMBRALES["COP"]["umbral"],
        "umbral_bajo": UMBRALES["COP"]["umbral_bajo"],
    },
    "ZAR": {
        "nombre": "Rand sudafricano",
        "bandera": "🇿🇦",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-50-zar-xbox-live-key-south-africa",  "valor": 50},
            {"slug": "xbox-xbox-live-gift-card-100-zar-xbox-live-key-south-africa", "valor": 100},
            {"slug": "xbox-xbox-live-gift-card-120-zar-xbox-live-key-south-africa", "valor": 120},
            {"slug": "xbox-xbox-live-gift-card-150-zar-xbox-live-key-south-africa", "valor": 150},
            {"slug": "xbox-xbox-live-gift-card-200-zar-xbox-live-key-south-africa", "valor": 200},
            {"slug": "xbox-xbox-live-gift-card-250-zar-xbox-live-key-south-africa", "valor": 250},
            {"slug": "xbox-xbox-live-gift-card-300-zar-xbox-live-key-south-africa", "valor": 300},
            {"slug": "xbox-xbox-live-gift-card-350-zar-xbox-live-key-south-africa", "valor": 350},
            {"slug": "xbox-xbox-live-gift-card-450-zar-xbox-live-key-south-africa", "valor": 450},
            {"slug": "xbox-xbox-live-gift-card-500-zar-xbox-live-key-south-africa", "valor": 500},
            {"slug": "xbox-xbox-live-gift-card-550-zar-xbox-live-key-south-africa", "valor": 550},
            {"slug": "xbox-xbox-live-gift-card-600-zar-xbox-live-key-south-africa", "valor": 600},
        ],
        "umbral": UMBRALES["ZAR"]["umbral"],
        "umbral_bajo": UMBRALES["ZAR"]["umbral_bajo"],
    },
    "SAR": {
        "nombre": "Riyal saudí",
        "bandera": "🇸🇦",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-50-sar-xbox-live-key-saudi-arabia",  "valor": 50},
            {"slug": "xbox-xbox-live-gift-card-100-usd-xbox-live-key-saudi-arabia", "valor": 100},
            {"slug": "xbox-xbox-live-gift-card-200-sar-xbox-live-key-saudi-arabia", "valor": 200},
            {"slug": "xbox-xbox-live-gift-card-300-sar-xbox-live-key-saudi-arabia", "valor": 300},
        ],
        "umbral": UMBRALES["SAR"]["umbral"],
        "umbral_bajo": UMBRALES["SAR"]["umbral_bajo"],
    },
    "TWD": {
        "nombre": "Dólar taiwanés",
        "bandera": "🇹🇼",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-200-twd-xbox-live-key-taiwan",  "valor": 200},
            {"slug": "xbox-xbox-live-gift-card-250-twd-xbox-live-key-taiwan",  "valor": 250},
            {"slug": "xbox-xbox-live-gift-card-500-twd-xbox-live-key-taiwan",  "valor": 500},
            {"slug": "xbox-xbox-live-gift-card-1000-twd-xbox-live-key-taiwan", "valor": 1000},
            {"slug": "xbox-xbox-live-gift-card-2000-twd-xbox-live-key-taiwan", "valor": 2000},
        ],
        "umbral": UMBRALES["TWD"]["umbral"],
        "umbral_bajo": UMBRALES["TWD"]["umbral_bajo"],
    },
    "HKD": {
        "nombre": "Dólar de Hong Kong",
        "bandera": "🇭🇰",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-150-hkd-xbox-live-key-hong-kong", "valor": 150},
            {"slug": "xbox-xbox-live-gift-card-300-hkd-xbox-live-key-hong-kong", "valor": 300},
            {"slug": "xbox-xbox-live-gift-card-600-hkd-xbox-live-key-hong-kong", "valor": 600},
        ],
        "umbral": UMBRALES["HKD"]["umbral"],
        "umbral_bajo": UMBRALES["HKD"]["umbral_bajo"],
    },
    "JPY": {
        "nombre": "Yen japonés",
        "bandera": "🇯🇵",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-1000-jpy-xbox-live-key-japan",  "valor": 1000},
            {"slug": "xbox-xbox-live-gift-card-1500-jpy-xbox-live-key-japan",  "valor": 1500},
            {"slug": "xbox-xbox-live-gift-card-2000-jpy-xbox-live-key-japan",  "valor": 2000},
            {"slug": "xbox-xbox-live-gift-card-2500-jpy-xbox-live-key-japan",  "valor": 2500},
            {"slug": "xbox-xbox-live-gift-card-3000-jpy-xbox-live-key-japan",  "valor": 3000},
            {"slug": "xbox-xbox-live-gift-card-5000-jpy-xbox-live-key-japan",  "valor": 5000},
            {"slug": "xbox-xbox-live-gift-card-10000-jpy-xbox-live-key-japan", "valor": 10000},
        ],
        "umbral": UMBRALES["JPY"]["umbral"],
        "umbral_bajo": UMBRALES["JPY"]["umbral_bajo"],
    },
}

# ─── IMPORTS ──────────────────────────────────────────────────────────────────
import os
import json
import time
import csv
import io
import base64
import requests
from datetime import datetime, timezone, timedelta

# ─── TELEGRAM ─────────────────────────────────────────────────────────────────
TOKEN = os.environ["TELEGRAM_TOKEN"]
CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

# ─── GITHUB API ───────────────────────────────────────────────────────────────
GITHUB_REPO = "lonyon-lab/enebaalert"
GITHUB_FILE = "estado.json"
GITHUB_TOKEN = os.environ["GH_TOKEN"]
GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

# ─── HEADERS ENEBA ────────────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*",
    "Accept-Language": "es_ES",
    "content-type": "application/json",
    "Origin": "https://www.eneba.com",
    "Referer": "https://www.eneba.com/",
}

HORAS_RECHECK_SIN_STOCK = 2

def send_telegram(msg):
    try:
        requests.get(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            params={"chat_id": CHAT_ID, "text": msg, "parse_mode": "HTML"},
            timeout=10
        )
    except Exception as e:
        print(f"Error enviando Telegram: {e}")

def send_telegram_file(filename, content, caption=""):
    try:
        requests.post(
            f"https://api.telegram.org/bot{TOKEN}/sendDocument",
            data={"chat_id": CHAT_ID, "caption": caption},
            files={"document": (filename, content, "text/csv")},
            timeout=30
        )
    except Exception as e:
        print(f"Error enviando archivo Telegram: {e}")

def get_tipo_cambio_real(monedas):
    try:
        r = requests.get(
            "https://open.er-api.com/v6/latest/EUR",
            timeout=5
        )
        if r.status_code == 200:
            rates = r.json().get("rates", {})
            return {m: rates[m] for m in monedas if m in rates}
    except Exception:
        pass
    return {}

def get_price(slug, estado):
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
        r = requests.post(
            "https://graphql.eneba.com/graphql/",
            json=body,
            headers=HEADERS,
            timeout=10
        )
        if r.status_code != 200:
            print(f"❌ Error de red o API caída (status {r.status_code})")
            return None, "api_error"

        data = r.json()

        if "errors" in data:
            error_msg = str(data["errors"])
            if "PersistedQueryNotFound" in error_msg or "Invalid extended query" in error_msg:
                print(f"❌ SHA Inválido detectado.")
                if not estado.get("sha_error_alertado", False):
                    send_telegram(
                        "⚠️ <b>SHA de Eneba ha cambiado o es inválido</b>\n"
                        "La API ha respondido con errores de Query persistida."
                    )
                    estado["sha_error_alertado"] = True
                return None, "sha_error"
            else:
                print(f"⚠️ Error GraphQL genérico: {error_msg}")
                return None, "api_error"

        if estado.get("sha_error_alertado", False):
            send_telegram("✅ <b>Tracker Recuperado:</b> El SHA de Eneba vuelve a funcionar de forma automática.")
            estado["sha_error_alertado"] = False
            
        try:
            edges = data["data"]["productNoCache"]["auctions"]["edges"]
        except (KeyError, TypeError):
            return None, "sin_stock"
            
        prices_con_stock = [
            e["node"]["price"]["amount"]
            for e in edges
            if e["node"]["isInStock"]
            and e["node"]["isCurrentlyAvailable"]
            and e["node"]["price"]["amount"] > 0
        ]
        if prices_con_stock:
            return min(prices_con_stock), "ok"
        else:
            return None, "sin_stock"

    except Exception as e:
        print(f"Error de red en {slug}: {e}")
        return None, "api_error"

def cargar_estado():
    try:
        r = requests.get(
            f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
            headers=GITHUB_HEADERS,
            timeout=10
        )
        if r.status_code == 200:
            contenido = base64.b64decode(r.json()["content"]).decode("utf-8")
            return json.loads(contenido)
    except Exception as e:
        print(f"Error cargando estado: {e}")
    return {"monedas": {}, "historial": [], "resumenes": {}, "stock": {}, "sha_error_alertado": False}

def guardar_estado(estado):
    try:
        r = requests.get(
            f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
            headers=GITHUB_HEADERS,
            timeout=10
        )
        sha = None
        if r.status_code == 200:
            res_json = r.json()
            sha = res_json.get("sha")
            try:
                contenido_previo = json.loads(base64.b64decode(res_json["content"]).decode("utf-8"))
                historial_viejo = len(contenido_previo.get("historial", []))
                historial_nuevo = len(estado.get("historial", []))
                if historial_viejo > 0 and historial_nuevo == 0:
                    print("🛑 ABORTO DE SEGURIDAD: El historial se ha vaciado a 0 inesperadamente.")
                    return
            except Exception:
                pass

        contenido = json.dumps(estado, indent=2).encode("utf-8")
        contenido_b64 = base64.b64encode(contenido).decode("utf-8")
        
        body = {
            "message": "Actualizar estado",
            "content": contenido_b64,
        }
        if sha:
            body["sha"] = sha
        requests.put(
            f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
