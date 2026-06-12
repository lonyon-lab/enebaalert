import requests
import json
import re

# Configuración
URL = "https://graphql.eneba.com/graphql/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Content-Type": "application/json",
    "Origin": "https://www.eneba.com",
    "Referer": "https://www.eneba.com/"
}

# La misma query que usas en tu script (sin el hash)
QUERY = """
query ProductNoCache($slug: String!, $currency: CurrencyType!, $context: ContextInput!, $language: LanguageCode!, $version: Int!, $abTests: [String!], $packContext: ContextInput, $isProductVariantSearch: Boolean!, $isCheapestAuctionIncluded: Boolean!, $loadCoinsValue: Boolean!) {
  productNoCache(slug: $slug, currency: $currency, context: $context, language: $language, version: $version, abTests: $abTests, packContext: $packContext) {
    auctions(isProductVariantSearch: $isProductVariantSearch, isCheapestAuctionIncluded: $isCheapestAuctionIncluded, loadCoinsValue: $loadCoinsValue) {
      edges {
        node {
          price {
            amount
          }
          isInStock
          isCurrentlyAvailable
        }
      }
    }
  }
}
"""

VARIABLES = {
    "isProductVariantSearch": True,
    "isCheapestAuctionIncluded": True,
    "loadCoinsValue": False,
    "currency": "EUR",
    "context": {"country": "ES", "region": "spain", "language": "es_ES"},
    "slug": "xbox-xbox-live-gift-card-1000-jpy-xbox-live-key-japan",  # cualquier slug válido
    "language": "es_ES",
    "version": 3,
    "abTests": ["CFD755"],
    "packContext": {"country": "ES", "region": "spain", "language": "es_ES"}
}

def obtener_sha_por_apq():
    # Primero, intentamos con un hash inválido para que el servidor nos dé el nuevo
    body_invalido = {
        "operationName": "ProductNoCache",
        "variables": VARIABLES,
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": "0000000000000000000000000000000000000000000000000000000000000000"
            }
        }
    }
    resp = requests.post(URL, json=body_invalido, headers=HEADERS)
    if resp.status_code == 200:
        data = resp.json()
        if "errors" in data:
            for err in data["errors"]:
                # A veces el mensaje contiene el hash correcto
                if "PersistedQueryNotFound" in err.get("message", ""):
                    # Extraer el hash del mensaje? No siempre.
                    # En lugar de eso, hacemos una segunda petición con el query completo
                    pass
    # Segunda petición: enviamos el query completo sin hash
    body_completo = {
        "operationName": "ProductNoCache",
        "variables": VARIABLES,
        "query": QUERY
    }
    resp2 = requests.post(URL, json=body_completo, headers=HEADERS)
    if resp2.status_code == 200:
        data2 = resp2.json()
        # En la respuesta exitosa, puede venir el hash en extensions.persistedQuery.sha256Hash
        # O podemos extraerlo de las cabeceras? Generalmente no.
        # Lo que hacemos: buscar en la respuesta si hay un campo que indique el hash.
        # Si no, capturamos el hash que el servidor ha generado para esta query.
        # Normalmente, tras enviar una query completa, el servidor la registra y en sucesivas peticiones se puede usar el hash.
        # Para obtener el hash, podemos hacer una tercera petición con un hash inválido y leer el error (a veces viene el hash esperado).
        # O más simple: el hash suele estar en la respuesta de la primera consulta exitosa como un campo "extensions"?
        # En la práctica, tras enviar el query completo, el servidor devuelve datos normales. No devuelve el hash.
        # La forma más fiable es usar la técnica de "APQ" que implementan los clientes:
        # - Envías query + hash (el hash es el hash de la query). Si no existe, el servidor responde con PersistedQueryNotFound.
        # - Entonces reenvías la query completa, y el servidor la almacena y responde.
        # - A partir de ese momento, puedes usar el hash.
        # Por tanto, el hash correcto es el hash SHA-256 de la query (en minúsculas).
        import hashlib
        query_hash = hashlib.sha256(QUERY.encode()).hexdigest()
        # Ese es el primer hash. El segundo hash? En tu script hay dos separados por _
        # El segundo hash es el mismo pero con algún otro parámetro? Observa que tu SHA actual tiene dos partes iguales? No, son diferentes.
        # En realidad, Eneba usa un esquema de dos hashes: uno para la query y otro para las variables? No.
        # Revisando tu SHA: c3aaf019..._50e5e0d9...
        # Parece que son dos hashes de 64 caracteres. ¿Uno es de la query y otro de las variables?
        # Para obtener el segundo, necesitamos saber qué más se incluye.
        # Como esto se complica, voy a sugerir un método alternativo más sencillo: extraer el SHA de la propia página web usando un patrón más específico.
        # Dado que el tiempo es valioso, propongo usar un script que busque en los archivos JS el patrón exacto de dos hashes que coincida con el que usas.
        print("Método APQ no es trivial por la doble hash. Mejor usar extracción mejorada.")
        return None
    return None

def extraer_sha_de_js():
    # Descargar el JS principal de Eneba (puede estar en un bundle con nombre dinámico)
    # Usar Selenium? Es demasiado.
    # Mejor: buscar en el HTML el script que contiene la configuración de GraphQL.
    # A menudo aparece en una etiqueta <script> con id="__NEXT_DATA__" o similar.
    import re, requests
    url = "https://www.eneba.com/"
    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        return None
    # Buscar patrón de dos hashes de 64 hex separados por _
    patron = re.compile(r'[a-f0-9]{64}_[a-f0-9]{64}')
    # Buscar en el HTML
    encontrados = patron.findall(r.text)
    if encontrados:
        # Devolver el primero que coincida con el formato (puede haber varios)
        # El que usas tiene una longitud de 129 caracteres, asegurarnos
        for sha in encontrados:
            if len(sha) == 129 and sha.count('_') == 1:
                return sha
    # Si no, buscar en scripts JS enlazados
    urls_js = re.findall(r'<script[^>]+src="([^"]+\.js)"', r.text)
    for js_url in urls_js:
        js_url = requests.compat.urljoin(url, js_url)
        js_resp = requests.get(js_url, headers=HEADERS)
        if js_resp.status_code == 200:
            encontrados_js = patron.findall(js_resp.text)
            for sha in encontrados_js:
                if len(sha) == 129 and sha.count('_') == 1:
                    return sha
    return None

if __name__ == "__main__":
    sha = extraer_sha_de_js()
    if sha:
        with open("sha.txt", "w") as f:
            f.write(sha)
        print(f"SHA guardado: {sha}")
    else:
        print("No se encontró el SHA correcto.")
