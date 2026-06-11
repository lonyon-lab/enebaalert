# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  ENEBA PRICE TRACKER (MÁRGENES DINÁMICOS PORCENTUALES Y ANTI-SPAM)          ║
# ║  Trackea ratios de tarjetas Xbox en Eneba y avisa por Telegram                ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ─── SHA (ACTUALIZAR SI LA API FALLA) ────────────────────────────────────────
SHA = "c3aaf0194bab3a8481512069d9bbc707037714c0a60f603497bc820f00a91c11_50e5e0d9351bb05ab629b0eda9b116ae4d96fbb6861836383bc404f1ab5e3680094635224c07d364fff371b7517712ebd33ce0f05504f2fa7e9d66e321168e02"

# ─── MÁRGENES DINÁMICOS EXIGENTES (PORCENTAJES VS MERCADO) ────────────────────
# > 1.00 significa Arbitraje (ganas dinero frente al cambio oficial del banco).
# Filtro avanzado para evitar alertas con precios normales de mercado.
MARGENES_OBJETIVO = {
    "BRL": 1.090,   # 🇧🇷 Exiges un +9.0% sobre el mercado (Evita alertas con el +7.6% de hoy)
    "COP": 1.050,   # 🇨🇴 Exiges un +5.0% sobre el mercado (Evita alertas con el +3.6% de hoy)
    "ZAR": 1.045,   # 🇿🇦 Exiges un +4.5% sobre el mercado (Evita alertas con el +3.2% de hoy)
    "SAR": 1.035,   # 🇸🇦 Exiges un +3.5% sobre el mercado (Evita alertas con el +2.3% de hoy)
    
    # Monedas estables o caras donde superar al banco ya es una anomalía brutal:
    "TRY": 1.015,   # 🇹🇷 Exiges un +1.5% sobre el mercado oficial.
    "TWD": 1.015,   # 🇹🇼 Exiges un +1.5% sobre el mercado oficial.
    "HKD": 1.015,   # 🇭🇰 Exiges un +1.5% sobre el mercado oficial.
    "JPY": 1.005,   # 🇯🇵 Exiges un +0.5% (Solo avisa si consigues más yenes de lo que vale el euro)
    "CLP": 1.030,   # 🇨🇱 Exiges un +3.0% sobre el mercado oficial.
}

# Margen de aviso de "atraco" (Cuando el precio se infla demasiado en Eneba)
MARGEN_ALTO_ATRACO = 0.90  # Si el ratio es peor que un -10% vs mercado, avisa de precio alto

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
    },
    "CLP": {
        "nombre": "Peso chileno",
        "bandera": "🇨🇱",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-10-000-clp-xbox-live-key-chile", "valor": 10000},
            {"slug": "xbox-xbox-live-gift-card-20-000-clp-xbox-live-key-chile", "valor": 20000},
            {"slug": "xbox-xbox-live-gift-card-35-000-clp-xbox-live-key-chile", "valor": 35000},
        ],
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
    },
    "HKD": {
        "nombre": "Dólar de Hong Kong",
        "bandera": "🇭🇰",
        "slugs": [
            {"slug": "xbox-xbox-live-gift-card-150-hkd-xbox-live-key-hong-kong", "valor": 150},
            {"slug": "xbox-xbox-live-gift-card-300-hkd-xbox-live-key-hong-kong", "valor": 300},
            {"slug": "xbox-xbox-live-gift-card-600-hkd-xbox-live-key-hong-kong", "valor": 600},
        ],
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
            {"slug": "xbox-xbox-live-gift-card-10-000-jpy-xbox-live-key-japan", "valor": 10000},
        ],
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
import random
from datetime import datetime, timezone, timedelta
from collections import defaultdict

# ─── SESIÓN PERSISTENTE (MEJORA ANTI-BAN) ─────────────────────────────────────
session = requests.Session()

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
    "Connection": "keep-alive"
}
session.headers.update(HEADERS)

HORAS_RECHECK_SIN_STOCK = 2

# ─── FUNCIONES CON REINTENTOS (SAFE_GET / SAFE_POST) ─────────────────────────
def safe_get(url, **kwargs):
    for intento in range(3):
        try:
            resp = session.get(url, timeout=kwargs.get("timeout", 10), headers=kwargs.get("headers"), params=kwargs.get("params"))
            if resp.status_code not in (429, 500, 502, 503, 504):  # Reintentamos 429 y 5xx
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

def safe_post(url, **kwargs):
    for intento in range(3):
        try:
            resp = session.post(url, timeout=kwargs.get("timeout", 10), json=kwargs.get("json"), headers=kwargs.get("headers"))
            if resp.status_code not in (429, 500, 502, 503, 504):  # Reintentamos 429 y 5xx
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

def safe_put(url, **kwargs):
    for intento in range(3):
        try:
            resp = session.put(url, timeout=kwargs.get("timeout", 10), json=kwargs.get("json"), headers=kwargs.get("headers"))
            if resp.status_code not in (409, 429, 500, 502, 503, 504):  # Reintentamos 409, 429 y 5xx
                return resp
            time.sleep(1 * (intento + 1))
        except Exception:
            time.sleep(1 * (intento + 1))
    return None

# ─── FUNCIONES ORIGINALES DE TELEGRAM, API Y GITHUB ───────────────────────────
def send_telegram(msg):
    try:
        safe_get(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            params={"chat_id": CHAT_ID, "text": msg, "parse_mode": "HTML"},
            timeout=10
        )
    except Exception as e:
        print(f"Error enviando Telegram: {e}")

def send_telegram_file(filename, content, caption=""):
    # Punto 6: Usar reintentos para envío de archivos a Telegram
    for intento in range(3):
        try:
            resp = session.post(
                f"https://api.telegram.org/bot{TOKEN}/sendDocument",
                data={"chat_id": CHAT_ID, "caption": caption},
                files={"document": (filename, content, "text/csv")},
                timeout=30
            )
            if resp and resp.status_code not in (429, 500, 502, 503, 504):
                return
            time.sleep(1 * (intento + 1))
        except Exception as e:
            print(f"Error enviando archivo Telegram: {e}")
            time.sleep(1 * (intento + 1))

# --- Fallback de tipo de cambio ---
def get_tipo_cambio_real(monedas, estado):
    # Intentar obtener tipo de cambio actual
    try:
        r = safe_get("https://open.er-api.com/v6/latest/EUR", timeout=5)
        if r and r.status_code == 200:
            rates = r.json().get("rates", {})
            nuevos = {m: rates[m] for m in monedas if m in rates}
            # Guardar como fallback en estado
            estado["ultimos_tipos_cambio"] = nuevos
            return nuevos
    except Exception:
        pass
    # Devolver última tasa guardada (fallback)
    return estado.get("ultimos_tipos_cambio", {})

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
        r = safe_post(
            "https://graphql.eneba.com/graphql/",
            json=body,
            timeout=10
        )
        if not r or r.status_code != 200:
            print(f"❌ Error de red o API caída (status {r.status_code if r else 'no response'})")
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
        r = safe_get(
            f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
            headers=GITHUB_HEADERS,
            timeout=10
        )
        if r and r.status_code == 200:
            contenido = base64.b64decode(r.json()["content"]).decode("utf-8")
            return json.loads(contenido)
    except Exception as e:
        print(f"Error cargando estado: {e}")
    return {"monedas": {}, "historial": [], "resumenes": {}, "stock": {}, "sha_error_alertado": False, "ultimos_tipos_cambio": {}}

def guardar_estado(estado):
    # Punto 1: Manejar condición de carrera con reintentos ante 409 Conflict
    for intento_guardado in range(3):
        try:
            r = safe_get(
                f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
                headers=GITHUB_HEADERS,
                timeout=10
            )
            sha = None
            if r and r.status_code == 200:
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
            res_put = safe_put(
                f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
                headers=GITHUB_HEADERS,
                json=body,
                timeout=10
            )
            if res_put and res_put.status_code == 409:
                # 409 Conflict: otro proceso modificó el archivo, releer y reintentar
                print(f"⚠️ Conflicto 409 al guardar estado (intento {intento_guardado+1}/3), releyendo...")
                time.sleep(2)
                continue
            print("Estado guardado en GitHub ✅")
            return
        except Exception as e:
            print(f"Error guardando estado: {e}")
            return
    print("❌ No se pudo guardar el estado tras 3 intentos por conflictos 409.")

def debe_comprobar_slug(slug, estado, ahora):
    info = estado.get("stock", {}).get(slug)
    if info is None:
        return True
    if info.get("tiene_stock"):
        return True
    ultima = info.get("ultima_comprobacion")
    if not ultima:
        return True
    try:
        diff = ahora - datetime.fromisoformat(ultima)
        return diff >= timedelta(hours=HORAS_RECHECK_SIN_STOCK)
    except Exception:
        return True

def actualizar_stock_slug(slug, tiene_stock, ahora, estado):
    if "stock" not in estado:
        estado["stock"] = {}
    estado["stock"][slug] = {
        "tiene_stock": tiene_stock,
        "ultima_comprobacion": ahora.isoformat()
    }

def get_ratios_moneda(config, estado, ahora):
    resultados = []
    for item in config["slugs"]:
        slug = item["slug"]
        valor = item["valor"]

        if not debe_comprobar_slug(slug, estado, ahora):
            print(f"  {valor} = ⚫ Sin stock (sin recomprobar todavía)")
            resultados.append({"valor": valor, "precio_eur": None, "ratio": None, "stock": "sin_stock"})
            continue

        price_cents, estado_slug = get_price(slug, estado)

        if estado_slug == "api_error":
            print(f"  {valor} = ⚠️ Error API (estado sin cambios)")
            resultados.append({"valor": valor, "precio_eur": None, "ratio": None, "stock": "api_error"})
            continue

        if estado_slug == "sha_error":
            print(f"  {valor} = ⚠️ SHA inválido")
            resultados.append({"valor": valor, "precio_eur": None, "ratio": None, "stock": "sha_error"})
            continue

        if estado_slug == "ok":
            actualizar_stock_slug(slug, True, ahora, estado)
            price_eur = price_cents / 100
            ratio = valor / price_eur
            resultados.append({"valor": valor, "precio_eur": price_eur, "ratio": ratio, "stock": "ok"})
            print(f"  {valor} = {price_eur:.2f}€ → {ratio:.2f}/€")
        else:
            actualizar_stock_slug(slug, False, ahora, estado)
            resultados.append({"valor": valor, "precio_eur": None, "ratio": None, "stock": "sin_stock"})
            print(f"  {valor} = ⚫ Sin stock")

        # JITTER: Pausa aleatoria para evitar detección de bot (valor reducido)
        time.sleep(random.uniform(0.3, 0.7))
    return resultados

def procesar_alertas(moneda, config, resultados, estado, tipos_cambio):
    con_stock = [r for r in resultados if r["stock"] == "ok" and r["ratio"]]
    hay_api_error = any(r["stock"] in ("api_error", "sha_error") for r in resultados)
    sin_stock_confirmado = all(r["stock"] == "sin_stock" for r in resultados)

    estado_moneda = estado["monedas"].get(moneda, {
        "ultimo_ratio_alertado": None,
        "sobre_umbral": False,
        "bajo_umbral_bajo": False,
        "sin_datos_alertado": False,
        "api_error_alertado": False,
    })

    if not con_stock:
        if hay_api_error:
            if not estado_moneda.get("api_error_alertado"):
                send_telegram(f"⚠️ <b>API no disponible: {config['bandera']} {moneda}</b>")
                estado_moneda["api_error_alertado"] = True
        elif sin_stock_confirmado:
            estado_moneda["api_error_alertado"] = False
            if not estado_moneda.get("sin_datos_alertado"):
                send_telegram(f"⚠️ <b>Sin stock: {config['bandera']} {moneda}</b>")
                estado_moneda["sin_datos_alertado"] = True
        estado["monedas"][moneda] = estado_moneda
        return

    estado_moneda["sin_datos_alertado"] = False
    estado_moneda["api_error_alertado"] = False

    mejor = max(con_stock, key=lambda x: x["ratio"])
    mejor_ratio = mejor["ratio"]
    tipo_cambio = tipos_cambio.get(moneda)

    if not tipo_cambio:
        return  # Sin cambio del banco en vivo, abortamos evaluación dinámica

    # 🧠 CÁLCULO DINÁMICO RESTRINGIDO DE UMBRALES
    umbral_compra = tipo_cambio * MARGENES_OBJETIVO.get(moneda, 1.00)
    umbral_atraco = tipo_cambio * MARGEN_ALTO_ATRACO

    margen = ((mejor_ratio / tipo_cambio) - 1) * 100
    signo = "+" if margen >= 0 else ""
    comparativa = f"\n💱 Cambio real: {tipo_cambio:.2f} {moneda}/€ ({signo}{margen:.1f}% vs mercado)"

    # Alerta de precio inflado (Atraco en el mercado gris)
    if mejor_ratio < umbral_atraco and not estado_moneda.get("bajo_umbral_bajo"):
        send_telegram(
            f"📉 <b>Precio inflado {config['bandera']} {moneda}</b>\n"
            f"Tarjeta: <b>{mejor['valor']} {moneda}</b> por <b>{mejor['precio_eur']:.2f}€</b>\n"
            f"Ratio actual: {mejor_ratio:.2f} {moneda}/€{comparativa}"
        )
        estado_moneda["bajo_umbral_bajo"] = True
    elif mejor_ratio >= umbral_atraco:
        estado_moneda["bajo_umbral_bajo"] = False

    # Alerta de Arbitraje Real (Compra rentable blindada)
    if mejor_ratio >= umbral_compra:
        ultimo = estado_moneda.get("ultimo_ratio_alertado")
        debe_alertar = False
        if not estado_moneda.get("sobre_umbral"):
            debe_alertar = True
        elif ultimo is not None and mejor_ratio > ultimo + 0.5:
            debe_alertar = True

        if debe_alertar:
            # Detectar empates de ratio maximo (Soporte multi-copa en alertas)
            empates = [r for r in con_stock if round(r["ratio"], 2) == round(mejor_ratio, 2)]
            if len(empates) == 1:
                txt_tarjeta = f"Tarjeta: {empates[0]['valor']} {moneda} por {empates[0]['precio_eur']:.2f}€"
            else:
                txt_tarjeta = "Tarjetas en empate:\n" + "\n".join([f"  • {t['valor']} {moneda} por {t['precio_eur']:.2f}€" for t in empates])

            send_telegram(
                f"🚨 <b>¡Arbitraje Cazado! {config['bandera']} {moneda}</b>\n"
                f"Mejor ratio: <b>{mejor_ratio:.2f} {moneda}/€</b> (Objetivo: >={umbral_compra:.2f})\n"
                f"{txt_tarjeta}"
                f"{comparativa}"
            )
            estado_moneda["ultimo_ratio_alertado"] = mejor_ratio
            estado_moneda["sobre_umbral"] = True
    else:
        estado_moneda["sobre_umbral"] = False
        estado_moneda["ultimo_ratio_alertado"] = None

    estado["monedas"][moneda] = estado_moneda

# ─── MODIFICADO: REDUCCIÓN DE HISTORIAL Y LOG MENSUAL AUTOMÁTICO EN GITHUB ───
def guardar_historial(moneda, resultados, estado, ahora):
    con_stock = [r for r in resultados if r["stock"] == "ok" and r["ratio"]]
    if not con_stock:
        return
    mejor = max(con_stock, key=lambda x: x["ratio"])
    
    estado["historial"].append({
        "moneda": moneda,
        "timestamp": ahora.isoformat(),
        "mejor_ratio": round(mejor["ratio"], 2),
        "mejor_valor": mejor["valor"],
        "mejor_precio_eur": round(mejor["precio_eur"], 4),
    })
    
    # ⏱️ Mantener estado.json súper ligero: Solo guardamos los últimos 30 días en caliente
    limite_caliente = (ahora - timedelta(days=30)).isoformat()
    entradas_viejas = [h for h in estado["historial"] if h["timestamp"] < limite_caliente]
    
    if entradas_viejas:
        # Agrupar entradas viejas por mes real (basado en timestamp de cada registro)
        entradas_por_mes = defaultdict(list)
        for e in entradas_viejas:
            # Punto 7: Validar timestamp antes de procesar para evitar fallos por datos corruptos
            try:
                ts = e.get("timestamp", "")
                if not ts or len(ts) < 7:
                    print(f"⚠️ Entrada con timestamp inválido ignorada: {e}")
                    continue
                # Extraer año-mes del timestamp (formato ISO: "2026-06-11T...")
                mes_key = ts[:7]  # "2026-06"
                datetime.strptime(mes_key, "%Y-%m")  # Validar formato
                entradas_por_mes[mes_key].append(e)
            except Exception:
                print(f"⚠️ Entrada con timestamp corrupto ignorada: {e}")
                continue
        
        # Punto 2: Solo eliminar del historial principal si TODOS los archivados fueron exitosos
        archivado_exitoso = True
        for mes_key, grupo in entradas_por_mes.items():
            fecha_mes = datetime.strptime(mes_key, "%Y-%m")
            if not archivar_en_log_mensual(grupo, fecha_mes):
                archivado_exitoso = False
                print(f"⚠️ Archivado fallido para {mes_key}, no se eliminan entradas del historial principal.")
        
        if archivado_exitoso:
            # Dejar únicamente lo nuevo (últimos 30 días) en el JSON principal
            estado["historial"] = [h for h in estado["historial"] if h["timestamp"] >= limite_caliente]
        else:
            print("⚠️ No se limpió el historial principal por fallos en el archivado mensual.")

def archivar_en_log_mensual(entradas, fecha_archivo):
    """Guarda los registros antiguos en un archivo JSON independiente por Año_Mes en GitHub"""
    nombre_archivo_mes = f"historial_{fecha_archivo.strftime('%Y_%m')}.json"
    url_gh = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{nombre_archivo_mes}"
    
    datos_archivo = []
    sha_archivo = None
    
    # 1. Intentar descargar el archivo mensual si ya existe en el repositorio
    res = safe_get(url_gh, headers=GITHUB_HEADERS, timeout=10)
    if res and res.status_code == 200:
        res_json = res.json()
        sha_archivo = res_json.get("sha")
        try:
            datos_archivo = json.loads(base64.b64decode(res_json["content"]).decode("utf-8"))
        except Exception:
            datos_archivo = []
    
    # 2. Unir registros evitando duplicados basándonos en moneda y marca de tiempo exacta
    timestamps_existentes = {(d["moneda"], d["timestamp"]) for d in datos_archivo}
    for e in entradas:
        if (e["moneda"], e["timestamp"]) not in timestamps_existentes:
            datos_archivo.append(e)
    
    # 3. Guardar de nuevo la actualización del mes en tu repositorio de GitHub
    contenido = json.dumps(datos_archivo, indent=2).encode("utf-8")
    body = {
        "message": f"Archivar registros antiguos en {nombre_archivo_mes}",
        "content": base64.b64encode(contenido).decode("utf-8")
    }
    if sha_archivo: 
        body["sha"] = sha_archivo
    
    res = safe_put(url_gh, headers=GITHUB_HEADERS, json=body, timeout=10)
    if res and res.status_code in (200, 201):
        print(f"Archivadas {len(entradas)} entradas viejas en {nombre_archivo_mes} 📦")
        return True
    else:
        print(f"❌ Error al archivar en {nombre_archivo_mes}: {res.status_code if res else 'sin respuesta'}")
        return False

def debe_enviar_resumen(tipo, estado, ahora):
    ultimo = estado.get("resumenes", {}).get(f"ultimo_{tipo}")
    if tipo == "diario":
        return ultimo != ahora.strftime("%Y-%m-%d")
    elif tipo == "semanal":
        return ultimo != f"{ahora.isocalendar()[0]}-W{ahora.isocalendar()[1]}"
    return False

def marcar_resumen_enviado(tipo, estado, ahora):
    if "resumenes" not in estado:
        estado["resumenes"] = {}
    if tipo == "diario":
        estado["resumenes"]["ultimo_diario"] = ahora.strftime("%Y-%m-%d")
    elif tipo == "semanal":
        estado["resumenes"]["ultimo_semanal"] = f"{ahora.isocalendar()[0]}-W{ahora.isocalendar()[1]}"

def formatear_bloque_moneda(moneda, config, resultados, tipo_cambio):
    con_stock = [r for r in resultados if r["stock"] == "ok" and r["ratio"]]
    lineas = [f"{config['bandera']} <b>{moneda}</b>"]

    if not con_stock:
        for r in resultados:
            if r["stock"] == "api_error":
                lineas.append(f"  {r['valor']} {moneda} → ⚠️ API no disponible")
            else:
                lineas.append(f"  {r['valor']} {moneda} → ⚫ Sin stock")
        lineas.append("")
        return lineas

    mejor_ratio = max(r["ratio"] for r in con_stock)

    for r in resultados:
        if r["stock"] == "api_error":
            lineas.append(f"  {r['valor']} {moneda} → ⚠️ API no disponible")
        elif r["stock"] != "ok":
            lineas.append(f"  {r['valor']} {moneda} → ⚫ Sin stock")
        elif round(r["ratio"], 2) == round(mejor_ratio, 2):  # Soporte multi-copa si empatan ratios
            lineas.append(f"  🏆 <b>{r['valor']} {moneda} → {r['precio_eur']:.2f}€ → {r['ratio']:.2f} {moneda}/€</b>")
        else:
            lineas.append(f"  {r['valor']} {moneda} → {r['precio_eur']:.2f}€ → {r['ratio']:.2f} {moneda}/€")

    if tipo_cambio:
        objetivo_hoy = tipo_cambio * MARGENES_OBJETIVO.get(moneda, 1.00)
        lineas.append(f"  (Objetivo compra hoy: >{objetivo_hoy:.2f})")
        mejor = max(con_stock, key=lambda x: x["ratio"])
        margen = ((mejor['ratio'] / tipo_cambio) - 1) * 100
        signo = "+" if margen >= 0 else ""
        lineas.append(f"  💱 Cambio real: {tipo_cambio:.2f} {moneda}/€ ({signo}{margen:.1f}%)")

    lineas.append("")
    return lineas

# ─── MODIFICADO: ACEPTA LOS RESULTADOS YA DESCARGADOS ─────────────────────────
def enviar_resumen_diario(estado, ahora, tipos_cambio, todos_resultados):
    lineas = [f"📊 <b>Resumen diario Eneba — {ahora.strftime('%d/%m/%Y')}</b>\n"]
    for moneda, config in MONEDAS.items():
        # En vez de llamar a la API otra vez, recuperamos los datos en caché de la Pasada Única
        resultados = todos_resultados.get(moneda, [])
        tipo_cambio = tipos_cambio.get(moneda)
        lineas += formatear_bloque_moneda(moneda, config, resultados, tipo_cambio)
    send_telegram("\n".join(lineas))
    marcar_resumen_enviado("diario", estado, ahora)

def enviar_resumen_semanal(estado, ahora):
    lineas = [f"📈 <b>Resumen semanal Eneba — semana {ahora.isocalendar()[1]}</b>\n"]
    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    for moneda in MONEDAS:
        config = MONEDAS[moneda]
        una_semana = (ahora - timedelta(days=7)).isoformat()
        semana = [h for h in estado["historial"] if h["moneda"] == moneda and h["timestamp"] >= una_semana]
        if not semana:
            lineas.append(f"{config['bandera']} <b>{moneda}</b>: sin datos esta semana\n")
            continue
        mejor = max(semana, key=lambda x: x["mejor_ratio"])
        peor = min(semana, key=lambda x: x["mejor_ratio"])
        mejor_dt = datetime.fromisoformat(mejor["timestamp"])
        peor_dt = datetime.fromisoformat(peor["timestamp"])
        lineas.append(f"{config['bandera']} <b>{moneda}</b>")
        lineas.append(f"  🏆 Mejor: {mejor['mejor_ratio']:.2f} {moneda}/€")
        lineas.append(f"     {dias[mejor_dt.weekday()]} {mejor_dt.strftime('%d/%m')} a las {mejor_dt.strftime('%H:%M')} ({mejor['mejor_valor']} {moneda} por {mejor['mejor_precio_eur']:.2f}€)")
        lineas.append(f"  📉 Peor: {peor['mejor_ratio']:.2f} {moneda}/€")
        lineas.append(f"     {dias[peor_dt.weekday()]} {peor_dt.strftime('%d/%m')} a las {peor_dt.strftime('%H:%M')}\n")
    send_telegram("\n".join(lineas))
    marcar_resumen_enviado("semanal", estado, ahora)

PALABRAS_RESUMEN = ["resu", "resumen", "lista", "enviar", "envio", "precios", "precio", "prices", "summary"]

# ─── MODIFICADO: CONTROLADOR PRINCIPAL CON PASADA ÚNICA ───────────────────────
def main():
    ahora = datetime.now(timezone.utc)
    hora_utc = ahora.hour
    es_lunes = ahora.weekday() == 0

    estado = cargar_estado()
    tipos_cambio = get_tipo_cambio_real(list(MONEDAS.keys()), estado)

    # Punto 4: Avisar si no hay tipos de cambio disponibles
    if not tipos_cambio:
        send_telegram("⚠️ <b>Tracker ciego:</b> No hay tipos de cambio disponibles (API caída y sin fallback). Las alertas de arbitraje no funcionarán hasta que se recupere.")
        print("⚠️ Sin tipos de cambio disponibles.")

    accion = os.environ.get("INPUT_ACCION", "").lower().strip()
    resumen_forzado = accion in PALABRAS_RESUMEN

    # 🚀 [PASADA ÚNICA]: Consultamos Eneba UNA SOLA VEZ al principio del script
    todos_resultados = {}
    print("🚀 Iniciando escaneo único de mercados en Eneba...")
    for moneda, config in MONEDAS.items():
        print(f"  Obteniendo {moneda}...")
        todos_resultados[moneda] = get_ratios_moneda(config, estado, ahora)
        # Punto 2: Si el SHA es inválido, abortar toda la ejecución tras el primer fallo
        if estado.get("sha_error_alertado"):
            print("🛑 SHA inválido detectado. Abortando escaneo para evitar spam.")
            guardar_estado(estado)
            return

    # Si se pulsa el botón manual, procesa el resumen con los datos frescos y corta ejecución
    if resumen_forzado:
        print(f"Resumen forzado por acción: {accion}")
        enviar_resumen_diario(estado, ahora, tipos_cambio, todos_resultados)
        guardar_estado(estado)
        return

    # Turno del informe semanal (Solo lee el historial de GitHub, no consume red)
    if es_lunes and hora_utc >= 9 and debe_enviar_resumen("semanal", estado, ahora):
        print("Enviando resumen semanal...")
        enviar_resumen_semanal(estado, ahora)

    # Turno del informe diario: Usa los datos guardados en memoria, tardando 0 segundos adicionales
    if hora_utc >= 9 and debe_enviar_resumen("diario", estado, ahora):
        print("Enviando resumen diario...")
        enviar_resumen_diario(estado, ahora, tipos_cambio, todos_resultados)

    # Bucle de evaluación de alertas e historial usando los datos ya cacheados
    for moneda, config in MONEDAS.items():
        resultados = todos_resultados[moneda]
        procesar_alertas(moneda, config, resultados, estado, tipos_cambio)
        guardar_historial(moneda, resultados, estado, ahora)

    guardar_estado(estado)

if __name__ == "__main__":
    main()
