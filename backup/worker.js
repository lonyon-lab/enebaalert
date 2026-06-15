// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  TRYENEBA BOT — Bot público de precios TRY en Eneba                          ║
// ║  Worker de Cloudflare (Código Principal Con Huso Horario Flexible)           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { T, MONEDAS_FIAT, SIMBOLOS_MONEDA, HUSOS_HORARIOS, textoAyuda } from './languages.js';

const GITHUB_REPO = "lonyon-lab/enebaalert";
const ESTADO_TRY_FILE = "estado_try_publico.json";
const ESTADO_TRY_PREMIUM_FILE = "estado_try_premium.json";
const MAX_CAMBIOS_ALERTA_DIA = 50;
const MAX_CAMBIOS_ALERTA_DIA_PREMIUM = 200;
const MAX_INTERACCIONES_DIA = 200;
const MAX_INTERACCIONES_DIA_PREMIUM = 600;
const MAX_INTERACCIONES_HORA = 100;
const MAX_INTERACCIONES_HORA_PREMIUM = 300;
const RATE_LIMIT_NO_REGISTRADOS = 10;
const MAX_AVISOS_LIMITE = 5;
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
const VIGILANTE_UMBRAL_MINUTOS = 90;
const MAX_FORCE_PREMIUM_DIA = 2;

// ─── HELPERS KV ───────────────────────────────────────────────────────────────
async function getUsuario(env, chatId) {
  try { const val = await env.USERS.get(`user:${chatId}`); return val ? JSON.parse(val) : null; }
  catch (e) { return null; }
}
async function setUsuario(env, chatId, datos) {
  try { await env.USERS.put(`user:${chatId}`, JSON.stringify(datos)); }
  catch (e) { console.error("Error guardando usuario:", e); }
}
async function deleteUsuario(env, chatId) {
  try { await env.USERS.delete(`user:${chatId}`); } catch (e) { }
}
async function getFlag(env, key) {
  try { const val = await env.USERS.get(key); return val ? JSON.parse(val) : null; }
  catch (e) { return null; }
}
async function setFlag(env, key, valor) {
  try { await env.USERS.put(key, JSON.stringify(valor)); } catch (e) { }
}

// ─── LÓGICA DE PRIVACIDAD Y BAJA ──────────────────────────────────────────────
async function procesarBaja(env, chatId, u, lang) {
  const registroLimites = {
    interacciones_hoy: u.interacciones_hoy || 0,
    cambios_alerta_hoy: u.cambios_alerta_hoy || 0,
    votos_actualizar_hoy: u.votos_actualizar_hoy || 0,
    idioma: u.idioma || "es"
  };
  await env.USERS.put(`limit_temp:${chatId}`, JSON.stringify(registroLimites), { expirationTtl: 86400 });
  await deleteUsuario(env, chatId);
  await sendTelegram(env, chatId, T[lang].baja_confirmacion_text);
}

// ─── MENSAJES DE BIENVENIDA BILINGÜES ─────────────────────────────────────────
function generarBienvenidaNueva(datos) {
  const tasaGbp = datos.tipos_fiat["GBP"];
  const cambioGbp = (1 / tasaGbp).toFixed(2);
  const linkEnebaES = "https://www.eneba.com/es/xbox-xbox-live-gift-card-300-try-xbox-live-key-turkey";
  const linkEnebaGB = "https://www.eneba.com/gb/xbox-xbox-live-gift-card-300-try-xbox-live-key-turkey";

  return (
    `👋 <b>¡Bienvenido! / Welcome!</b>\n\n` +
    `🇪🇸 Cambio: <b>${datos.tipo_cambio} TRY/€</b>\n` +
    `🇬🇧 Current rate: <b>${cambioGbp} TRY/£</b>\n\n` +
    `🤖 <b>¿Qué hace este bot? / What does this bot do?</b>\n` +
    `🇪🇸 Rastrear ofertas de <a href="${linkEnebaES}">Eneba</a> en Gift Cards Xbox 🇹🇷 ₺ TRY y avisarte cuando bajen de precio.\n` +
    `🇬🇧 Track <a href="${linkEnebaGB}">Eneba</a> deals on Xbox 🇹🇷 ₺ TRY gift cards and get alerts when the price drops.\n\n` +
    `ℹ️ Este bot solo busca el precio más bajo en Eneba. No podemos garantizar la fiabilidad de los vendedores.\n` +
    `ℹ️ This bot only looks for the lowest price on Eneba. We cannot guarantee seller reliability.\n\n` +
    `⌨️ /ayuda para ver comandos - ⌨️ /help for commands.`
  );
}

function generarBienvenidaRetorno(datos) {
  const tasaGbp = datos.tipos_fiat["GBP"];
  const cambioGbp = (1 / tasaGbp).toFixed(2);

  return (
    `👋 <b>¡Bienvenido de nuevo! / Welcome back!</b>\n\n` +
    `🇪🇸 Cambio: <b>${datos.tipo_cambio} TRY/€</b>\n` +
    `🇬🇧 Current rate: <b>${cambioGbp} TRY/£</b>\n\n` +
    `🔁 Has vuelto el mismo día, así que conservas tus límites de uso, pero tu configuración anterior se ha eliminado por privacidad.\n` +
    `🔁 You returned the same day, so your usage limits are kept, but your previous settings were deleted for privacy.\n\n` +
    `⌨️ /ayuda para ver comandos - ⌨️ /help for commands.`
  );
}

// ─── HELPERS GITHUB ───────────────────────────────────────────────────────────
async function leerEstadoTry(env, archivo = ESTADO_TRY_FILE) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${archivo}`;
  try {
    const resp = await fetch(url, {
      headers: { "Authorization": `Bearer ${env.GH_TOKEN}`, "Accept": "application/vnd.github+json", "User-Agent": "tryeneba-bot" }
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
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
  });
}

async function sendTelegramConBotones(env, chatId, text, botones) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: { inline_keyboard: botones } })
  });
}

async function editTelegramConBotones(env, chatId, messageId, text, botones) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/editMessageText`;
  await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", reply_markup: { inline_keyboard: botones } })
  });
}

async function deleteMessage(env, chatId, messageId) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/deleteMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId })
  });
}

async function checkRateLimit(env, chatId, segundos = RATE_LIMIT_NO_REGISTRADOS) {
  const key = `rl:${chatId}`;
  const ultimo = await getFlag(env, key);
  const ahora = Date.now();
  if (ultimo && (ahora - ultimo) < segundos * 1000) return false;
  await setFlag(env, key, ahora);
  return true;
}

// ─── CONFIGURACIÓN DEL MENÚ DE COMANDOS EN TELEGRAM ───────────────────────────
async function configurarComandos(env) {
  const token = env.TELEGRAM_TOKEN;
  const commands = [{ command: "help", description: "Ayuda / Help" }];
  await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands })
  });
}

function nuevoUsuario(chatId) {
  return {
    chat_id: chatId, idioma: "es", moneda: "EUR", huso_horario: 2,
    frecuencia_dias: 1, ultimo_resumen: null, alerta_local: null,
    alerta_activa: false, ultima_alerta_enviada: null, pausado: false,
    baneado: false, cambios_alerta_hoy: 0, fecha_cambios_alerta: null,
    interacciones_hoy: 0, interacciones_hora: 0, hora_interacciones: null,
    fecha_interacciones: null, fecha_alta: new Date().toISOString(),
    mensaje_alerta_id: null,
    avisos_limite_hora: 0, avisos_limite_dia: 0,
    premium: false,
    force_premium_hoy: 0, fecha_force_premium: null
  };
}

// ─── CÁLCULO DE DIVISAS FIAT ──────────────────────────────────────────────────
function calcularPrecioFiat(precio_eur, moneda, tipo_cambio_manual, tipos_fiat) {
  if (moneda === "EUR") return null;
  const tasa_eur = tipos_fiat["EUR"];
  if (!tasa_eur) return null;
  if (moneda === "ARS" && tipo_cambio_manual) {
    return { valor: (precio_eur * tipo_cambio_manual).toFixed(2), tasa: tipo_cambio_manual, manual: true };
  } else {
    const tasa_moneda = tipos_fiat[moneda];
    if (!tasa_moneda) return null;
    return { valor: (precio_eur * (tasa_moneda / tasa_eur)).toFixed(2), tasa: tasa_moneda, manual: false };
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

// ─── OBTENER PRECIOS LOCALES CON EQUIVALENCIA A 300 TRY ──────────────────────
function obtenerPreciosLocales(datos, u) {
  if (!datos?.precios) return null;
  const preciosArray = [];
  for (const [valorStr, precioEur] of Object.entries(datos.precios)) {
    const valor = Number(valorStr);
    const fiat = calcularPrecioFiat(Number(precioEur), u.moneda, u.cambio_manual_ars, datos.tipos_fiat || {});
    const precioUnitario = fiat ? Number(fiat.valor) : Number(precioEur);
    const coste300 = (300 / valor) * precioUnitario;
    preciosArray.push({ valor, precioUnitario, coste300 });
  }
  return preciosArray;
}

// ─── EVALUAR Y ENVIAR ALERTA SI PROCEDE (para cambios inmediatos) ─────────────
async function evaluarAlertaInmediata(env, u, datos) {
  if (!u.alerta_activa || !u.alerta_local || !datos?.precios) return u;
  const precioObjetivo = u.alerta_local;
  const ratioObjetivo = 300 / precioObjetivo;
  const tarjetasAlcanzadas = [];

  for (const [valorStr, precioEur] of Object.entries(datos.precios)) {
    const valor = Number(valorStr);
    const fiat = calcularPrecioFiat(Number(precioEur), u.moneda, u.cambio_manual_ars, datos.tipos_fiat || {});
    const precioFiat = fiat ? Number(fiat.valor) : Number(precioEur);
    const ratioTarjeta = valor / precioFiat;

    if (ratioTarjeta >= ratioObjetivo) {
      tarjetasAlcanzadas.push({ valor, precioFiat });
    }
  }

  if (tarjetasAlcanzadas.length > 0) {
    const lang = u.idioma || "es";
    const mensaje = T[lang].alerta_disparada(tarjetasAlcanzadas, u.moneda);
    await sendTelegram(env, u.chat_id, mensaje);
    u.ultima_alerta_enviada = JSON.stringify(tarjetasAlcanzadas);
  }
  return u;
}

// ─── FILTRADO AUTOMATIZADO POR HUSO HORARIO LOCAL (con prioridad premium) ────
async function procesarResumenesYAlertasAutomatizadas(env, datos) {
  const ahora = new Date();
  const horaUTC = ahora.getUTCHours();
  const hoyTimestamp = Date.now();

  // Recopilar todos los usuarios
  const usuarios = [];
  let cursor = "";
  let masUsuarios = true;

  while (masUsuarios) {
    const lista = await env.USERS.list({ prefix: "user:", cursor: cursor });
    for (const key of lista.keys) {
      const u = await getUsuario(env, key.name.replace("user:", ""));
      if (!u || u.pausado || u.baneado) continue;
      usuarios.push(u);
    }
    if (lista.list_complete) masUsuarios = false;
    else cursor = lista.cursor;
  }

  // Ordenar: primero los premium
  usuarios.sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0));

  for (const u of usuarios) {
    const lang = u.idioma || "es";

    // 🚨 1. ALERTAS INTELIGENTES (basadas en ratio 300 TRY)
    if (u.alerta_activa && u.alerta_local && datos.precios) {
      const precioObjetivo = u.alerta_local;
      const ratioObjetivo = 300 / precioObjetivo;

      const tarjetasAlcanzadas = [];
      for (const [valorStr, precioEur] of Object.entries(datos.precios)) {
        const valor = Number(valorStr);
        const fiat = calcularPrecioFiat(Number(precioEur), u.moneda, u.cambio_manual_ars, datos.tipos_fiat || {});
        const precioFiat = fiat ? Number(fiat.valor) : Number(precioEur);
        const ratioTarjeta = valor / precioFiat;

        if (ratioTarjeta >= ratioObjetivo) {
          tarjetasAlcanzadas.push({ valor, precioFiat });
        }
      }

      if (tarjetasAlcanzadas.length > 0 && u.ultima_alerta_enviada !== JSON.stringify(tarjetasAlcanzadas)) {
        const mensaje = T[lang].alerta_disparada(tarjetasAlcanzadas, u.moneda);
        await sendTelegram(env, u.chat_id, mensaje);
        u.ultima_alerta_enviada = JSON.stringify(tarjetasAlcanzadas);
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
}

// ─── NOTIFICAR A VOTANTES ──────────────────────────────────────────────────
async function notificarVotantes(env, datos) {
  const esperando = await getFlag(env, "actualizar_esperando") || [];
  if (esperando.length === 0) return;

  for (const vid of esperando) {
    const vu = await getUsuario(env, vid);
    if (!vu) continue;
    const lang = vu.idioma || "en";
    const lineas = generarLineasPrecios(datos, vu);
    const cambioTexto = obtenerTextoCambioOficial(datos, vu);
    const mensaje = `✅ Precios actualizados / Prices updated\n\n${T[lang].precios(lineas, cambioTexto)}`;
    await sendTelegram(env, vid, mensaje);
  }

  await setFlag(env, "actualizar_esperando", []);
}

// ─── VIGILANTE AUTOMÁTICO ──────────────────────────────────────────────────
async function ejecutarVigilante(env) {
  const ahora = new Date();
  const adminChatId = env.TELEGRAM_CHAT_ID;

  // Comprobar archivo público
  const datosPublico = await leerEstadoTry(env, ESTADO_TRY_FILE);
  const alertadoPublico = (await getFlag(env, "vigilante_alertado_publico")) || false;

  if (!datosPublico || !datosPublico.ultima_actualizacion) {
    if (!alertadoPublico) {
      await sendTelegram(env, adminChatId, "⚠️ <b>Vigilante:</b> No se puede leer el archivo público de precios TRY.");
      await setFlag(env, "vigilante_alertado_publico", true);
    }
  } else {
    const fechaPublico = datosPublico.ultima_actualizacion;
    const antiguedadPublico = (ahora.getTime() - new Date(fechaPublico).getTime()) / 60000;
    if (antiguedadPublico > VIGILANTE_UMBRAL_MINUTOS) {
      if (!alertadoPublico) {
        await sendTelegram(env, adminChatId, `⚠️ <b>Vigilante:</b> Los precios públicos TRY no se actualizan desde hace ${Math.round(antiguedadPublico)} minutos.`);
        await setFlag(env, "vigilante_alertado_publico", true);
      }
    } else {
      if (alertadoPublico) {
        await sendTelegram(env, adminChatId, "✅ <b>Vigilante:</b> Los precios públicos TRY se están actualizando de nuevo.");
        await setFlag(env, "vigilante_alertado_publico", false);
      }
    }
  }

  // Comprobar archivo premium
  const datosPremium = await leerEstadoTry(env, ESTADO_TRY_PREMIUM_FILE);
  const alertadoPremium = (await getFlag(env, "vigilante_alertado_premium")) || false;

  if (!datosPremium || !datosPremium.ultima_actualizacion) {
    if (!alertadoPremium) {
      await sendTelegram(env, adminChatId, "⚠️ <b>Vigilante:</b> No se puede leer el archivo premium de precios TRY.");
      await setFlag(env, "vigilante_alertado_premium", true);
    }
  } else {
    const fechaPremium = datosPremium.ultima_actualizacion;
    const antiguedadPremium = (ahora.getTime() - new Date(fechaPremium).getTime()) / 60000;
    if (antiguedadPremium > VIGILANTE_UMBRAL_MINUTOS) {
      if (!alertadoPremium) {
        await sendTelegram(env, adminChatId, `⚠️ <b>Vigilante:</b> Los precios premium TRY no se actualizan desde hace ${Math.round(antiguedadPremium)} minutos.`);
        await setFlag(env, "vigilante_alertado_premium", true);
      }
    } else {
      if (alertadoPremium) {
        await sendTelegram(env, adminChatId, "✅ <b>Vigilante:</b> Los precios premium TRY se están actualizando de nuevo.");
        await setFlag(env, "vigilante_alertado_premium", false);
      }
    }
  }
}

// ─── EJECUTAR CAMBIO DE MONEDA (usado por comando y callback) ──────────────────
async function ejecutarCambioMoneda(env, chatId, u, lang, codigo) {
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

// ─── MANEJAR COMANDO ACTUALIZAR POR VOTOS (con peso premium corregido) ─────────
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

  let ronda = await getFlag(env, "actualizar_ronda") || { votos: [], inicio: null };
  const ahora = Date.now();

  // Reiniciar ronda si expiró
  if (ronda.inicio && (ahora - ronda.inicio) > MINUTOS_VOTACION * 60 * 1000) {
    ronda = { votos: [], inicio: null };
  }

  // Verificar si el usuario ya votó
  const yaVotado = ronda.votos.find(v => v.chatId === chatId);
  if (yaVotado) {
    // Calcular total de votos equivalentes
    const totalVotos = ronda.votos.reduce((sum, v) => sum + (v.peso || 1), 0);
    await sendTelegram(env, chatId, T[lang].actualizar_ya_votaste(totalVotos));
    return;
  }

  const peso = u.premium ? 3 : 1;
  if (!ronda.inicio) ronda.inicio = ahora;
  ronda.votos.push({ chatId, peso });

  // Calcular total de votos equivalentes
  const totalVotos = ronda.votos.reduce((sum, v) => sum + v.peso, 0);

  await setUsuario(env, chatId, { ...u, votos_actualizar_hoy: votosHoy + 1, fecha_votos_actualizar: hoy });

  if (totalVotos >= VOTOS_NECESARIOS) {
    // Disparar actualización del workflow público
    for (const v of ronda.votos) {
      const vu = await getUsuario(env, v.chatId);
      if (vu) await sendTelegram(env, v.chatId, T[vu.idioma || "en"].actualizar_lanzado);
    }
    await setFlag(env, "actualizar_esperando", ronda.votos.map(v => v.chatId));
    await setFlag(env, "actualizar_cooldown_hasta", ahora + MINUTOS_COOLDOWN * 60 * 1000);
    await setFlag(env, "actualizar_ronda", { votos: [], inicio: null });
    await dispatchActualizacion(env);
  } else {
    await setFlag(env, "actualizar_ronda", ronda);
    await sendTelegram(env, chatId, T[lang].actualizar_voto(totalVotos, VOTOS_NECESARIOS, MINUTOS_VOTACION));
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

// ─── DISPATCH PARA EL WORKFLOW PREMIUM ──────────────────────────────────────
async function dispatchActualizacionPremium(env) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/check_price_premium.yml/dispatches`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GH_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "tryeneba-bot"
    },
    body: JSON.stringify({ ref: "main" })
  });
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────
export default {
  async scheduled(event, env, ctx) {
    await ejecutarVigilante(env);
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/setcommands" && request.method === "GET") {
      if (url.searchParams.get("secret") !== env.NOTIFY_SECRET) {
        return new Response("No autorizado", { status: 401 });
      }
      await configurarComandos(env);
      return new Response("OK – Comandos configurados", { status: 200 });
    }

    // ─── ENDPOINT /notify ──────────────────────────────────────────────────
    if (url.pathname === "/notify" && request.method === "POST") {
      try {
        const body = await request.json();
        if (body.secret !== env.NOTIFY_SECRET) return new Response("Unauthorized", { status: 401 });
        if (body.datos) {
          await notificarVotantes(env, body.datos);
          await procesarResumenesYAlertasAutomatizadas(env, body.datos);
        }
      } catch (e) { console.error("Error en /notify:", e); }
      return new Response("OK");
    }

    if (request.method !== "POST") return new Response("OK");

    let update;
    try { update = await request.json(); } catch (e) { return new Response("OK"); }

    // ─── CALLBACK QUERY ──────────────────────────────────────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = String(cb.message.chat.id);
      const messageId = cb.message.message_id;
      const data = cb.data;
      const u = await getUsuario(env, chatId);
      const lang = u?.idioma || "es";
      const esAdmin = (chatId === env.TELEGRAM_CHAT_ID);

      if (!esAdmin && !u && !await checkRateLimit(env, chatId)) {
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: cb.id })
        });
        return new Response("OK");
      }

      if (data === "baja_confirmar") {
        if (u) await procesarBaja(env, chatId, u, lang);
      } else if (data === "baja_cancelar") {
        if (u) await sendTelegram(env, chatId, T[lang].baja_cancelado);
      } else if (data === "alerta_subir" || data === "alerta_bajar") {
        if (!u) return new Response("OK");
        const moneda = u.moneda || "EUR";
        let objetivo = u.alerta_local;
        if (!objetivo) {
          const archivo = u.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
          const datos = await leerEstadoTry(env, archivo);
          const precios = datos ? obtenerPreciosLocales(datos, u) : null;
          await sendTelegram(env, chatId, T[lang].alerta_info(null, moneda, precios));
          return new Response("OK");
        }

        const hoy = new Date().toISOString().slice(0, 10);
        const cambiosHoy = u.fecha_cambios_alerta === hoy ? u.cambios_alerta_hoy : 0;
        const limiteCambios = u.premium ? MAX_CAMBIOS_ALERTA_DIA_PREMIUM : MAX_CAMBIOS_ALERTA_DIA;
        if (!esAdmin && cambiosHoy >= limiteCambios) {
          await sendTelegram(env, chatId, T[lang].alerta_limite);
          return new Response("OK");
        }

        const factor = data === "alerta_subir" ? 1.01 : 0.99;
        const nuevo = Math.round(objetivo * factor * 100) / 100;

        const archivo = u.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
        const datos = await leerEstadoTry(env, archivo);
        if (!datos) {
          await sendTelegram(env, chatId, "⚠️ No se pudieron verificar los precios ahora, pero tu alerta está guardada.");
        }

        let uActualizado = { ...u, alerta_local: nuevo, alerta_activa: true, cambios_alerta_hoy: esAdmin ? 0 : cambiosHoy + 1, fecha_cambios_alerta: esAdmin ? u.fecha_cambios_alerta : hoy, ultima_alerta_enviada: null };
        let alcanzada = false;
        if (datos) {
          uActualizado = await evaluarAlertaInmediata(env, uActualizado, datos);
          const ratioObjetivo = 300 / nuevo;
          for (const [valorStr, precioEur] of Object.entries(datos.precios)) {
            const valor = Number(valorStr);
            const fiat = calcularPrecioFiat(Number(precioEur), uActualizado.moneda, uActualizado.cambio_manual_ars, datos.tipos_fiat || {});
            const precioFiat = fiat ? Number(fiat.valor) : Number(precioEur);
            if ((valor / precioFiat) >= ratioObjetivo) { alcanzada = true; break; }
          }
        }
        await setUsuario(env, chatId, uActualizado);

        const precios = datos ? obtenerPreciosLocales(datos, uActualizado) : null;
        const cambiosRestantes = esAdmin ? null : limiteCambios - (cambiosHoy + 1);
        const feedbackTexto = alcanzada ? T[lang].alerta_feedback_alcanzado : T[lang].alerta_feedback_no_alcanzado;
        const feedback = `✅ Objetivo ajustado a <b>${nuevo.toFixed(2)}</b> ${moneda}. ${feedbackTexto}`;
        const nuevoTexto = T[lang].alerta_info(nuevo, moneda, precios, cambiosRestantes, feedback);

        const botones = [
          [{ text: T[lang].alerta_boton_bajar, callback_data: "alerta_bajar" }, { text: T[lang].alerta_boton_subir, callback_data: "alerta_subir" }],
          [{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }],
          [{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }],
          [{ text: T[lang].alerta_boton_desactivar, callback_data: "alerta_desactivar" }],
          [{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]
        ];

        try { await editTelegramConBotones(env, chatId, messageId, nuevoTexto, botones); } catch (e) { await sendTelegramConBotones(env, chatId, nuevoTexto, botones); }

        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: cb.id,
            text: lang === "es" ? "✅ Precio actualizado" : "✅ Price updated",
            show_alert: false
          })
        });
        return new Response("OK");
      } else if (data === "alerta_oferta") {
        if (!u) return new Response("OK");
        const moneda = u.moneda || "EUR";
        const archivo = u.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
        const datos = await leerEstadoTry(env, archivo);
        if (!datos?.precios) {
          await sendTelegram(env, chatId, "⚠️ No se pudieron obtener los precios actuales.");
          return new Response("OK");
        }
        const hoy = new Date().toISOString().slice(0, 10);
        const cambiosHoy = u.fecha_cambios_alerta === hoy ? u.cambios_alerta_hoy : 0;
        const limiteCambios = u.premium ? MAX_CAMBIOS_ALERTA_DIA_PREMIUM : MAX_CAMBIOS_ALERTA_DIA;
        if (!esAdmin && cambiosHoy >= limiteCambios) {
          await sendTelegram(env, chatId, T[lang].alerta_limite);
          return new Response("OK");
        }

        const preciosArray = obtenerPreciosLocales(datos, u);
        const mejorTarjeta = preciosArray.reduce((min, p) => p.coste300 < min.coste300 ? p : min, preciosArray[0]);
        const nuevo = Math.floor(mejorTarjeta.coste300 * 0.95 * 100) / 100;

        let uActualizado = { ...u, alerta_local: nuevo, alerta_activa: true, cambios_alerta_hoy: esAdmin ? 0 : cambiosHoy + 1, fecha_cambios_alerta: esAdmin ? u.fecha_cambios_alerta : hoy, ultima_alerta_enviada: null };
        uActualizado = await evaluarAlertaInmediata(env, uActualizado, datos);
        await setUsuario(env, chatId, uActualizado);

        const precios = datos ? obtenerPreciosLocales(datos, uActualizado) : null;
        const cambiosRestantes = esAdmin ? null : limiteCambios - (cambiosHoy + 1);
        const feedback = `✅ Objetivo ajustado a <b>${nuevo.toFixed(2)}</b> ${moneda}. ${T[lang].alerta_feedback_no_alcanzado}`;
        const nuevoTexto = T[lang].alerta_info(nuevo, moneda, precios, cambiosRestantes, feedback);

        const botones = [
          [{ text: T[lang].alerta_boton_bajar, callback_data: "alerta_bajar" }, { text: T[lang].alerta_boton_subir, callback_data: "alerta_subir" }],
          [{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }],
          [{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }],
          [{ text: T[lang].alerta_boton_desactivar, callback_data: "alerta_desactivar" }],
          [{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]
        ];

        try { await editTelegramConBotones(env, chatId, messageId, nuevoTexto, botones); } catch (e) { await sendTelegramConBotones(env, chatId, nuevoTexto, botones); }

        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: cb.id,
            text: lang === "es" ? "✅ Precio actualizado" : "✅ Price updated",
            show_alert: false
          })
        });
        return new Response("OK");
      } else if (data === "alerta_manual") {
        if (!u) return new Response("OK");
        await setUsuario(env, chatId, { ...u, esperando_alerta_manual: true, mensaje_alerta_id: messageId });

        const archivo = u.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
        const datos = await leerEstadoTry(env, archivo);
        let precioActual300 = null;
        if (datos?.precios?.["300"]) {
          const fiat = calcularPrecioFiat(Number(datos.precios["300"]), u.moneda, u.cambio_manual_ars, datos.tipos_fiat || {});
          precioActual300 = fiat ? Number(fiat.valor) : Number(datos.precios["300"]);
        }

        const moneda = u.moneda || "EUR";
        const bandera = MONEDAS_FIAT[moneda] || "";
        const simboloMoneda = SIMBOLOS_MONEDA[moneda] || moneda;
        const simboloLira = "₺";
        const banderaTurquia = "🇹🇷";
        let tablaPrecios = "";
        if (datos?.precios) {
          const preciosArray = obtenerPreciosLocales(datos, u);
          const mejorTarjeta = preciosArray.reduce((min, p) => p.coste300 < min.coste300 ? p : min, preciosArray[0]);
          const lineas = preciosArray
            .sort((a, b) => a.valor - b.valor)
            .map(p => {
              const equivalencia = `x${Math.round(300 / p.valor)} → (${bandera} <b>${p.coste300.toFixed(2)}${simboloMoneda}</b>)`;
              const precioTexto = `<b>${p.precioUnitario.toFixed(2)}${simboloMoneda}</b>`;
              let extra = "";
              if (p.valor === mejorTarjeta.valor) extra = "  💡 Mejor opción";
              return `  ${banderaTurquia} ${p.valor} ${simboloLira} → ${precioTexto} ${equivalencia}${extra}`;
            })
            .join("\n");
          tablaPrecios = `\n\n💵 <b>Precios actuales de referencia</b>\n${lineas}`;
        }

        const promptText = `✏️ Introduce el precio máximo que pagarías por 300 TRY (en <b>${moneda}</b>).\n\n` +
          `💡 Actualmente 300 TRY cuestan <b>${(precioActual300 || 0).toFixed(2)} ${moneda}</b>.` +
          `${tablaPrecios}\n\n` +
          `Envía cualquier otro texto para cancelar.`;

        try {
          await editTelegramConBotones(env, chatId, messageId, promptText, []);
        } catch (e) {
          await sendTelegram(env, chatId, promptText);
        }
      } else if (data === "alerta_desactivar") {
        if (!u) return new Response("OK");
        const moneda = u.moneda || "EUR";

        await setUsuario(env, chatId, { ...u, alerta_local: null, alerta_activa: false });

        const archivo = u.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
        const datos = await leerEstadoTry(env, archivo);
        const precios = datos ? obtenerPreciosLocales(datos, { ...u, alerta_activa: false }) : null;
        const nuevoTexto = T[lang].alerta_info(null, moneda, precios);

        const botones = [
          [{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }],
          [{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }],
          [{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]
        ];

        try { await editTelegramConBotones(env, chatId, messageId, nuevoTexto, botones); } catch (e) { /* ignorar */ }

        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: cb.id, text: T[lang].alerta_desactivada, show_alert: false })
        });
        return new Response("OK");
      } else if (data === "alerta_cancelar" || data === "moneda_cancelar" || data === "lang_cancelar" || data === "config_cancelar" || data === "precios_cancelar") {
        if (!u) return new Response("OK");
        await sendTelegram(env, chatId, textoAyuda(lang));
      } else if (data.startsWith("moneda_")) {
        if (!u) return new Response("OK");
        const codigo = data.replace("moneda_", "");
        if (MONEDAS_FIAT[codigo]) {
          if (u.moneda === codigo) {
            const bandera = MONEDAS_FIAT[codigo] || "";
            const msg = lang === "es"
              ? `ℹ️ Ya tienes configurada la moneda ${bandera} <b>${codigo}</b>. No se han realizado cambios.`
              : `ℹ️ You already have ${bandera} <b>${codigo}</b> configured. No changes were made.`;
            await sendTelegram(env, chatId, msg);
          } else {
            await ejecutarCambioMoneda(env, chatId, u, lang, codigo);
          }
        }
      } else if (data.startsWith("lang_")) {
        if (!u) return new Response("OK");
        const codigo = data.replace("lang_", "");
        if (codigo === "es" || codigo === "en") {
          await setUsuario(env, chatId, { ...u, idioma: codigo });
          await sendTelegram(env, chatId, T[codigo].lang_ok);
        } else {
          await sendTelegram(env, chatId, T[lang].lang_proximamente);
        }
      }

      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cb.id })
      });
      return new Response("OK");
    }

    // ─── MENSAJE NORMAL ──────────────────────────────────────────────────
    const message = update.message;
    if (!message || !message.text) return new Response("OK");

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    try {
      let u = await getUsuario(env, chatId);
      const esAdmin = (chatId === env.TELEGRAM_CHAT_ID);

      if (await getFlag(env, "bot_activo") === false) {
        await sendTelegram(env, chatId, T[u?.idioma || "es"].mantenimiento);
        return new Response("OK");
      }

      if (!esAdmin && !u && !await checkRateLimit(env, chatId)) return new Response("OK");
      if (!esAdmin && u?.baneado) return new Response("OK");

      if (!esAdmin && !u && !text.startsWith("/start") && !text.startsWith("/help") && !text.startsWith("/ayuda")) {
        return new Response("OK");
      }

      if (!text.startsWith("/")) {
        if (u && u.esperando_alerta_manual) {
          const moneda = u.moneda || "EUR";
          const lang = u.idioma || "es";
          const valor = parseFloat(text.replace(",", "."));
          const mensajeAlertaId = u.mensaje_alerta_id;
          const mensajeUsuarioId = message.message_id;

          await deleteMessage(env, chatId, mensajeUsuarioId);

          if (!isNaN(valor) && valor >= ALERTA_MIN_VALOR && valor <= ALERTA_MAX_VALOR) {
            const archivo = u.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
            const datos = await leerEstadoTry(env, archivo);
            if (!datos) {
              if (mensajeAlertaId) {
                const precios = null;
                const limiteCambios = u.premium ? MAX_CAMBIOS_ALERTA_DIA_PREMIUM : MAX_CAMBIOS_ALERTA_DIA;
                const cambiosRestantes = esAdmin ? null : limiteCambios - (u.cambios_alerta_hoy || 0);
                const feedback = "⚠️ No se pudieron verificar los precios ahora, pero tu alerta está guardada.";
                const texto = T[lang].alerta_info(valor, moneda, precios, cambiosRestantes, feedback);
                const botones = [
                  [{ text: T[lang].alerta_boton_bajar, callback_data: "alerta_bajar" }, { text: T[lang].alerta_boton_subir, callback_data: "alerta_subir" }],
                  [{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }],
                  [{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }],
                  [{ text: T[lang].alerta_boton_desactivar, callback_data: "alerta_desactivar" }],
                  [{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]
                ];
                await editTelegramConBotones(env, chatId, mensajeAlertaId, texto, botones);
              }
            } else {
              let uActualizado = { ...u, alerta_local: valor, alerta_activa: true, esperando_alerta_manual: false, ultima_alerta_enviada: null };
              uActualizado = await evaluarAlertaInmediata(env, uActualizado, datos);
              await setUsuario(env, chatId, uActualizado);

              if (mensajeAlertaId) {
                const precios = obtenerPreciosLocales(datos, uActualizado);
                const cambiosHoy = u.fecha_cambios_alerta === new Date().toISOString().slice(0, 10) ? u.cambios_alerta_hoy : 0;
                const limiteCambios = uActualizado.premium ? MAX_CAMBIOS_ALERTA_DIA_PREMIUM : MAX_CAMBIOS_ALERTA_DIA;
                const cambiosRestantes = esAdmin ? null : limiteCambios - cambiosHoy;
                const feedback = `✅ Objetivo ajustado a <b>${valor.toFixed(2)}</b> ${moneda}.`;
                const texto = T[lang].alerta_info(valor, moneda, precios, cambiosRestantes, feedback);
                const botones = [
                  [{ text: T[lang].alerta_boton_bajar, callback_data: "alerta_bajar" }, { text: T[lang].alerta_boton_subir, callback_data: "alerta_subir" }],
                  [{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }],
                  [{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }],
                  [{ text: T[lang].alerta_boton_desactivar, callback_data: "alerta_desactivar" }],
                  [{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]
                ];
                await editTelegramConBotones(env, chatId, mensajeAlertaId, texto, botones);
              }
            }
          } else {
            await setUsuario(env, chatId, { ...u, esperando_alerta_manual: false });
            if (mensajeAlertaId) {
              const archivo = u.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
              const datos = await leerEstadoTry(env, archivo);
              const precios = datos ? obtenerPreciosLocales(datos, u) : null;
              const cambiosHoy = u.fecha_cambios_alerta === new Date().toISOString().slice(0, 10) ? u.cambios_alerta_hoy : 0;
              const limiteCambios = u.premium ? MAX_CAMBIOS_ALERTA_DIA_PREMIUM : MAX_CAMBIOS_ALERTA_DIA;
              const cambiosRestantes = esAdmin ? null : limiteCambios - cambiosHoy;
              const feedback = `❌ Valor no válido. Entrada cancelada.`;
              const texto = T[lang].alerta_info(u.alerta_local, moneda, precios, cambiosRestantes, feedback);
              const botones = u.alerta_activa ? [
                [{ text: T[lang].alerta_boton_bajar, callback_data: "alerta_bajar" }, { text: T[lang].alerta_boton_subir, callback_data: "alerta_subir" }],
                [{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }],
                [{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }],
                [{ text: T[lang].alerta_boton_desactivar, callback_data: "alerta_desactivar" }],
                [{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]
              ] : [
                [{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }],
                [{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }],
                [{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]
              ];
              await editTelegramConBotones(env, chatId, mensajeAlertaId, texto, botones);
            }
          }
          return new Response("OK");
        }
        if (u) await sendTelegram(env, chatId, T[u.idioma || "es"].comando_desconocido);
        return new Response("OK");
      }

      // Contador de interacciones para usuarios registrados (excepto admin)
      if (u && !esAdmin) {
        const ahora = new Date();
        const hoy = ahora.toISOString().slice(0, 10);
        const horaActual = ahora.getHours();

        const limiteDia = u.premium ? MAX_INTERACCIONES_DIA_PREMIUM : MAX_INTERACCIONES_DIA;
        const limiteHora = u.premium ? MAX_INTERACCIONES_HORA_PREMIUM : MAX_INTERACCIONES_HORA;

        // Límite diario
        let interaccionesHoy = u.fecha_interacciones === hoy ? (u.interacciones_hoy || 0) : 0;
        if (interaccionesHoy >= limiteDia) {
          u.avisos_limite_dia = (u.avisos_limite_dia || 0) + 1;
          if (u.avisos_limite_dia >= MAX_AVISOS_LIMITE) {
            u.baneado = true;
            await sendTelegram(env, chatId, "🚫 Has sido baneado permanentemente por exceder los límites de uso repetidamente.");
            await setUsuario(env, chatId, u);
            return new Response("OK");
          }
          await sendTelegram(env, chatId, `⚠️ Has alcanzado el límite de ${limiteDia} interacciones diarias. Aviso ${u.avisos_limite_dia}/${MAX_AVISOS_LIMITE}. Al llegar a ${MAX_AVISOS_LIMITE} serás baneado.`);
          await setUsuario(env, chatId, u);
          return new Response("OK");
        }

        // Límite por hora
        let interaccionesHora = u.hora_interacciones === horaActual ? (u.interacciones_hora || 0) : 0;
        if (interaccionesHora >= limiteHora) {
          u.avisos_limite_hora = (u.avisos_limite_hora || 0) + 1;
          if (u.avisos_limite_hora >= MAX_AVISOS_LIMITE) {
            u.baneado = true;
            await sendTelegram(env, chatId, "🚫 Has sido baneado permanentemente por exceder los límites de uso repetidamente.");
            await setUsuario(env, chatId, u);
            return new Response("OK");
          }
          await sendTelegram(env, chatId, `⚠️ Has alcanzado el límite de ${limiteHora} interacciones por hora. Aviso ${u.avisos_limite_hora}/${MAX_AVISOS_LIMITE}. Al llegar a ${MAX_AVISOS_LIMITE} serás baneado.`);
          await setUsuario(env, chatId, u);
          return new Response("OK");
        }

        u.interacciones_hoy = interaccionesHoy + 1;
        u.fecha_interacciones = hoy;
        u.interacciones_hora = interaccionesHora + 1;
        u.hora_interacciones = horaActual;
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
  const comandosPrecios = ["/precios", "/prices", "/config", "/actualizar", "/refresh", "/alerta", "/alert"];

  const alias = {
    "/help": "/ayuda", "/frequency": "/frecuencia", "/alert": "/alerta",
    "/notifications": "/notificaciones", "/currency": "/moneda", "/currencies": "/eligemoneda",
    "/choosecurrency": "/eligemoneda", "/prices": "/precios", "/refresh": "/actualizar",
    "/unsubscribe": "/baja", "/rate": "/cambio"
  };
  const cmdFinal = alias[comando] || comando;

  const archivo = u?.premium ? ESTADO_TRY_PREMIUM_FILE : ESTADO_TRY_FILE;
  let datos = null;
  if (comandosPrecios.includes(cmdFinal)) datos = await leerEstadoTry(env, archivo);
  const cambioTexto = datos ? obtenerTextoCambioOficial(datos, u) : "N/A";

  if (cmdFinal === "/start") {
    if (u) { await sendTelegram(env, chatId, T[lang].ya_suscrito); return; }
    const langCode = message?.from?.language_code || "en";
    const langDetectado = langCode.startsWith("es") ? "es" : "en";

    const datosInicio = await leerEstadoTry(env, archivo);
    const mensajeBienvenida = datosInicio ? generarBienvenidaNueva(datosInicio) : "👋 <b>¡Bienvenido! / Welcome!</b>\n\nNo se pudieron cargar los precios ahora.";

    const limitePrevioRaw = await env.USERS.get(`limit_temp:${chatId}`);
    const limitePrevio = limitePrevioRaw ? JSON.parse(limitePrevioRaw) : null;

    if (limitePrevio) {
      const idiomaPrevio = limitePrevio.idioma || langDetectado;
      const nuevo = { ...nuevoUsuario(chatId), idioma: idiomaPrevio, interacciones_hoy: limitePrevio.interacciones_hoy, cambios_alerta_hoy: limitePrevio.cambios_alerta_hoy, votos_actualizar_hoy: limitePrevio.votos_actualizar_hoy, fecha_interacciones: new Date().toISOString().slice(0, 10) };
      await setUsuario(env, chatId, nuevo);
      await env.USERS.delete(`limit_temp:${chatId}`);
      const mensajeRetorno = datosInicio ? generarBienvenidaRetorno(datosInicio) : mensajeBienvenida;
      await sendTelegram(env, chatId, mensajeRetorno);
    } else {
      const nuevo = { ...nuevoUsuario(chatId), idioma: langDetectado, interacciones_hoy: 1, fecha_interacciones: new Date().toISOString().slice(0, 10) };
      if (message?.from?.username) {
        await env.USERS.put(`username:${message.from.username}`, chatId);
      }
      await setUsuario(env, chatId, nuevo);
      await sendTelegram(env, chatId, mensajeBienvenida);
    }

  } else if (cmdFinal === "/id") {
    await sendTelegram(env, chatId, T[lang].id_command(chatId));

  } else if (cmdFinal === "/premium") {
    if (chatId !== env.TELEGRAM_CHAT_ID) {
      await sendTelegram(env, chatId, T[lang].premium_admin_only);
      return;
    }
    if (partes.length < 2) {
      await sendTelegram(env, chatId, T[lang].premium_uso);
      return;
    }
    const identificador = partes[1];
    let targetChatId = null;
    if (/^\d+$/.test(identificador)) {
      targetChatId = identificador;
    } else if (identificador.startsWith("@")) {
      const username = identificador.substring(1);
      targetChatId = await env.USERS.get(`username:${username}`);
    } else {
      await sendTelegram(env, chatId, `Formato no válido. Usa un ID numérico o @username.`);
      return;
    }
    if (!targetChatId) {
      await sendTelegram(env, chatId, T[lang].premium_no_encontrado(identificador));
      return;
    }
    const targetUser = await getUsuario(env, targetChatId);
    if (!targetUser) {
      await sendTelegram(env, chatId, T[lang].premium_no_encontrado(identificador));
      return;
    }
    targetUser.premium = !targetUser.premium;
    await setUsuario(env, targetChatId, targetUser);
    const msg = targetUser.premium
      ? T[lang].premium_activado(identificador)
      : T[lang].premium_desactivado(identificador);
    await sendTelegram(env, chatId, msg);

  } else if (cmdFinal === "/force") {
    // Solo para usuarios premium
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    if (!u.premium) {
      await sendTelegram(env, chatId, "⛔ Comando exclusivo para usuarios premium.");
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const forceHoy = u.fecha_force_premium === hoy ? (u.force_premium_hoy || 0) : 0;
    if (forceHoy >= MAX_FORCE_PREMIUM_DIA) {
      await sendTelegram(env, chatId, `⚠️ Has alcanzado el límite de ${MAX_FORCE_PREMIUM_DIA} actualizaciones manuales hoy. Vuelve mañana.`);
      return;
    }

    // Disparar actualización del workflow premium
    await dispatchActualizacionPremium(env);
    u.force_premium_hoy = forceHoy + 1;
    u.fecha_force_premium = hoy;
    await setUsuario(env, chatId, u);
    await sendTelegram(env, chatId, `✅ Actualización premium forzada (${u.force_premium_hoy}/${MAX_FORCE_PREMIUM_DIA} hoy). Recibirás los nuevos precios en breve.`);

  } else if (cmdFinal === "/reset") {
    if (chatId !== env.TELEGRAM_CHAT_ID) {
      await sendTelegram(env, chatId, "⛔ Comando exclusivo para el administrador.");
      return;
    }
    try { await env.USERS.delete(`limit_temp:${chatId}`); } catch (e) { }
    try { await env.USERS.delete(`user:${chatId}`); } catch (e) { }
    await sendTelegram(env, chatId, "✅ Bienvenida restablecida. Usa /start para ver la bienvenida de primera vez.");

  } else if (cmdFinal === "/lang") {
    if (partes.length >= 2) {
      const nuevoLang = partes[1]?.toLowerCase();
      if (!T[nuevoLang]) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
      await setUsuario(env, chatId, { ...u, idioma: nuevoLang });
      await sendTelegram(env, chatId, T[nuevoLang].lang_ok);
      return;
    }

    const botones = [
      [{ text: T[lang].lang_boton_es, callback_data: "lang_es" }, { text: T[lang].lang_boton_en, callback_data: "lang_en" }, { text: T[lang].lang_boton_fr, callback_data: "lang_fr" }],
      [{ text: T[lang].lang_boton_de, callback_data: "lang_de" }, { text: T[lang].lang_boton_pt, callback_data: "lang_pt" }, { text: T[lang].lang_boton_it, callback_data: "lang_it" }],
      [{ text: T[lang].lang_boton_cancelar, callback_data: "lang_cancelar" }]
    ];
    const mensaje = `🌐 <b>Select language / Selecciona idioma</b>\n\n${T[lang].lang_ayuda_manual}`;
    await sendTelegramConBotones(env, chatId, mensaje, botones);

  } else if (cmdFinal === "/config") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    const esAdmin = (chatId === env.TELEGRAM_CHAT_ID);
    const botones = [
      [{ text: T[lang].alerta_boton_cancelar, callback_data: "config_cancelar" }]
    ];
    await sendTelegramConBotones(env, chatId, T[lang].config(u, cambioTexto, esAdmin), botones);

  } else if (cmdFinal === "/frecuencia") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    if (partes.length < 2) {
      await sendTelegram(env, chatId, T[lang].frecuencia_info(u.frecuencia_dias, u.huso_horario !== undefined ? u.huso_horario : 2));
      return;
    }
    const valor = parseInt(partes[1]);
    if (isNaN(valor)) { await sendTelegram(env, chatId, T[lang].frecuencia_error); return; }
    if (valor < FRECUENCIA_MIN || valor > FRECUENCIA_MAX || partes[1].startsWith("-") || partes[1].startsWith("+")) {
      if (valor < -12 || valor > 14) { await sendTelegram(env, chatId, T[lang].frecuencia_error); return; }
      await setUsuario(env, chatId, { ...u, huso_horario: valor });
      await sendTelegram(env, chatId, T[lang].frecuencia_ok_huso(valor));
      return;
    }
    await setUsuario(env, chatId, { ...u, frecuencia_dias: valor });
    await sendTelegram(env, chatId, T[lang].frecuencia_ok_dias(valor));

  } else if (cmdFinal === "/alerta") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }

    const moneda = u.moneda || "EUR";
    const limiteCambios = u.premium ? MAX_CAMBIOS_ALERTA_DIA_PREMIUM : MAX_CAMBIOS_ALERTA_DIA;

    if (partes.length >= 2) {
      const hoy = new Date().toISOString().slice(0, 10);
      const cambiosHoy = u.fecha_cambios_alerta === hoy ? u.cambios_alerta_hoy : 0;
      if (cambiosHoy >= limiteCambios) { await sendTelegram(env, chatId, T[lang].alerta_limite); return; }

      if (partes[1].toLowerCase() === "off") {
        await setUsuario(env, chatId, { ...u, alerta_local: null, alerta_activa: false, cambios_alerta_hoy: cambiosHoy + 1, fecha_cambios_alerta: hoy });
        await sendTelegram(env, chatId, T[lang].alerta_desactivada);
        return;
      }

      const valorLocal = parseFloat(partes[1].replace(",", "."));
      if (isNaN(valorLocal) || valorLocal < ALERTA_MIN_VALOR || valorLocal > ALERTA_MAX_VALOR) {
        await sendTelegram(env, chatId, T[lang].alerta_error(moneda));
        return;
      }

      const datos = await leerEstadoTry(env, archivo);
      if (!datos) await sendTelegram(env, chatId, "⚠️ No se pudieron verificar los precios ahora, pero tu alerta está guardada.");
      let uActualizado = { ...u, alerta_local: valorLocal, alerta_activa: true, cambios_alerta_hoy: cambiosHoy + 1, fecha_cambios_alerta: hoy, ultima_alerta_enviada: null };
      if (datos) uActualizado = await evaluarAlertaInmediata(env, uActualizado, datos);
      await setUsuario(env, chatId, uActualizado);
      await sendTelegram(env, chatId, T[lang].alerta_activada(valorLocal, moneda));
      return;
    }

    const datos = await leerEstadoTry(env, archivo);
    const precios = datos ? obtenerPreciosLocales(datos, u) : null;
    const objetivo = u.alerta_activa ? u.alerta_local : null;
    const hoy = new Date().toISOString().slice(0, 10);
    const cambiosHoy = u.fecha_cambios_alerta === hoy ? u.cambios_alerta_hoy : 0;
    const cambiosRestantes = limiteCambios - cambiosHoy;

    const botones = [];
    if (objetivo) {
      botones.push([{ text: T[lang].alerta_boton_bajar, callback_data: "alerta_bajar" }, { text: T[lang].alerta_boton_subir, callback_data: "alerta_subir" }]);
      botones.push([{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }]);
      botones.push([{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }]);
      botones.push([{ text: T[lang].alerta_boton_desactivar, callback_data: "alerta_desactivar" }]);
    } else {
      botones.push([{ text: T[lang].alerta_boton_manual, callback_data: "alerta_manual" }]);
      botones.push([{ text: T[lang].alerta_boton_oferta, callback_data: "alerta_oferta" }]);
    }
    botones.push([{ text: T[lang].alerta_boton_cancelar, callback_data: "alerta_cancelar" }]);
    await sendTelegramConBotones(env, chatId, T[lang].alerta_info(objetivo, moneda, precios, cambiosRestantes), botones);

  } else if (cmdFinal === "/notificaciones") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    const nuevoPausado = !u.pausado;
    await setUsuario(env, chatId, { ...u, pausado: nuevoPausado });
    await sendTelegram(env, chatId, nuevoPausado ? T[lang].notificaciones_off : T[lang].notificaciones_on);

  } else if (cmdFinal === "/precios") {
    if (!datos) { await sendTelegram(env, chatId, T[lang].error_precios); return; }
    const lineas = generarLineasPrecios(datos, u);
    const botones = [
      [{ text: T[lang].alerta_boton_cancelar, callback_data: "precios_cancelar" }]
    ];
    await sendTelegramConBotones(env, chatId, T[lang].precios(lineas, cambioTexto), botones);

  } else if (cmdFinal === "/baja") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    const botones = [[{ text: T[lang].baja_boton_si, callback_data: "baja_confirmar" }, { text: T[lang].baja_boton_no, callback_data: "baja_cancelar" }]];
    await sendTelegramConBotones(env, chatId, T[lang].baja_confirmacion, botones);

  } else if (cmdFinal === "/moneda") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }

    if (partes.length === 2) {
      const codigo = partes[1].toUpperCase();
      if (!MONEDAS_FIAT[codigo]) { await sendTelegram(env, chatId, T[lang].moneda_error); return; }
      if (u.moneda === codigo) {
        const bandera = MONEDAS_FIAT[codigo] || "";
        const msg = lang === "es" ? `ℹ️ Ya tienes configurada la moneda ${bandera} <b>${codigo}</b>. No se han realizado cambios.` : `ℹ️ You already have ${bandera} <b>${codigo}</b> configured. No changes were made.`;
        await sendTelegram(env, chatId, msg);
        return;
      }
      await ejecutarCambioMoneda(env, chatId, u, lang, codigo);
      return;
    }

    const filas = [];
    let filaActual = [];
    const codigos = Object.keys(MONEDAS_FIAT);
    for (let i = 0; i < codigos.length; i++) {
      const cod = codigos[i];
      filaActual.push({ text: `${MONEDAS_FIAT[cod]} ${cod}`, callback_data: `moneda_${cod}` });
      if (filaActual.length === 3 || i === codigos.length - 1) { filas.push(filaActual); filaActual = []; }
    }
    filas.push([{ text: T[lang].moneda_boton_cancelar, callback_data: "moneda_cancelar" }]);
    await sendTelegramConBotones(env, chatId, T[lang].monedas_lista, filas);

  } else if (cmdFinal === "/eligemoneda") {
    await sendTelegram(env, chatId, T[lang].monedas_lista);

  } else if (cmdFinal === "/cambio") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    await manejarCambio(env, chatId, u, lang, partes);

  } else if (cmdFinal === "/actualizar") {
    if (!u) { await sendTelegram(env, chatId, T[lang].comando_desconocido); return; }
    await manejarActualizar(env, chatId, u, lang);

  } else if (cmdFinal === "/ayuda" || comando === "/help") {
    if (!u) {
      const langCode = message?.from?.language_code || "en";
      const langDetectado = langCode.startsWith("es") ? "es" : "en";
      await sendTelegram(env, chatId, T[langDetectado].no_registrado_help);
    } else {
      await sendTelegram(env, chatId, textoAyuda(lang));
    }

  } else {
    await sendTelegram(env, chatId, T[lang].comando_desconocido);
  }
}
