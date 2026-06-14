// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  TRYENEBA BOT — Bot público de precios TRY en Eneba                          ║
// ║  Worker de Cloudflare (Código Principal Con Huso Horario Flexible)           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { T, MONEDAS_FIAT, HUSOS_HORARIOS, textoAyuda } from './languages.js';

const GITHUB_REPO = "lonyon-lab/enebaalert";
const ESTADO_TRY_FILE = "estado_try_publico.json";
const MAX_CAMBIOS_ALERTA_DIA = 5;      
const MAX_INTERACCIONES_DIA = 200;     // 🎯 Límite ajustado a 200 por día
const RATE_LIMIT_SEGUNDOS = 2;         // 🎯 Ajustado exactamente a 2 segundos
const ALERTA_MIN_VALOR = 0.1;            
const ALERTA_MAX_VALOR = 999999.0;       
const FRECUENCIA_MIN = 1;              
const FRECUENCIA_MAX = 7;              

const MAX_VOTOS_ACTUALIZAR_DIA = 4;
const VOTOS_NECESARIOS = 5;
const MINUTOS_VOTACION = 2;
const MINUTOS_COOLDOWN = 10;
const ARS_CAMBIO_MIN = 100;
const ARS_CAMBIO_MAX = 99999;

// ─── HELPERS KV ───────────────────────────────────────────────────────────────
async function getUsuario(env, chatId) {
  try {
    const val = await env.USERS.get(`user:${chatId}`);
    return val ? JSON.parse(val) : null;
  } catch (e) { return null; }
}

async function setUsuario(env, chatId, datos) {
  try { await env.USERS.put(`user:${chatId}`, JSON.stringify(datos)); } 
  catch (e) { console.error("Error guardando usuario:", e); }
}

async function deleteUsuario(env, chatId) {
  try { await env.USERS.delete(`user:${chatId}`); } catch (e) { }
}

async function getFlag(env, key) {
  try {
    const val = await env.USERS.get(key);
    return val ? JSON.parse(val) : null;
  } catch (e) { return null; }
}

async function setFlag(env, key, valor) {
  try { await env.USERS.put(key, JSON.stringify(valor)); } catch (e) { }
}

// ─── HELPERS GITHUB ───────────────────────────────────────────────────────────
async function leerEstadoTry(env) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${ESTADO_TRY_FILE}`;
  try {
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${env.GH_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "tryeneba-bot"
      }
    });
    if (resp.status !== 200) return null;
    const data = await resp.json();
    const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, "")), c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder("utf-8").decode(bytes));
  } catch (e) { return null; }
}

// ─── HELPERS TELEGRAM ─────────────────────────────────────────────────────────
async function sendTelegram(env, chatId, text) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
  });
}

// ─── RATE LIMITING ─────────────────────────────────────────────────────────────
async function checkRateLimit(env, chatId) {
  const key = `rl:${chatId}`;
  const ultimo = await getFlag(env, key);
  const ahora = Date.now();
  if (ultimo && (ahora - ultimo) < RATE_LIMIT_SEGUNDOS * 1000) return false; 
  await setFlag(env, key, ahora);
  return true;
}

function nuevoUsuario(chatId) {
  return {
    chat_id: chatId,
    idioma: "es",
    moneda: "EUR",
    huso_horario: 2, 
    frecuencia_dias: 1,
    ultimo_resumen: null, 
    alerta_local: null,      
    alerta_activa: false,
    ultima_alerta_enviada: null,
    pausado: false,
    baneado: false,
    cambios_alerta_hoy: 0,
    fecha_cambios_alerta: null,
    interacciones_hoy: 0,       
    fecha_interacciones: null,  
    fecha_alta: new Date().toISOString(),
  };
}

// ─── CÁLCULO DE DIVISAS FIAT ──────────────────────────────────────────────────
function calcularPrecioFiat(precio_eur, moneda, tipo_cambio_manual, tipos_fiat) {
  if (moneda === "EUR") return null;
  const tasa_eur = tipos_fiat["EUR"];
  if (!tasa_eur) return null;

  if (moneda === "ARS" && tipo_cambio_manual) {
    const precio_fiat = (precio_eur * tipo_cambio_manual).toFixed(2);
    return { valor: precio_fiat, tasa: tipo_cambio_manual, manual: true };
  } else {
    const tasa_moneda = tipos_fiat[moneda];
    if (!tasa_moneda) return null;
    const precio_fiat = (precio_eur * (tasa_moneda / tasa_eur)).toFixed(2);
    return { valor: precio_fiat, tasa: tasa_moneda, manual: false };
  }
}

// ─── GENERADOR DE LÍNEAS DE PRECIOS ───────────────────────────────────────────
function generarLineasPrecios(datos, u) {
  const moneda = u?.moneda || "EUR";
  const tipo_cambio_manual = u?.cambio_manual_ars || null;
  const tipos_fiat = datos.tipos_fiat || {};
  const bandera = MONEDAS_FIAT[moneda] || "";

  return Object.entries(datos.precios).map(([v, e]) => {
    const valor_try = Number(v);
    const precio_eur = Number(e);
    
    if (moneda === "EUR") {
      const ratio = (valor_try / precio_eur).toFixed(2);
      return `  ${v} TRY → <b>${precio_eur.toFixed(2)}€</b> → ${ratio} TRY/€`;
    }

    const fiat = calcularPrecioFiat(precio_eur, moneda, tipo_cambio_manual, tipos_fiat);
    if (fiat) {
      const precio_fiat_num = Number(fiat.valor);
      const ratio_fiat = (valor_try / precio_fiat_num).toFixed(2);
      const etiquetaManual = fiat.manual ? " (manual)" : "";
      
      return `  ${v} TRY → <b>${fiat.valor}${bandera} ${moneda}</b>${etiquetaManual} → ${ratio_fiat} TRY/${moneda}`;
    }

    return `  ${v} TRY → <b>${precio_eur.toFixed(2)}€</b>`;
  }).join("\n");
}

function obtenerTextoCambioOficial(datos, u) {
  const moneda = u?.moneda || "EUR";
  const tipos_fiat = datos?.tipos_fiat || {};
  const cambio_eur = datos?.tipo_cambio || "N/A";

  if (moneda === "EUR" || cambio_eur === "N/A") {
    return `<b>${cambio_eur} TRY/€</b>`;
  }

  if (moneda === "ARS" && u?.cambio_manual_ars) {
    return `<b>${u.cambio_manual_ars} ARS/€ (Manual)</b>`;
  }

  const tasa_moneda = tipos_fiat[moneda];
  if (!tasa_moneda) return `<b>${cambio_eur} TRY/€</b>`;

  const cambio_directo = (1 / tasa_moneda).toFixed(2);
  return `<b>${cambio_directo} TRY/${moneda}</b>`;
}

// ─── FILTRADO AUTOMATIZADO POR HUSO HORARIO LOCAL ───────────────────────────
async function procesarResumenesYAlertasAutomatizadas(env, datos) {
  const ahora = new Date();
  const horaUTC = ahora.getUTCHours(); 
  const hoyTimestamp = Date.now();

  let cursor = "";
  let masUsuarios = true;

  while (masUsuarios) {
    const lista = await env.USERS.list({ prefix: "user:", cursor: cursor });
    for (const key of lista.keys) {
      const u = await getUsuario(env, key.name.replace("user:", ""));
      if (!u || u.pausado || u.baneado) continue;

      const lang = u.idioma || "es";

      // 🚨 1. ALERTAS INTELIGENTES
      if (u.alerta_activa && u.alerta_local && datos.precios["300"]) {
        const precio300Eur = datos.precios["300"];
        let precio300Local = precio300Eur;

        if (u.moneda !== "EUR") {
          const fiat = calcularPrecioFiat(precio300Eur, u.moneda, u.cambio_manual_ars, datos.tipos_fiat || {});
          if (fiat) precio300Local = parseFloat(fiat.valor);
        }

        if (precio300Local <= u.alerta_local && u.ultima_alerta_enviada !== precio300Eur) {
          const lineas = generarLineasPrecios(datos, u);
          await sendTelegram(env, u.chat_id, `🎯 <b>ALERTA DE PRECIO DETECTADA</b>\n\n` + lineas);
          u.ultima_alerta_enviada = precio300Eur;
          await setUsuario(env, u.chat_id, u);
        }
      }

      // 📅 2. RESÚMENES PROGRAMADOS (Usa el huso guardado del usuario)
      let horaLocal = horaUTC + (u.huso_horario !== undefined ? u.huso_horario : 2);
      if (horaLocal < 0) horaLocal += 24;
      if (horaLocal >= 24) horaLocal -= 24;

      if (horaLocal === 9) {
        const unDiaMs = 24 * 60 * 60 * 1000;
        const diasPasados = u.ultimo_resumen ? Math.floor((hoyTimestamp - u.ultimo_resumen) / unDiaMs) : 999;

        if (diasPasados >= (u.frecuencia_dias || 1)) {
          const lineas = generarLineasPrecios(datos, u);
          const cambioTexto = obtenerTextoCambioOficial(datos, u);
          await sendTelegram(env, u.chat_id, T[lang].precios(lineas, cambioTexto));
          u.ultimo_resumen = hoyTimestamp;
          await setUsuario(env, u.chat_id, u);
        }
      }
    }
    
    if (lista.list_complete) masUsuarios = false;
    else cursor = lista.cursor;
  }
}

// ─── ENRUTADOR COMANDO MONEDA ────────────────────────────────────────────────
async function manejarMoneda(env, chatId, u, lang, partes) {
  if (partes.length !== 2) {
    await sendTelegram(env, chatId, T[lang].monedas_lista);
    return;
  }
  const codigo = partes[1].toUpperCase();
  if (!MONEDAS_FIAT[codigo]) {
    await sendTelegram(env, chatId, T[lang].moneda_error);
    return;
  }
  
  if (u.moneda === codigo) {
    const bandera = MONEDAS_FIAT[codigo] || "";
    const msgYaActiva = lang === "es" 
      ? `ℹ️ Ya tienes configurada la moneda ${bandera} <b>${codigo}</b>. No se han realizado cambios.`
      : `ℹ️ You already have ${bandera} <b>${codigo}</b> configured. No changes were made.`;
    await sendTelegram(env, chatId, msgYaActiva);
    return;
  }
  
  const nuevoHuso = HUSOS_HORARIOS[codigo] || 2;
  const actualizado = { ...u, moneda: codigo, huso_horario: nuevoHuso, alerta_local: null, alerta_activa: false, cambio_manual_ars: null };
  await setUsuario(env, chatId, actualizado);
  await sendTelegram(env, chatId, T[lang].moneda_ok(codigo, MONEDAS_FIAT[codigo]));
  if (codigo === "ARS") await sendTelegram(env, chatId, T[lang].ars_aviso);
}

// ─── ENRUTADOR COMANDO CAMBIO ARS ────────────────────────────────────────────
async function manejarCambio(env, chatId, u, lang, partes) {
  if (u.moneda !== "ARS" || partes.length !== 2) {
    await sendTelegram(env, chatId, T[lang].cambio_error);
    return;
  }
  const valor = parseFloat(partes[1].replace(",", "."));
  if (isNaN(valor) || valor < ARS_CAMBIO_MIN || valor > ARS_CAMBIO_MAX) {
    await sendTelegram(env, chatId, T[lang].cambio_error);
    return;
  }
  await setUsuario(env, chatId, { ...u, cambio_manual_ars: valor });
  await sendTelegram(env, chatId, T[lang].cambio_ok(valor));
}

// ─── MANEJAR COMANDO ACTUALIZAR POR VOTOS ────────────────────────────────────
async function manejarActualizar(env, chatId, u, lang) {
  const hoy = new Date().toISOString().slice(0, 10);
  const votosHoy = u.fecha_votos_actualizar === hoy ? (u.votos_actualizar_hoy || 0) : 0;
  if (votosHoy >= MAX_VOTOS_ACTUALIZAR_DIA) {
    await sendTelegram(env, chatId, T[lang].actualizar_limite);
    return;
  }

  const cooldown = await getFlag(env, "actualizar_cooldown_hasta");
  if (cooldown && Date.now() < cooldown) {
    const minutosRestantes = Math.ceil((cooldown - Date.now()) / 60000);
    await sendTelegram(env, chatId, T[lang].actualizar_cooldown(minutosRestantes));
    return;
  }

  const ronda = await getFlag(env, "actualizar_ronda") || { votos: [], inicio: null };
  const ahora = Date.now();

  if (ronda.inicio && (ahora - ronda.inicio) > MINUTOS_VOTACION * 60 * 1000) {
    ronda.votos = [];
    ronda.inicio = null;
  }

  if (ronda.votos.includes(chatId)) {
    await sendTelegram(env, chatId, T[lang].actualizar_ya_votaste(ronda.votos.length));
    return;
  }

  if (!ronda.inicio) ronda.inicio = ahora;
  ronda.votos.push(chatId);
  const numVoto = ronda.votos.length;

  await setUsuario(env, chatId, { ...u, votos_actualizar_hoy: votosHoy + 1, fecha_votos_actualizar: hoy });

  if (numVoto >= VOTOS_NECESARIOS) {
    for (const vid of ronda.votos) {
      const vu = await getUsuario(env, vid);
      await sendTelegram(env, vid, T[vu?.idioma || "en"].actualizar_lanzado);
    }
    await setFlag(env, "actualizar_esperando", ronda.votos);
    await setFlag(env, "actualizar_cooldown_hasta", ahora + MINUTOS_COOLDOWN * 60 * 1000);
    await setFlag(env, "actualizar_ronda", { votos: [], inicio: null });
    await dispatchActualizacion(env);
  } else {
    await setFlag(env, "actualizar_ronda", ronda);
    await sendTelegram(env, chatId, T[lang].actualizar_voto(numVoto));
  }
}

async function dispatchActualizacion(env) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/check_price.yml/dispatches`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GH_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "tryeneba-bot"
    },
    body: JSON.stringify({ ref: "main", inputs: { accion: "" } })
  });
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("OK");

    const url = new URL(request.url);
    if (url.pathname === "/notify") {
      try {
        const body = await request.json();
        if (body.secret !== env.NOTIFY_SECRET) return new Response("Unauthorized", { status: 401 });
        
        await procesarResumenesYAlertasAutomatizadas(env, body.datos);
        
        const esperando = await getFlag(env, "actualizar_esperando") || [];
        for (const vid of esperando) {
          const vu = await getUsuario(env, vid);
          const lineas = generarLineasPrecios(body.datos, vu);
          const cambioTexto = obtenerTextoCambioOficial(body.datos, vu);
          await sendTelegram(env, vid, T[vu?.idioma || "en"].precios(lineas, cambioTexto));
        }
        await setFlag(env, "actualizar_esperando", []);

      } catch (e) { console.error("Error en /notify:", e); }
      return new Response("OK");
    }

    let update;
    try { update = await request.json(); } catch (e) { return new Response("OK"); }

    const message = update.message;
    if (!message || !message.text) return new Response("OK");

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    try {
      if (await getFlag(env, "bot_activo") === false) {
        const u = await getUsuario(env, chatId);
        await sendTelegram(env, chatId, T[u?.idioma || "es"].mantenimiento);
        return new Response("OK");
      }

      if (!await checkRateLimit(env, chatId)) return new Response("OK");

      let u = await getUsuario(env, chatId);
      if (u?.baneado) return new Response("OK");

      if (!text.startsWith("/")) {
        await sendTelegram(env, chatId, T[u?.idioma || "es"].comando_desconocido);
        return new Response("OK");
      }

      if (u) {
        const hoy = new Date().toISOString().slice(0, 10);
        let interaccionesHoy = u.fecha_interacciones === hoy ? (u.interacciones_hoy || 0) : 0;
        if (interaccionesHoy >= MAX_INTERACCIONES_DIA) {
          await sendTelegram(env, chatId, T[u.idioma || "es"].limite_diario);
          return new Response("OK");
        }
        u.interacciones_hoy = interaccionesHoy + 1;
        u.fecha_interacciones = hoy;
        await setUsuario(env, chatId, u);
      }

      const partes = text.split(/\s+/);
      const comando = partes[0].toLowerCase();
      const lang = u?.idioma || "es";

      await procesarComando(env, chatId, comando, partes, u, lang, message);

    } catch (e) { console.error("Error general:", e); }

    return new Response("OK");
  }
};

// ─── PROCESAR COMANDOS ENRUTADOS ─────────────────────────────────────────────
async function procesarComando(env, chatId, comando, partes, u, lang, message) {
  const comandosPrecios = ["/precios", "/prices", "/start", "/config", "/actualizar", "/refresh", "/alerta", "/alert"];
  
  const alias = {
    "/help": "/ayuda", "/frequency": "/frecuencia", "/alert": "/alerta",
    "/notifications": "/notificaciones", "/currency": "/moneda", "/currencies": "/eligemoneda",
    "/choosecurrency": "/eligemoneda", "/prices": "/precios", "/refresh": "/actualizar",
    "/unsubscribe": "/baja", "/rate": "/cambio"
  };
  const cmdFinal = alias[comando] || comando;

  let datos = null;
  if (comandosPrecios.includes(cmdFinal)) datos = await leerEstadoTry(env);
  const cambioTexto = datos ? obtenerTextoCambioOficial(datos, u) : "N/A";

  if (cmdFinal === "/start") {
    if (u) { await sendTelegram(env, chatId, T[lang].ya_suscrito); return; }
    const langCode = message?.from?.language_code || "en";
    const langDetectado = langCode.startsWith("es") ? "es" : "en";
    const nuevo = { ...nuevoUsuario(chatId), idioma: langDetectado, interacciones_hoy: 1, fecha_interacciones: new Date().toISOString().slice(0, 10) };
    await setUsuario(env, chatId, nuevo);
    await sendTelegram(env, chatId, T[langDetectado].bienvenida(cambioTexto));

  } else if (cmdFinal === "/lang") {
    const nuevoLang = partes[1]?.toLowerCase();
    if (!T[nuevoLang]) {
      await sendTelegram(env, chatId, "🌐文A <b>Select language / Selecciona idioma:</b>\n\n• 🇪🇸 <code>/lang es</code>\n• 🇬🇧 <code>/lang en</code>\n• 🇫🇷 <code>/lang fr</code>\n• 🇩🇪 <code>/lang de</code>\n• 🇵🇹 <code>/lang pt</code>\n• 🇮🇹 <code>/lang it</code>");
      return;
    }
    await setUsuario(env, chatId, { ...u, idioma: nuevoLang });
    await sendTelegram(env, chatId, T[nuevoLang].lang_ok);

  } else if (cmdFinal === "/config") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    await sendTelegram(env, chatId, T[lang].config(u, cambioTexto));

  } else if (cmdFinal === "/frecuencia") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    if (partes.length < 2) { 
      await sendTelegram(env, chatId, T[lang].frecuencia_info(u.frecuencia_dias, u.huso_horario !== undefined ? u.huso_horario : 2)); 
      return; 
    }
    
    const valor = parseInt(partes[1]);
    if (isNaN(valor)) {
      await sendTelegram(env, chatId, T[lang].frecuencia_error);
      return;
    }

    if (valor < 1 || valor > 7 || partes[1].startsWith("-") || partes[1].startsWith("+")) {
      if (valor < -12 || valor > 14) { 
        await sendTelegram(env, chatId, T[lang].frecuencia_error); 
        return; 
      }
      await setUsuario(env, chatId, { ...u, huso_horario: valor });
      await sendTelegram(env, chatId, T[lang].frecuencia_ok_huso(valor));
      return;
    }

    await setUsuario(env, chatId, { ...u, frecuencia_dias: valor });
    await sendTelegram(env, chatId, T[lang].frecuencia_ok_dias(valor));

  } else if (cmdFinal === "/alerta") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    if (partes.length < 2) {
      await sendTelegram(env, chatId, T[lang].alerta_info(u.alerta_local, u.moneda));
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const cambiosHoy = u.fecha_cambios_alerta === hoy ? u.cambios_alerta_hoy : 0;
    if (cambiosHoy >= MAX_CAMBIOS_ALERTA_DIA) { await sendTelegram(env, chatId, T[lang].alerta_limite); return; }

    if (partes[1]?.toLowerCase() === "off") {
      await setUsuario(env, chatId, { ...u, alerta_local: null, alerta_activa: false, cambios_alerta_hoy: cambiosHoy + 1, fecha_cambios_alerta: hoy });
      await sendTelegram(env, chatId, T[lang].alerta_off_ok);
      return;
    }

    const valorLocal = parseFloat(partes[1]?.replace(",", "."));
    if (isNaN(valorLocal) || valorLocal < ALERTA_MIN_VALOR || valorLocal > ALERTA_MAX_VALOR) { 
      await sendTelegram(env, chatId, T[lang].alerta_error(u.moneda)); 
      return; 
    }
    
    await setUsuario(env, chatId, { ...u, alerta_local: valorLocal, alerta_activa: true, cambios_alerta_hoy: cambiosHoy + 1, fecha_cambios_alerta: hoy });
    await sendTelegram(env, chatId, T[lang].alerta_ok(valorLocal, u.moneda));

  } else if (cmdFinal === "/notificaciones") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    const nuevoPausado = !u.pausado;
    await setUsuario(env, chatId, { ...u, pausado: nuevoPausado });
    await sendTelegram(env, chatId, nuevoPausado ? T[lang].notificaciones_off : T[lang].notificaciones_on);

  } else if (cmdFinal === "/precios") {
    if (!datos) { await sendTelegram(env, chatId, T[lang].error_precios); return; }
    const lineas = generarLineasPrecios(datos, u);
    await sendTelegram(env, chatId, T[lang].precios(lineas, cambioTexto));

  } else if (cmdFinal === "/baja") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    if (partes[1]?.toLowerCase() === "confirmar") { await deleteUsuario(env, chatId); await sendTelegram(env, chatId, T[lang].baja_ok); } 
    else await sendTelegram(env, chatId, T[lang].baja_confirmacion);

  } else if (cmdFinal === "/moneda") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    await manejarMoneda(env, chatId, u, lang, partes);

  } else if (cmdFinal === "/eligemoneda") {
    await sendTelegram(env, chatId, T[lang].monedas_lista);

  } else if (cmdFinal === "/cambio") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    await manejarCambio(env, chatId, u, lang, partes);

  } else if (cmdFinal === "/actualizar") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    await manejarActualizar(env, chatId, u, lang);

  } else if (cmdFinal === "/ayuda" || comando === "/help") {
    await sendTelegram(env, chatId, textoAyuda(lang));

  } else {
    await sendTelegram(env, chatId, T[lang].comando_desconocido);
  }
}
