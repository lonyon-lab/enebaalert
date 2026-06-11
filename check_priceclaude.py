# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  ENEBA PRICE TRACKER                                                        ║
# ║  Trackea ratios de tarjetas Xbox en Eneba y avisa por Telegram              ║
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
GITHUB_TOKEN = os.environ["GH_TOKEN"]
GITHUB_REPO = "lonyon-lab/enebaalert"
GITHUB_FILE = "estado.json"
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

HORAS_RECHECK_SIN_STOCK = 12

# Estados posibles de una tarjeta:
# "ok"         → API respondió, hay stock
# "sin_stock"  → API respondió, no hay stock
# "api_error"  → API falló (red, timeout)
# "sha_error"  → API respondió pero con errores GraphQL

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
    """
    Retorna (precio_cents, estado_slug) donde estado_slug es uno de:
    "ok", "sin_stock", "api_error", "sha_error"
    """
    if estado.get("sha_error_alertado"):
        return None, "sha_error"

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
            print(f"Respuesta raw: {r.text[:500]}")
            return None, "api_error"

        data = r.json()

        if "errors" in data:
            print(f"❌ Error GraphQL (posible SHA inválido): {data['errors']}")
            print(f"Detalle error raw: {json.dumps(data['errors'])}")
            if not estado.get("sha_error_alertado"):
                send_telegram(
                    "⚠️ <b>SHA de Eneba ha cambiado o es inválido</b>\n"
                    "La API ha respondido con errores.\n"
                    "1. Abre Eneba en el navegador\n"
                    "2. F12 → Network → filtra 'graphql'\n"
                    "3. Abre petición POST → Payload → sha256Hash\n"
                    "4. Actualiza la variable SHA en check_price.py"
                )
                estado["sha_error_alertado"] = True
            return None, "sha_error"

        estado["sha_error_alertado"] = False
        try:
            edges = data["data"]["productNoCache"]["auctions"]["edges"]
        except (KeyError, TypeError):
            print(f"Respuesta inesperada de Eneba para {slug}: {str(data)[:200]}")
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
        contenido = json.dumps(estado, indent=2).encode("utf-8")
        contenido_b64 = base64.b64encode(contenido).decode("utf-8")
        r = requests.get(
            f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
            headers=GITHUB_HEADERS,
            timeout=10
        )
        sha = r.json().get("sha") if r.status_code == 200 else None
        body = {
            "message": "Actualizar estado",
            "content": contenido_b64,
        }
        if sha:
            body["sha"] = sha
        requests.put(
            f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}",
            headers=GITHUB_HEADERS,
            json=body,
            timeout=10
        )
        print("Estado guardado en GitHub ✅")
    except Exception as e:
        print(f"Error guardando estado: {e}")

def debe_comprobar_slug(slug, estado, ahora):
    info = estado.get("stock", {}).get(slug)
    if info is None:
        return True
    if info.get("tiene_stock"):
        return True
    ultima = info.get("ultima_comprobacion")
    if not ultima:
        return True
    diff = ahora - datetime.fromisoformat(ultima)
    return diff >= timedelta(hours=HORAS_RECHECK_SIN_STOCK)

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
            print(f"  {valor} = ⚫ Sin stock (sin recomprobar)")
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
        else:  # sin_stock confirmado
            actualizar_stock_slug(slug, False, ahora, estado)
            resultados.append({"valor": valor, "precio_eur": None, "ratio": None, "stock": "sin_stock"})
            print(f"  {valor} = ⚫ Sin stock")

        time.sleep(0.5)
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
            # API falló, no sabemos el estado real
            if not estado_moneda.get("api_error_alertado"):
                send_telegram(
                    f"⚠️ <b>API no disponible: {config['bandera']} {moneda}</b>\n"
                    f"No se pudo obtener el precio. Se reintentará en la próxima ejecución."
                )
                estado_moneda["api_error_alertado"] = True
        elif sin_stock_confirmado:
            # Sin stock confirmado por la API
            estado_moneda["api_error_alertado"] = False
            if not estado_moneda.get("sin_datos_alertado"):
                send_telegram(
                    f"⚠️ <b>Sin stock: {config['bandera']} {moneda}</b>\n"
                    f"Ninguna tarjeta disponible en este momento."
                )
                estado_moneda["sin_datos_alertado"] = True
        estado["monedas"][moneda] = estado_moneda
        return

    # Hay stock, resetear flags de error
    estado_moneda["sin_datos_alertado"] = False
    estado_moneda["api_error_alertado"] = False

    mejor = max(con_stock, key=lambda x: x["ratio"])
    mejor_ratio = mejor["ratio"]
    umbral = config["umbral"]
    umbral_bajo = config["umbral_bajo"]
    tipo_cambio = tipos_cambio.get(moneda)

    comparativa = ""
    if tipo_cambio:
        margen = ((mejor_ratio / tipo_cambio) - 1) * 100
        signo = "+" if margen >= 0 else ""
        comparativa = f"\n💱 Cambio real: {tipo_cambio:.2f} {moneda}/€ ({signo}{margen:.1f}% vs mercado)"

    if mejor_ratio < umbral_bajo and not estado_moneda.get("bajo_umbral_bajo"):
        send_telegram(
            f"📉 <b>Precio alto {config['bandera']} {moneda}</b>\n"
            f"Ratio actual: {mejor_ratio:.2f} {moneda}/€\n"
            f"Por debajo de tu mínimo de {umbral_bajo}{comparativa}"
        )
        estado_moneda["bajo_umbral_bajo"] = True
    elif mejor_ratio >= umbral_bajo:
        estado_moneda["bajo_umbral_bajo"] = False

    if mejor_ratio >= umbral:
        ultimo = estado_moneda.get("ultimo_ratio_alertado")
        debe_alertar = False
        if not estado_moneda.get("sobre_umbral"):
            debe_alertar = True
        elif ultimo is not None and mejor_ratio > ultimo + 0.5:
            debe_alertar = True

        if debe_alertar:
            send_telegram(
                f"🚨 <b>Alerta {config['bandera']} {moneda}</b>\n"
                f"Mejor ratio: <b>{mejor_ratio:.2f} {moneda}/€</b>\n"
                f"Tarjeta: {mejor['valor']} {moneda} por {mejor['precio_eur']:.2f}€"
                f"{comparativa}"
            )
            estado_moneda["ultimo_ratio_alertado"] = mejor_ratio
            estado_moneda["sobre_umbral"] = True
    else:
        estado_moneda["sobre_umbral"] = False
        estado_moneda["ultimo_ratio_alertado"] = None

    estado["monedas"][moneda] = estado_moneda

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
    limite = (ahora - timedelta(days=180)).isoformat()
    historial_previo = list(estado["historial"])
    estado["historial"] = [h for h in estado["historial"] if h["timestamp"] >= limite]
    if len(estado["historial"]) < len(historial_previo):
        exportar_historial_csv(historial_previo, ahora)

def exportar_historial_csv(historial, ahora):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["moneda", "timestamp", "mejor_ratio", "mejor_valor", "mejor_precio_eur"])
    writer.writeheader()
    writer.writerows(historial)
    contenido = output.getvalue().encode("utf-8")
    nombre = f"historial_eneba_{ahora.strftime('%Y%m%d')}.csv"
    send_telegram_file(nombre, contenido, f"📦 Historial archivado — {ahora.strftime('%d/%m/%Y')}")
    print(f"Historial exportado: {nombre}")

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
    mejor = max((r for r in con_stock if r["ratio"] == mejor_ratio), key=lambda x: x["valor"])

    for r in resultados:
        if r["stock"] == "api_error":
            lineas.append(f"  {r['valor']} {moneda} → ⚠️ API no disponible")
        elif r["stock"] != "ok":
            lineas.append(f"  {r['valor']} {moneda} → ⚫ Sin stock")
        elif r["valor"] == mejor["valor"]:
            lineas.append(f"  🏆 <b>{r['valor']} {moneda} → {r['precio_eur']:.2f}€ → {r['ratio']:.2f} {moneda}/€</b>")
        else:
            lineas.append(f"  {r['valor']} {moneda} → {r['precio_eur']:.2f}€ → {r['ratio']:.2f} {moneda}/€")

    lineas.append(f"  (umbral: {config['umbral']})")

    if tipo_cambio:
        margen = ((mejor['ratio'] / tipo_cambio) - 1) * 100
        signo = "+" if margen >= 0 else ""
        lineas.append(f"  💱 Cambio real: {tipo_cambio:.2f} {moneda}/€ ({signo}{margen:.1f}%)")

    lineas.append("")
    return lineas

def enviar_resumen_diario(estado, ahora, tipos_cambio):
    lineas = [f"📊 <b>Resumen diario Eneba — {ahora.strftime('%d/%m/%Y')}</b>\n"]
    for moneda, config in MONEDAS.items():
        print(f"  Obteniendo {moneda}...")
        resultados = get_ratios_moneda(config, estado, ahora)
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

def main():
    ahora = datetime.now(timezone.utc)
    hora_utc = ahora.hour
    es_lunes = ahora.weekday() == 0

    estado = cargar_estado()

    tipos_cambio = get_tipo_cambio_real(list(MONEDAS.keys()))

    # Comprobar si se pidió resumen manual
    accion = os.environ.get("INPUT_ACCION", "").lower().strip()
    resumen_forzado = accion in PALABRAS_RESUMEN

    if resumen_forzado:
        print(f"Resumen forzado por acción: {accion}")
        enviar_resumen_diario(estado, ahora, tipos_cambio)
        guardar_estado(estado)
        return

    # Resúmenes (independientes del flujo normal)
    if es_lunes and hora_utc >= 9 and debe_enviar_resumen("semanal", estado, ahora):
        print("Enviando resumen semanal...")
        enviar_resumen_semanal(estado, ahora)

    if hora_utc >= 9 and debe_enviar_resumen("diario", estado, ahora):
        print("Enviando resumen diario...")
        enviar_resumen_diario(estado, ahora, tipos_cambio)

    # Comprobación normal (se ejecuta siempre)
    for moneda, config in MONEDAS.items():
        print(f"\nComprobando {moneda}...")
        resultados = get_ratios_moneda(config, estado, ahora)
        procesar_alertas(moneda, config, resultados, estado, tipos_cambio)
        guardar_historial(moneda, resultados, estado, ahora)

    guardar_estado(estado)

if __name__ == "__main__":
    main()
