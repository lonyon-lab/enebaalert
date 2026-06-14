// languages.js

export const MONEDAS_FIAT = {
  "EUR": "🇪🇺", "GBP": "🇬🇧", "PLN": "🇵🇱", "SEK": "🇸🇪",
  "NOK": "🇳🇴", "CHF": "🇨🇭", "USD": "🇺🇸", "CAD": "🇨🇦",
  "AUD": "🇦🇺", "MXN": "🇲🇽", "ARS": "🇦🇷", "BRL": "🇧🇷"
};

export const HUSOS_HORARIOS = {
  "EUR": 2,  // Europa Central / España (UTC+2)
  "GBP": 1,  // Reino Unido / UK (UTC+1)
  "PLN": 2,  // Polonia (UTC+2)
  "SEK": 2,  // Suecia (UTC+2)
  "NOK": 2,  // Noruega (UTC+2)
  "CHF": 2,  // Suiza (UTC+2)
  "USD": -4, // Estados Unidos Este (UTC-4)
  "CAD": -4, // Canadá Este (UTC-4)
  "AUD": 10, // Australia Este (UTC+10)
  "MXN": -6, // México Centro (UTC-6)
  "ARS": -3, // Argentina (UTC-3)
  "BRL": -3  // Brasilia / Brasil (UTC-3)
};

export const T = {
  es: {
    titulo: "🇹🇷 <b>Eneba TRY — Lira Turca (₺)</b>",
    bienvenida: (cambioTexto) => `👋 <b>Bienvenido a Eneba TRY — Lira Turca (₺)</b>\n\nTe mantendré informado sobre los precios de las tarjetas Xbox en liras turcas (TRY) en Eneba.\n\n💱 Cambio oficial actual: ${cambioTexto}\n⚠️ Precios <b>sin</b> comisiones de pago incluidas\n\n⏰ Por defecto, recibirás tus resúmenes automáticos a las <b>9:00 AM</b> de la zona horaria estándar de tu moneda.\n\nUsa /config para ver tu configuración actual o /frecuencia para ajustar tu hora exacta.\n\n🌐文A /lang - Change language`,
    config: (u, cambioTexto) => {
      const bandera = MONEDAS_FIAT[u.moneda] || "";
      const alertaTexto = u.alerta_activa && u.alerta_local ? `cuando 300 TRY cueste ≤ <b>${u.alerta_local.toFixed(2)}${bandera} ${u.moneda}</b>` : "desactivada";
      return `⚙️ <b>Tu configuración</b>\n\n📅 Frecuencia resumen: cada <b>${u.frecuencia_dias} día${u.frecuencia_dias > 1 ? "s" : ""}</b>\n⏰ Hora de entrega: <b>9:00 AM (UTC${u.huso_horario >= 0 ? "+" : ""}${u.huso_horario})</b>\n🎯 Alerta: ${alertaTexto}\n⏸️ Estado: ${u.pausado ? "<b>pausado</b>" : "activo"}\n🌍 Idioma: Español\n💱 Moneda: ${bandera} ${u.moneda}\n💱 Cambio oficial actual: ${cambioTexto}`;
    },
    frecuencia_info: (actual, huso) => 
      `📅 <b>Configuración del Resumen Diario</b>\n\nAquí puedes controlar cuándo y a qué hora deseas recibir la lista de precios automática.\n\n⏱️ <b>Tu configuración actual:</b>\n• Se envía cada: <b>${actual} día${actual > 1 ? "s" : ""}</b>\n• Hora de entrega: <b>9:00 AM</b> en tu zona horaria (<b>UTC${huso >= 0 ? "+" : ""}${huso}</b>)\n\n✍️ <b>¿Cómo cambiarlo?</b>\n• Para cambiar los <b>días</b>, escribe el comando seguido de un número del 1 al 7.\n  Ejemplo: <code>/frecuencia 3</code>\n• Para cambiar tu <b>hora local (huso horario)</b>, añade tu diferencia respecto a UTC.\n  Ejemplo (California): <code>/frecuencia -7</code>\n  Ejemplo (España): <code>/frecuencia +2</code>`,
    frecuencia_error: `❌ <b>Formato incorrecto.</b>\n\n• Si quieres cambiar los <b>días</b>, introduce un número entero entre 1 y 7.\n• Si quieres cambiar tu <b>hora (huso UTC)</b>, introduce un número entre -12 y +14.\n  Ejemplo: <code>/frecuencia -7</code>`,
    frecuencia_ok_dias: (dias) => `✅ ¡Configuración guardada! Recibirás el resumen cada <b>${dias} día${dias > 1 ? "s" : ""}</b>.`,
    frecuencia_ok_huso: (huso) => `✅ ¡Zona horaria actualizada! Tus resúmenes llegarán a las <b>9:00 AM de tu hora local</b> (UTC${huso >= 0 ? "+" : ""}${huso}).`,
    alerta_info: (actual, moneda) => {
      const bandera = MONEDAS_FIAT[moneda] || "";
      return `🎯 <b>Alertas de Precio Inteligentes</b>\n\nEste comando te permite configurar un aviso automático. Te enviaré un mensaje en cuanto detecte en mis escaneos que el precio de <b>300 TRY</b> ha bajado del límite que tú elijas.\n\n🔔 Estado actual: ${actual ? `🔔 Activa para menos de <b>${actual.toFixed(2)}${bandera} ${moneda}</b>` : "🔕 Desactivada"}.\n\n✍️ <b>¿Cómo configurarla?</b>\n• Para activar: escribe el comando seguido del precio máximo en tu moneda (${moneda}).\nEjemplo: <code>/alerta 5.60</code>\n• Para desactivar: escribe <code>/alerta off</code>`;
    },
    alerta_error: (moneda) => `❌ Precio no válido. Debes introducir un número decimal razonable para tu moneda (${moneda}).\nEjemplo: <code>/alerta 5.60</code>`,
    alerta_ok: (valor, moneda) => `✅ ¡Alerta guardada! Te avisaré en cuanto detecte que 300 TRY cuestan <b>${valor.toFixed(2)}${MONEDAS_FIAT[moneda]} ${moneda}</b> o menos.`,
    alerta_off_ok: `✅ Alertas apagadas correctamente. Ya no recibirás avisos de bajadas de precio.`,
    alerta_limite: `⚠️ Has cambiado tu alerta demasiadas veces hoy. Inténtalo mañana.`,
    limite_diario: `⚠️ Has alcanzado el límite de interacciones diarias con el bot (200). Se restablecerá automáticamente a las 00:00 UTC.`,
    notificaciones_on: `🔔 Notificaciones activadas. Resúmenes matutinos reanudados.`,
    notificaciones_off: `🔕 Notificaciones pausadas. Ya no recibirás resúmenes automáticos.`,
    baja_confirmacion: `¿Seguro que quieres darte de baja? Escribe <code>/baja confirmar</code> para confirmar.`,
    baja_ok: `👋 Te has dado de baja. Escribe /start si quieres volver.`,
    mantenimiento: `🔧 Bot en mantenimiento temporal.`,
    comando_desconocido: `❓ Comando no reconocido o texto no válido. Escribe /ayuda para ver los comandos disponibles.`,
    error_precios: `⚠️ No hay precios disponibles en este momento. Inténtalo más tarde.`,
    lang_ok: `✅ Idioma cambiado a Español.`,
    ya_suscrito: `Ya estás suscrito. Usa /config para ver tu configuración.`,
    actualizar_voto: (n) => `🗳️ <b>¡Voto registrado con éxito!</b>\n\nProgreso actual: <b>${n} de 5 votos</b> necesarios.\n\nFaltan <b>${5 - n} personas</b> más que usen /actualizar en los próximos 2 minutos para lanzar el buscador de precios.`,
    actualizar_ya_votaste: (n) => `⚠️ <b>Ya has votado en esta ronda</b>\n\nEl contador sigue en <b>${n} de 5 votos</b>.\n¡Anima a otros usuarios del bot a votar para completarlo!`,
    actualizar_lanzado: `⏳ <b>¡Objetivo alcanzado (5/5 votos)!</b>\n\nHe enviado a los servidores la orden de escanear Eneba ahora mismo. Te enviaré un mensaje con los nuevos precios en un par de minutos.`,
    actualizar_cooldown: (min) => `🛑 <b>Buscador en enfriamiento</b>\n\nLos precios se han actualizado hace muy poco. Debes esperar <b>${min} minuto${min > 1 ? "s" : ""}</b> antes de poder iniciar otra votación.\n\n💡 Puedes consultar los precios actuales con /precios.`,
    actualizar_limite: `⚠️ Has usado /actualizar demasiadas veces hoy. Inténtalo mañana.`,
    moneda_ok: (codigo, bandera) => `✅ <b>¡Moneda cambiada a ${bandera} ${codigo}!</b>\n\nPor seguridad, he desactivado tus alertas anteriores para evitar conflictos con el cambio de divisa. Tus resúmenes seguirán llegando a las 9:00 AM (puedes ajustar tu hora exacta en cualquier momento con /frecuencia).`,
    moneda_error: `❌ Moneda no válida. Usa una de las disponibles, consulta /monedas`,
    monedas_lista: `🌍 <b>Monedas disponibles:</b>\n\n` +
      `  🇪🇺 <b>EUR</b> — Euro (€)\n` +
      `  🇬🇧 <b>GBP</b> — Libra Esterlina (£)\n` +
      `  🇵🇱 <b>PLN</b> — Zloty Polaco (zł)\n` +
      `  🇸🇪 <b>SEK</b> — Corona Sueca (kr)\n` +
      `  🇳🇴 <b>NOK</b> — Corona Noruega (kr)\n` +
      `  🇨🇭 <b>CHF</b> — Franco Suizo (CHF)\n` +
      `  🇺🇸 <b>USD</b> — Dólar Americano ($)\n` +
      `  🇨🇦 <b>CAD</b> — Dólar Canadiense ($)\n` +
      `  🇦🇺 <b>AUD</b> — Dólar Australiano ($)\n` +
      `  🇲🇽 <b>MXN</b> — Peso Mexicano ($)\n` +
      `  🇦🇷 <b>ARS</b> — Peso Argentino ($)\n` +
      `  🇧🇷 <b>BRL</b> — Real Brasileño (R$)\n\n` +
      `✍️ Usa <code>/moneda CODIGO</code> para cambiar.\n<i>Ejemplo: /moneda MXN</i>`,
    cambio_ok: (valor) => `✅ Tipo de cambio manual ARS configurado: <b>${valor} ARS/€</b>`,
    cambio_error: `❌ Solo puedes configure un cambio manual si tienes ARS como moneda (valores entre 100 y 99999).\nEjemplo: /cambio 1250`,
    ars_aviso: `⚠️ El peso argentino tiene un tipo de cambio oficial muy diferente al real.\nPuedes configurar uno manual con /cambio 1250`,
    precios: (lineas, cambioTexto) => `🇹🇷 <b>Precios TRY actuales (Lira Turca ₺)</b>\n\n${lineas}\n\n💱 Cambio oficial: ${cambioTexto}\n⚠️ Precios <b>sin</b> comisiones de pago incluidas`
  },
  en: {
    titulo: "🇹🇷 <b>Eneba TRY — Turkish Lira (₺)</b>",
    bienvenida: (cambioTexto) => `👋 <b>Welcome to Eneba TRY — Turkish Lira (₺)</b>\n\nI'll keep you updated on Xbox gift card prices in Turkish Lira (TRY) on Eneba.\n\n💱 Current official rate: ${cambioTexto}\n⚠️ Prices <b>without</b> payment fees included\n\n⏰ By default, you will receive automatic summaries at <b>9:00 AM</b> based on your currency's standard timezone.\n\nUse /config to see settings or /frequency to adjust your exact time.\n\n🌐文A /lang - Change language`,
    config: (u, cambioTexto) => {
      const bandera = MONEDAS_FIAT[u.moneda] || "";
      const alertaTexto = u.alerta_activa && u.alerta_local ? `when 300 TRY costs ≤ <b>${u.alerta_local.toFixed(2)}${bandera} ${u.moneda}</b>` : "disabled";
      return `⚙️ <b>Your settings</b>\n\n📅 Frequency: every <b>${u.frecuencia_dias} day${u.frecuencia_dias > 1 ? "s" : ""}</b>\n⏰ Delivery time: <b>9:00 AM (UTC${u.huso_horario >= 0 ? "+" : ""}${u.huso_horario})</b>\n🎯 Alert: ${alertaTexto}\n⏸️ Status: ${u.pausado ? "<b>paused</b>" : "active"}\n🌍 Language: English\n💱 Currency: ${bandera} ${u.moneda}\n💱 Current official rate: ${cambioTexto}`;
    },
    frecuencia_info: (actual, huso) => 
      `📅 <b>Summary Frequency Settings</b>\n\nHere you can control when and at what time you want to receive the automatic price list.\n\n⏱️ <b>Your current configuration:</b>\n• Sent every: <b>${actual} day${actual > 1 ? "s" : ""}</b>\n• Delivery time: <b>9:00 AM</b> in your local timezone (<b>UTC${huso >= 0 ? "+" : ""}${huso}</b>)\n\n✍️ <b>How to change it?</b>\n• To change the <b>days</b>, type the command followed by a number from 1 to 7.\n  Example: <code>/frequency 3</code>\n• To change your <b>local time (timezone)</b>, add your offset relative to UTC.\n  Example (California): <code>/frequency -7</code>\n  Example (London): <code>/frequency +1</code>`,
    frecuencia_error: `❌ <b>Invalid format.</b>\n\n• To change the <b>days</b>, enter a whole number between 1 and 7.\n• To change your <b>timezone (UTC offset)</b>, enter a number between -12 and +14.\n  Example: <code>/frequency -7</code>`,
    frecuencia_ok_dias: (dias) => `✅ Settings saved! You will receive the summary every <b>${dias} day${dias > 1 ? "s" : ""}</b>.`,
    frecuencia_ok_huso: (huso) => `✅ Timezone updated! Your summaries will now arrive at <b>9:00 AM your local time</b> (UTC${huso >= 0 ? "+" : ""}${huso}).`,
    alerta_info: (actual, moneda) => {
      const bandera = MONEDAS_FIAT[moneda] || "";
      return `🎯 <b>Smart Price Alerts</b>\n\nThis command allows you to set up an automatic notification. I will send you a message as soon as I detect in my scans that the price of <b>300 TRY</b> has dropped below your threshold.\n\n🔔 Current status: ${actual ? `🔔 Active for less than <b>${actual.toFixed(2)}${bandera} ${moneda}</b>` : "🔕 Disabled"}.\n\n✍️ <b>How to set it up?</b>\n• To activate: type the command followed by the maximum price in your currency (${moneda}).\nExample: <code>/alert 5.60</code>\n• To disable: type <code>/alert off</code>`;
    },
    alerta_error: (moneda) => `❌ Invalid price. You must enter a reasonable decimal number for your currency (${moneda}).\nExample: <code>/alert 5.60</code>`,
    alerta_ok: (valor, moneda) => `✅ Alert saved! I will notify you as soon as 300 TRY is detected at <b>${valor.toFixed(2)}${MONEDAS_FIAT[moneda]} ${moneda}</b> or less.`,
    alerta_off_ok: `✅ Alerts successfully disabled. You will no longer receive price drop notifications.`,
    alerta_limite: `⚠️ You've changed your alert too many times today. Try again tomorrow.`,
    limite_diario: `⚠️ Daily interaction limit reached (200). It will reset automatically at 00:00 UTC.`,
    notificaciones_on: `🔔 Notifications enabled. Morning summaries resumed.`,
    notificaciones_off: `🔕 Notifications paused. You will no longer receive automatic summaries.`,
    baja_confirmacion: `Are you sure? Type <code>/unsubscribe confirmar</code> to confirm.`,
    baja_ok: `👋 Unsubscribed successfully. Type /start if you want to come back.`,
    mantenimiento: `🔧 Bot under maintenance.`,
    comando_desconocido: `❓ Unknown command. Type /help to see available commands.`,
    error_precios: `⚠️ No prices available at this moment. Try again later.`,
    lang_ok: `✅ Language changed to English.`,
    ya_suscrito: `Already subscribed. Use /config to see your settings.`,
    actualizar_voto: (n) => `🗳️ <b>Vote successfully registered!</b>\n\nCurrent progress: <b>${n} of 5 votes</b> needed.\n\nWe need <b>${5 - n} more people</b> to use /refresh within the next 2 minutes to launch the price scraper.`,
    actualizar_ya_votaste: (n) => `⚠️ <b>You have already voted in this round</b>\n\nThe count is still at <b>${n} of 5 votes</b>.\nEncourage other bot users to vote to complete it!`,
    actualizar_lanzado: `⏳ <b>Target reached (5/5 votes)!</b>\n\nI have sent the command to scan Eneba right now. I will send you a message with the new prices in a couple of minutes.`,
    actualizar_cooldown: (min) => `🛑 <b>Scraper on cooldown</b>\n\nPrices were updated very recently. You must wait <b>${min} minute${min > 1 ? "s" : ""}</b> before starting another vote.\n\n💡 You can check the current prices with /prices.`,
    actualizar_limite: `⚠️ /refresh limit reached for today. Please try again tomorrow.`,
    moneda_ok: (codigo, bandera) => `✅ <b>Currency changed to ${bandera} ${codigo}!</b>\n\nTo prevent conflicts, your previous alerts have been cleared. Your summaries will continue to arrive at 9:00 AM (you can adjust your exact local timezone at any time using /frequency).`,
    moneda_error: `❌ Invalid currency. Check /currencies`,
    monedas_lista: `🌍 <b>Available currencies:</b>\n\n` +
      `  🇪🇺 <b>EUR</b> — Euro (€)\n` +
      `  🇬🇧 <b>GBP</b> — British Pound (£)\n` +
      `  🇵🇱 <b>PLN</b> — Polish Zloty (zł)\n` +
      `  🇸🇪 <b>SEK</b> — Swedish Krona (kr)\n` +
      `  🇳🇴 <b>NOK</b> — Norwegian Krone (kr)\n` +
      `  🇨🇭 <b>CHF</b> — Swiss Franc (CHF)\n` +
      `  🇺🇸 <b>USD</b> — US Dollar ($)\n` +
      `  🇨🇦 <b>CAD</b> — Canadian Dollar ($)\n` +
      `  🇦🇺 <b>AUD</b> — Australian Dollar ($)\n` +
      `  🇲🇽 <b>MXN</b> — Mexican Peso ($)\n` +
      `  🇦🇷 <b>ARS</b> — Argentine Peso ($)\n` +
      `  🇧🇷 <b>BRL</b> — Brazilian Real (R$)\n\n` +
      `✍️ Use <code>/currency CODE</code> to change.\n<i>Example: /currency USD</i>`,
    cambio_ok: (valor) => `✅ Manual ARS exchange rate set: <b>${valor} ARS/€</b>`,
    cambio_error: `❌ You can only set a manual rate if you have ARS as your currency (values between 100 and 99999).\nExample: /rate 1250`,
    ars_aviso: `⚠️ The Argentine peso has a very different official and real exchange rate.\nYou can set a manual one with /rate 1250`,
    precios: (lineas, cambioTexto) => `🇹🇷 <b>Current TRY prices (Turkish Lira ₺)</b>\n\n${lineas}\n\n💱 Official rate: ${cambioTexto}\n⚠️ Prices <b>without</b> payment fees included`
  },
  fr: { titulo: "🇹🇷 <b>Eneba TRY — Livre Turque (₺)</b>", lang_ok: `✅ Langue changée en Français.`, comando_desconocido: `❓ Commande inconnue. Tapez /help.` },
  de: { titulo: "🇹🇷 <b>Eneba TRY — Türkische Lira (₺)</b>", lang_ok: `✅ Sprache auf Deutsch geändert.`, comando_desconocido: `❓ Unbekannter Befehl. Senden Sie /help.` },
  pt: { titulo: "🇹🇷 <b>Eneba TRY — Lira Turca (₺)</b>", lang_ok: `✅ Idioma alterado para Português.`, comando_desconocido: `❓ Comando desconhecido. Digite /help.` },
  it: { titulo: "🇹🇷 <b>Eneba TRY — Lira Turca (₺)</b>", lang_ok: `✅ Lingua cambiata in Italiano.`, comando_desconocido: `❓ Comando sconosciuto. Digita /help.` }
};

export function textoAyuda(lang) {
  const iconLang = "🌐文A";
  if (lang === "es") {
    return `📖 <b>Comandos disponibles</b>\n\n` +
      `🏷️ /precios o /prices → Precios actuales\n` +
      `🔄 /actualizar o /refresh → Forzar actualización\n` +
      `📅 /frecuencia → Días y hora del resumen local\n` +
      `🎯 /alerta → Configurar alertas de precio\n` +
      `🔔 /notificaciones → Pausar/activar avisos\n` +
      `💱 /moneda → Cambiar moneda (EUR, BRL, ARS...)\n` +
      `⚙️ /config → Ver tu configuración\n` +
      `${iconLang} /lang → Cambiar idioma / Change language\n` +
      `❌ /baja → Darse de baja\n` +
      `❓ /ayuda → Ver esta lista`;
  }
  return `📖 <b>Available commands</b>\n\n` +
    `🏷️ /prices → Current TRY prices\n` +
    `🔄 /refresh → Request price refresh\n` +
    `📅 /frequency → Days and local delivery time\n` +
    `🎯 /alert → Set price alerts\n` +
    `🔔 /notifications → Pause/resume notifications\n` +
    `💱 /currency → Change currency (EUR, BRL, ARS...)\n` +
    `⚙️ /config → Show your current settings\n` +
    `${iconLang} /lang → Change language\n` +
    `❌ /unsubscribe → Unsubscribe\n` +
    `❓ /help → Show this list`;
}
