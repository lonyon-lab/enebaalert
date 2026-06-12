# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  EXPERIMENTO: Extraer sha256Hash de Eneba automáticamente                   ║
# ║  Busca en los bundles JS de la web el hash de la persisted query           ║
# ║  ProductNoCache y lo guarda en sha_encontrado.txt en el repo               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

import os
import re
import json
import base64
import requests

GITHUB_REPO = "lonyon-lab/enebaalert"
GITHUB_TOKEN = os.environ["GH_TOKEN"]
GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*",
    "Accept-Language": "es_ES",
}

URL_PRODUCTO = "https://www.eneba.com/es/xbox-xbox-live-gift-card-25-try-xbox-live-key-turkey"

# Patrón típico de un sha256 (64 hex) + opcionalmente otro bloque tras "_"
PATRON_SHA = re.compile(r'"([a-f0-9]{64}(?:_[a-f0-9]{200,}[a-f0-9]{2})?)"')
# Patrón para encontrar URLs de archivos JS
PATRON_JS = re.compile(r'(?:src|href)="([^"]+\.js[^"]*)"')


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
    print(f"Descargando página de producto: {URL_PRODUCTO}")
    r = requests.get(URL_PRODUCTO, headers=HEADERS, timeout=15)
    print(f"Status página: {r.status_code}, tamaño: {len(r.text)} bytes")

    if r.status_code != 200:
        guardar_en_github("sha_encontrado.txt", f"ERROR: la página devolvió status {r.status_code}\n")
        return

    html = r.text

    # 1. Buscar URLs de scripts JS en el HTML
    urls_js = PATRON_JS.findall(html)
    urls_js = list(set(urls_js))
    print(f"Encontrados {len(urls_js)} archivos JS en el HTML")

    # Normalizar URLs relativas
    urls_completas = []
    for u in urls_js:
        if u.startswith("http"):
            urls_completas.append(u)
        elif u.startswith("//"):
            urls_completas.append("https:" + u)
        elif u.startswith("/"):
            urls_completas.append("https://www.eneba.com" + u)

    print(f"URLs completas a revisar: {len(urls_completas)}")

    resultados = []
    bundles_revisados = 0

    for url_js in urls_completas:
        try:
            rjs = requests.get(url_js, headers=HEADERS, timeout=15)
            bundles_revisados += 1
            if rjs.status_code != 200:
                continue

            contenido = rjs.text

            # Buscar "ProductNoCache" cerca de un sha256Hash
            if "ProductNoCache" in contenido:
                # Buscar todos los posibles hashes en el archivo
                matches = PATRON_SHA.findall(contenido)
                # Buscar el más cercano a la palabra "ProductNoCache"
                idx_producto = contenido.find("ProductNoCache")
                mejor_candidato = None
                mejor_distancia = None
                for m in matches:
                    idx_match = contenido.find(m)
                    distancia = abs(idx_match - idx_producto)
                    if mejor_distancia is None or distancia < mejor_distancia:
                        mejor_distancia = distancia
                        mejor_candidato = m

                if mejor_candidato:
                    resultados.append({
                        "url": url_js,
                        "sha_candidato": mejor_candidato,
                        "distancia_caracteres": mejor_distancia,
                        "tamano_bundle": len(contenido)
                    })
                    print(f"  -> Candidato encontrado en {url_js}")
                    print(f"     SHA: {mejor_candidato[:80]}...")
                    print(f"     Distancia a 'ProductNoCache': {mejor_distancia} caracteres")

        except Exception as e:
            print(f"  Error descargando {url_js}: {e}")
            continue

    print(f"\nBundles revisados: {bundles_revisados}")
    print(f"Candidatos encontrados: {len(resultados)}")

    # Construir el contenido del archivo de salida
    salida = []
    salida.append(f"=== RESULTADO EXTRACCIÓN SHA ENEBA ===\n")
    salida.append(f"Página analizada: {URL_PRODUCTO}\n")
    salida.append(f"Archivos JS encontrados en HTML: {len(urls_completas)}\n")
    salida.append(f"Bundles descargados correctamente: {bundles_revisados}\n")
    salida.append(f"Candidatos con 'ProductNoCache': {len(resultados)}\n\n")

    if resultados:
        # Ordenar por distancia (más cercano = más probable)
        resultados.sort(key=lambda x: x["distancia_caracteres"])
        salida.append("--- CANDIDATOS (ordenados por probabilidad) ---\n\n")
        for i, res in enumerate(resultados, 1):
            salida.append(f"Candidato #{i}\n")
            salida.append(f"  URL bundle: {res['url']}\n")
            salida.append(f"  Tamaño bundle: {res['tamano_bundle']} bytes\n")
            salida.append(f"  Distancia a 'ProductNoCache': {res['distancia_caracteres']} caracteres\n")
            salida.append(f"  SHA candidato:\n  {res['sha_candidato']}\n\n")

        mejor = resultados[0]
        salida.append("--- MEJOR CANDIDATO ---\n")
        salida.append(mejor["sha_candidato"] + "\n")
    else:
        salida.append("No se encontró ningún candidato.\n")
        salida.append("Posibles causas:\n")
        salida.append("- El SHA no está en archivos JS estáticos (se genera dinámicamente)\n")
        salida.append("- Los nombres de los bundles no coinciden con el patrón buscado\n")
        salida.append("- La página requiere JavaScript para cargar el contenido relevante\n")

        # Guardar también las URLs de JS encontradas para diagnóstico
        salida.append("\n--- URLs JS encontradas (para diagnóstico) ---\n")
        for u in urls_completas[:50]:
            salida.append(f"  {u}\n")

    contenido_final = "".join(salida)
    print("\n" + contenido_final[:500])

    guardar_en_github("sha_encontrado.txt", contenido_final)


if __name__ == "__main__":
    main()
