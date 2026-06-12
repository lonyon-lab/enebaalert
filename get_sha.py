import re
import sys
from playwright.sync_api import sync_playwright

def obtener_sha():
    with sync_playwright() as p:
        # Lanzar Chromium en modo headless (sin ventana)
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        sha = None
        
        # Función que se ejecuta en cada petición
        def on_request(request):
            nonlocal sha
            # Solo nos interesan las peticiones a graphql
            if "graphql.eneba.com/graphql" in request.url:
                try:
                    # Obtener el cuerpo de la petición (post data)
                    post_data = request.post_data
                    if post_data:
                        # Buscar el patrón del SHA: dos hashes de 64 hex separados por _
                        match = re.search(r'[a-f0-9]{64}_[a-f0-9]{64}', post_data)
                        if match:
                            sha = match.group()
                            print(f"SHA encontrado: {sha}")
                except:
                    pass
        
        # Registrar el listener antes de navegar
        page.on("request", on_request)
        
        # Navegar a una página que haga la petición GraphQL (ejemplo: una tarjeta de Xbox)
        print("Navegando a Eneba...")
        page.goto("https://www.eneba.com/xbox-xbox-live-gift-card-1000-jpy-xbox-live-key-japan")
        
        # Esperar unos segundos a que se cargue y se hagan las peticiones
        page.wait_for_timeout(5000)
        
        browser.close()
        return sha

if __name__ == "__main__":
    sha = obtener_sha()
    if sha:
        with open("sha.txt", "w") as f:
            f.write(sha)
        print(f"SHA guardado en sha.txt: {sha}")
    else:
        print("No se pudo obtener el SHA.")
        sys.exit(1)
