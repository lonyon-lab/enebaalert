export const MONEDAS_FIAT = {
  "EUR": "🇪🇺", "GBP": "🇬🇧", "PLN": "🇵🇱", "SEK": "🇸🇪",
  "NOK": "🇳🇴", "CHF": "🇨🇭", "USD": "🇺🇸", "CAD": "🇨🇦",
  "AUD": "🇦🇺", "MXN": "🇲🇽", "ARS": "🇦🇷", "BRL": "🇧🇷"
};

export const SIMBOLOS_MONEDA = {
  "EUR": "€", "GBP": "£", "PLN": "zł", "SEK": "kr",
  "NOK": "kr", "CHF": "CHF", "USD": "$", "CAD": "$",
  "AUD": "$", "MXN": "$", "ARS": "$", "BRL": "R$"
};

export const HUSOS_HORARIOS = {
  "EUR": 2, "GBP": 1, "PLN": 2, "SEK": 2,
  "NOK": 2, "CHF": 2, "USD": -4, "CAD": -4,
  "AUD": 10, "MXN": -6, "ARS": -3, "BRL": -3
};

export const T = {
  es: {
    titulo: "🇹🇷 <b>Eneba TRY — Lira Turca (₺)</b>",
    baja_confirmacion_text: "👋 <b>Has solicitado la baja.</b>\n\nSe han eliminado todos tus datos, preferencias y alertas. Si decides volver, usa /start.",
    baja_confirmacion: `⚠️ Al darte de baja eliminarás tus alertas y configuración. Si estás seguro, confirma abajo. Para volver solo tendrás que usar /start.`,
    baja_boton_si: "✅ Sí, darme de baja",
    baja_boton_no: "❌ Cancelar",
    baja_cancelado: "👍 Baja cancelada. Tus datos siguen intactos.",
    no_registrado_help: "👋 Para usar el bot primero debes registrarte. Usa /start para empezar.",
    id_command: (chatId) => `🆔 Tu ID es: <code>${chatId}</code>`,
    premium_activado: (identificador) => `✅ Usuario ${identificador} ahora es premium.`,
    premium_desactivado: (identificador) => `🔽 Usuario ${identificador} ya no es premium.`,
    premium_no_encontrado: (identificador) => `❌ No se encontró ningún usuario con ID o @username <b>${identificador}</b>.`,
    premium_admin_only: "⛔ Comando exclusivo para el administrador.",
    premium_uso: "Uso: /premium &lt;ID o @username&gt;",
    config: (u, cambioTexto, esAdmin = false) => {
      const banderaMoneda = MONEDAS_FIAT[u.moneda] || "";
      const simboloMoneda = SIMBOLOS_MONEDA[u.moneda] || u.moneda;
      const simboloLira = "₺";
      let lineaAlerta;
      if (u.alerta_activa && u.alerta_local) {
        lineaAlerta = `🎯 Alerta inteligente: cuando 300 ${simboloLira} cuesten ≤ <b>${u.alerta_local.toFixed(2)}${simboloMoneda}</b>`;
      } else {
        lineaAlerta = `🎯 Alerta inteligente: <b>desactivada</b>`;
      }
      let lineaPausa = u.pausado
        ? `🔕 Estado del resumen: <b>pausado</b>`
        : `🔔 Estado del resumen: <b>activo</b>`;
      const signoUtc = u.huso_horario >= 0 ? "+" : "";
      let lineaPremium = `💎 <b>Premium:</b> ${u.premium ? 'Sí' : 'No'}\n`;
      let lineaAdmin = esAdmin ? `\n🔐 <b>Admin:</b> /premium &lt;ID o @usuario&gt; | /reset\n` : "";
      return `⚙️ <b>Tu configuración</b>\n\n` +
        `📅 Resumen automático: cada <b>${u.frecuencia_dias} día${u.frecuencia_dias > 1 ? "s" : ""}</b> a las <b>9:00 AM</b> (UTC${signoUtc}${u.huso_horario})\n` +
        `${lineaPausa}\n\n` +
        `${lineaAlerta}\n` +
        `${lineaPremium}\n` +
        `🌍 Idioma: ${u.idioma === "en" ? "🇬🇧" : "🇪🇸"} <b>${u.idioma === "en" ? "English" : "Español"}</b>\n` +
        `💱 Moneda: ${banderaMoneda} <b>${u.moneda}</b> (cambio oficial: ${cambioTexto})` +
        `${lineaAdmin}`;
    },
    frecuencia_info: (actual, huso) =>
      `📅 <b>Configuración del Resumen Diario</b>\n\nAquí puedes controlar cuándo y a qué hora deseas recibir la lista de precios automática.\n\n⏱️ <b>Tu configuración actual:</b>\n• Se envía cada: <b>${actual} día${actual > 1 ? "s" : ""}</b>\n• Hora de entrega: <b>9:00 AM</b> en tu zona horaria (<b>UTC${huso >= 0 ? "+" : ""}${huso}</b>)\n\n✍️ <b>¿Cómo cambiarlo?</b>\n• Para cambiar los <b>días</b>, escribe el comando seguido de un número del 1 al 7.\n  Ejemplo: <code>/frecuencia 3</code>\n• Para cambiar tu <b>hora local (huso horario)</b>, añade tu diferencia respecto a UTC.\n  Ejemplo (California): <code>/frecuencia -7</code>\n  Ejemplo (España): <code>/frecuencia +2</code>`,
    frecuencia_error: `❌ <b>Formato incorrecto.</b>\n\n• Si quieres cambiar los <b>días</b>, introduce un número entero entre 1 y 7.\n• Si quieres cambiar tu <b>hora (huso UTC)</b>, introduce un número entre -12 y +14.\n  Ejemplo: <code>/frecuencia -7</code>`,
    frecuencia_ok_dias: (dias) => `✅ ¡Configuración guardada! Recibirás el resumen cada <b>${dias} día${dias > 1 ? "s" : ""}</b>.`,
    frecuencia_ok_huso: (huso) => `✅ ¡Zona horaria actualizada! Tus resúmenes llegarán a las <b>9:00 AM de tu hora local</b> (UTC${huso >= 0 ? "+" : ""}${huso}).`,
    alerta_info: (actual, moneda, precios = null, cambiosRestantes = null, feedback = null) => {
      const bandera = MONEDAS_FIAT[moneda] || "";
      const simboloMoneda = SIMBOLOS_MONEDA[moneda] || moneda;
      const simboloLira = "₺";
      const banderaTurquia = "🇹🇷";
      let bloquePrecios = "";
      let mejorTarjeta = null;
      if (precios && precios.length > 0) {
        mejorTarjeta = precios.reduce((min, p) => p.coste300 < min.coste300 ? p : min, precios[0]);
        const lineas = precios
          .sort((a, b) => a.valor - b.valor)
          .map(p => {
            const equivalencia = `x${Math.round(300 / p.valor)} → ${bandera} <b>${p.coste300.toFixed(2)}${simboloMoneda}</b>`;
            const precioTexto = `<b>${p.precioUnitario.toFixed(2)}${simboloMoneda}</b>`;
            let extra = "";
            if (p.valor === mejorTarjeta.valor) extra = "  💡 Mejor opción";
            return `  ${banderaTurquia} ${p.valor} ${simboloLira} → ${precioTexto} (${equivalencia})${extra}`;
          })
          .join("\n");
        bloquePrecios = `\n\n💵 <b>Precios actuales de referencia</b>\n${lineas}\n\n💡 <b>Mejor opción:</b> comprar ${banderaTurquia} ${mejorTarjeta.valor} ${simboloLira} (equivale a ${bandera} <b>${mejorTarjeta.coste300.toFixed(2)}${simboloMoneda}</b> por ${banderaTurquia} 300 ${simboloLira})`;
      }

      let lineaEstado = "";
      if (actual) {
        lineaEstado = `<b>🔔 ESTADO:</b> <u>Activa para menos de <b>${actual.toFixed(2)}${simboloMoneda}</b> por ${banderaTurquia} 300 ${simboloLira}.</u>`;
      } else {
        lineaEstado = `<b>🔔 ESTADO:</b> <u>Desactivada.</u>`;
      }

      let lineaFeedback = "";
      if (feedback) {
        lineaFeedback = `\n\n${feedback}`;
      }

      let lineaCambios = "";
      if (cambiosRestantes !== null && cambiosRestantes <= 2) {
        lineaCambios = `\n⚠️ Te quedan ${cambiosRestantes} cambios de alerta hoy.`;
      }

      let lineaInstruccion;
      if (actual) {
        lineaInstruccion = "Usa los botones para ajustar tu objetivo.";
      } else {
        lineaInstruccion = `Define tu precio objetivo para 300 ${simboloLira} con los botones.`;
      }

      let mensaje = `🎯 <b>Alertas de Precio Inteligentes</b>\n\n` +
        `Te avisaré cuando el precio de las tarjetas XBOX en liras turcas (${banderaTurquia} ${simboloLira} TRY) alcance tu objetivo, usando la de 300 TRY como referencia.\n\n` +
        `${lineaEstado}` +
        `${lineaFeedback}` +
        `${bloquePrecios}\n\n` +
        `${lineaInstruccion}`;

      if (lineaCambios) mensaje += lineaCambios;

      return mensaje;
    },
    alerta_boton_subir: "🔺 +1%",
    alerta_boton_bajar: "🔻 -1%",
    alerta_boton_manual: "✍️ Manual",
    alerta_boton_desactivar: "🔕 Desactivar",
    alerta_boton_cancelar: "❌ Cancelar",
    alerta_boton_oferta: "🏷️ Precio en oferta",
    alerta_feedback_alcanzado: "🎯 Alcanzado",
    alerta_feedback_no_alcanzado: "🔔 Aún no alcanzado",
    alerta_manual_prompt: (moneda, precioActual) => {
      return `✏️ Introduce el precio máximo que pagarías por 300 TRY (en <b>${moneda}</b>).\n\n` +
        `💡 Actualmente 300 TRY cuestan <b>${precioActual.toFixed(2)} ${moneda}</b>.\n` +
        `Ejemplo: escribe <b>5.50</b> para que te avise cuando baje de ese valor.\n\n` +
        `Envía cualquier otro texto para cancelar.`;
    },
    alerta_manual_cancelado: "👍 Entrada manual cancelada.",
    alerta_manual_ok: (valor, moneda) => `✅ Precio objetivo actualizado a <b>${valor.toFixed(2)} ${moneda}</b> para 300 TRY.`,
    alerta_actualizada: (valor, moneda) => `✅ Objetivo ajustado a <b>${valor.toFixed(2)} ${moneda}</b>.`,
    alerta_activada: (valor, moneda) => `🔔 Alerta activada con objetivo <b>${valor.toFixed(2)} ${moneda}</b>.`,
    alerta_desactivada: "🔕 Alerta desactivada.",
    alerta_disparada: (tarjetas, moneda) => {
      const m = moneda || "EUR";
      const bandera = MONEDAS_FIAT[m] || "";
      const simboloMoneda = SIMBOLOS_MONEDA[m] || m;
      const simboloLira = "₺";
      const banderaTurquia = "🇹🇷";
      const lineas = tarjetas.map(t => {
        const equivalente = (300 / t.valor) * t.precioFiat;
        return `  ${banderaTurquia} ${t.valor} ${simboloLira} → <b>${t.precioFiat.toFixed(2)}${simboloMoneda}</b> (equiv. ${banderaTurquia} 300 ${simboloLira} por ${bandera} <b>${equivalente.toFixed(2)}${simboloMoneda}</b>)`;
      }).join("\n");
      return `🎯 <b>¡Tu precio objetivo alcanzado!</b>\n\n${lineas}`;
    },
    alerta_error: (moneda) => `❌ Precio no válido. Debes introducir un número decimal razonable para tu moneda (${moneda}).\nEjemplo: <code>/alerta 5.60</code>`,
    alerta_limite: `⚠️ Has cambiado tu alerta demasiadas veces hoy. Inténtalo mañana.`,
    limite_diario: `⚠️ Has alcanzado el límite de interacciones diarias con el bot (200). Se restablecerá automáticamente a las 00:00 UTC.`,
    notificaciones_on: `🔔 Notificaciones activadas. Resúmenes matutinos reanudados.`,
    notificaciones_off: `🔕 Notificaciones pausadas. Ya no recibirás resúmenes automáticos.`,
    mantenimiento: `🔧 Bot en mantenimiento temporal.`,
    comando_desconocido: `❓ Comando no reconocido o texto no válido. Escribe /ayuda para ver los comandos disponibles.`,
    error_precios: `⚠️ No hay precios disponibles en este momento. Inténtalo más tarde.`,
    lang_ok: `✅ Idioma cambiado a Español.`,
    lang_proximamente: "⏳ Próximamente disponible.",
    lang_boton_es: "🇪🇸 Español",
    lang_boton_en: "🇬🇧 English",
    lang_boton_fr: "🇫🇷 Français",
    lang_boton_de: "🇩🇪 Deutsch",
    lang_boton_pt: "🇵🇹 Português",
    lang_boton_it: "🇮🇹 Italiano",
    lang_boton_cancelar: "❌ Cancelar",
    lang_ayuda_manual: "O usa /lang [código] – ejemplo: /lang en",
    ya_suscrito: `Ya estás suscrito. Usa /config para ver tu configuración.`,
    actualizar_voto: (n, total, minutos) => {
      const faltan = total - n;
      return `🗳️ <b>Voto registrado (${n}/${total})</b>\n\n⚠️ Necesitamos <b>${faltan} voto${faltan !== 1 ? "s" : ""} más</b> de otros usuarios para forzar la actualización y no saturar el sistema.\n⏱️ La votación expira en ${minutos} minuto${minutos !== 1 ? "s" : ""}.`;
    },
    actualizar_ya_votaste: (n) => `⚠️ <b>Ya has votado en esta ronda</b>\n\nEl contador sigue en <b>${n} de 5 votos</b>.\nSi no se alcanzan los votos necesarios, no te preocupes: los precios se actualizan con frecuencia de todas formas.`,
    actualizar_lanzado: `⏳ <b>¡Objetivo alcanzado (5/5 votos)!</b>\n\nHe enviado a los servidores la orden de escanear Eneba ahora mismo. Te enviaré un mensaje con los nuevos precios en un par de minutos.`,
    actualizar_cooldown: (min) => `🛑 <b>Buscador en enfriamiento</b>\n\nLos precios se han actualizado hace muy poco. Debes esperar <b>${min} minuto${min > 1 ? "s" : ""}</b> antes de poder iniciar otra votación.\n\n💡 Puedes consultar los precios actuales con /precios.`,
    actualizar_limite: `⚠️ Has usado /actualizar demasiadas veces hoy. Inténtalo mañana.`,
    moneda_ok: (codigo, bandera) => `✅ <b>¡Moneda cambiada a ${bandera} ${codigo}!</b>\n\nPor seguridad, he desactivado tus alertas anteriores para evitar conflictos con el cambio de divisa. Tus resúmenes seguirán llegando a las 9:00 AM (puedes ajustar tu hora exacta en cualquier momento con /frecuencia).`,
    moneda_error: `❌ Moneda no válida. Usa una de las disponibles, consulta /monedas`,
    moneda_boton_cancelar: "❌ Cancelar",
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
    baja_confirmacion_text: "👋 <b>You have unsubscribed.</b>\n\nAll your data, preferences, and alerts have been deleted. If you decide to come back, use /start.",
    baja_confirmacion: `⚠️ Unsubscribing will delete your alerts and settings. If you're sure, confirm below. You can always come back with /start.`,
    baja_boton_si: "✅ Yes, unsubscribe",
    baja_boton_no: "❌ Cancel",
    baja_cancelado: "👍 Unsubscription cancelled. Your data remains unchanged.",
    no_registrado_help: "👋 To use the bot you must first sign up. Use /start to begin.",
    id_command: (chatId) => `🆔 Your ID is: <code>${chatId}</code>`,
    premium_activado: (identificador) => `✅ User ${identificador} is now premium.`,
    premium_desactivado: (identificador) => `🔽 User ${identificador} is no longer premium.`,
    premium_no_encontrado: (identificador) => `❌ No user found with ID or @username <b>${identificador}</b>.`,
    premium_admin_only: "⛔ Admin-only command.",
    premium_uso: "Usage: /premium &lt;ID or @username&gt;",
    config: (u, cambioTexto, esAdmin = false) => {
      const banderaMoneda = MONEDAS_FIAT[u.moneda] || "";
      const simboloMoneda = SIMBOLOS_MONEDA[u.moneda] || u.moneda;
      const simboloLira = "₺";
      let lineaAlerta;
      if (u.alerta_activa && u.alerta_local) {
        lineaAlerta = `🎯 Smart alert: when 300 ${simboloLira} costs ≤ <b>${u.alerta_local.toFixed(2)}${simboloMoneda}</b>`;
      } else {
        lineaAlerta = `🎯 Smart alert: <b>disabled</b>`;
      }
      let lineaPausa = u.pausado
        ? `🔕 Summary status: <b>paused</b>`
        : `🔔 Summary status: <b>active</b>`;
      const signoUtc = u.huso_horario >= 0 ? "+" : "";
      let lineaPremium = `💎 <b>Premium:</b> ${u.premium ? 'Yes' : 'No'}\n`;
      let lineaAdmin = esAdmin ? `\n🔐 <b>Admin:</b> /premium &lt;ID or @username&gt; | /reset\n` : "";
      return `⚙️ <b>Your settings</b>\n\n` +
        `📅 Auto summary: every <b>${u.frecuencia_dias} day${u.frecuencia_dias > 1 ? "s" : ""}</b> at <b>9:00 AM</b> (UTC${signoUtc}${u.huso_horario})\n` +
        `${lineaPausa}\n\n` +
        `${lineaAlerta}\n` +
        `${lineaPremium}\n` +
        `🌍 Language: ${u.idioma === "es" ? "🇪🇸" : "🇬🇧"} <b>${u.idioma === "es" ? "Español" : "English"}</b>\n` +
        `💱 Currency: ${banderaMoneda} <b>${u.moneda}</b> (official rate: ${cambioTexto})` +
        `${lineaAdmin}`;
    },
    frecuencia_info: (actual, huso) =>
      `📅 <b>Summary Frequency Settings</b>\n\nHere you can control when and at what time you want to receive the automatic price list.\n\n⏱️ <b>Your current configuration:</b>\n• Sent every: <b>${actual} day${actual > 1 ? "s" : ""}</b>\n• Delivery time: <b>9:00 AM</b> in your local timezone (<b>UTC${huso >= 0 ? "+" : ""}${huso}</b>)\n\n✍️ <b>How to change it?</b>\n• To change the <b>days</b>, type the command followed by a number from 1 to 7.\n  Example: <code>/frequency 3</code>\n• To change your <b>local time (timezone)</b>, add your offset relative to UTC.\n  Example (California): <code>/frequency -7</code>\n  Example (London): <code>/frequency +1</code>`,
    frecuencia_error: `❌ <b>Invalid format.</b>\n\n• To change the <b>days</b>, enter a whole number between 1 and 7.\n• To change your <b>timezone (UTC offset)</b>, enter a number between -12 and +14.\n  Example: <code>/frequency -7</code>`,
    frecuencia_ok_dias: (dias) => `✅ Settings saved! You will receive the summary every <b>${dias} day${dias > 1 ? "s" : ""}</b>.`,
    frecuencia_ok_huso: (huso) => `✅ Timezone updated! Your summaries will now arrive at <b>9:00 AM your local time</b> (UTC${huso >= 0 ? "+" : ""}${huso}).`,
    alerta_info: (actual, moneda, precios = null, cambiosRestantes = null, feedback = null) => {
      const bandera = MONEDAS_FIAT[moneda] || "";
      const simboloMoneda = SIMBOLOS_MONEDA[moneda] || moneda;
      const simboloLira = "₺";
      const banderaTurquia = "🇹🇷";
      let bloquePrecios = "";
      let mejorTarjeta = null;
      if (precios && precios.length > 0) {
        mejorTarjeta = precios.reduce((min, p) => p.coste300 < min.coste300 ? p : min, precios[0]);
        const lineas = precios
          .sort((a, b) => a.valor - b.valor)
          .map(p => {
            const equivalencia = `x${Math.round(300 / p.valor)} → ${bandera} <b>${p.coste300.toFixed(2)}${simboloMoneda}</b>`;
            const precioTexto = `<b>${p.precioUnitario.toFixed(2)}${simboloMoneda}</b>`;
            let extra = "";
            if (p.valor === mejorTarjeta.valor) extra = "  💡 Best deal";
            return `  ${banderaTurquia} ${p.valor} ${simboloLira} → ${precioTexto} (${equivalencia})${extra}`;
          })
          .join("\n");
        bloquePrecios = `\n\n💵 <b>Current reference prices</b>\n${lineas}\n\n💡 <b>Best deal:</b> buy ${banderaTurquia} ${mejorTarjeta.valor} ${simboloLira} (equals ${bandera} <b>${mejorTarjeta.coste300.toFixed(2)}${simboloMoneda}</b> per ${banderaTurquia} 300 ${simboloLira})`;
      }

      let lineaEstado = "";
      if (actual) {
        lineaEstado = `<b>🔔 STATUS:</b> <u>Active for less than <b>${actual.toFixed(2)}${simboloMoneda}</b> per ${banderaTurquia} 300 ${simboloLira}.</u>`;
      } else {
        lineaEstado = `<b>🔔 STATUS:</b> <u>Disabled.</u>`;
      }

      let lineaFeedback = "";
      if (feedback) {
        lineaFeedback = `\n\n${feedback}`;
      }

      let lineaCambios = "";
      if (cambiosRestantes !== null && cambiosRestantes <= 2) {
        lineaCambios = `\n⚠️ You have ${cambiosRestantes} alert changes left today.`;
      }

      let lineaInstruccion;
      if (actual) {
        lineaInstruccion = "Use the buttons to adjust your target.";
      } else {
        lineaInstruccion = `Set your target price for 300 ${simboloLira} with the buttons.`;
      }

      let mensaje = `🎯 <b>Smart Price Alerts</b>\n\n` +
        `I'll notify you when the price of XBOX cards in Turkish liras (${banderaTurquia} ${simboloLira} TRY) reaches your target, using the 300 TRY card as a reference.\n\n` +
        `${lineaEstado}` +
        `${lineaFeedback}` +
        `${bloquePrecios}\n\n` +
        `${lineaInstruccion}`;

      if (lineaCambios) mensaje += lineaCambios;

      return mensaje;
    },
    alerta_boton_subir: "🔺 +1%",
    alerta_boton_bajar: "🔻 -1%",
    alerta_boton_manual: "✍️ Manual",
    alerta_boton_desactivar: "🔕 Disable",
    alerta_boton_cancelar: "❌ Cancel",
    alerta_boton_oferta: "🏷️ Sale price",
    alerta_feedback_alcanzado: "🎯 Reached",
    alerta_feedback_no_alcanzado: "🔔 Not reached yet",
    alerta_manual_prompt: (moneda, precioActual) => {
      return `✏️ Enter the maximum price you'd pay for 300 TRY (in <b>${moneda}</b>).\n\n` +
        `💡 Currently 300 TRY costs <b>${precioActual.toFixed(2)} ${moneda}</b>.\n` +
        `Example: type <b>5.50</b> to get alerted when it drops below that.\n\n` +
        `Send any other text to cancel.`;
    },
    alerta_manual_cancelado: "👍 Manual entry cancelled.",
    alerta_manual_ok: (valor, moneda) => `✅ Target updated to <b>${valor.toFixed(2)} ${moneda}</b> for 300 TRY.`,
    alerta_actualizada: (valor, moneda) => `✅ Target adjusted to <b>${valor.toFixed(2)} ${moneda}</b>.`,
    alerta_activada: (valor, moneda) => `🔔 Alert enabled with target <b>${valor.toFixed(2)} ${moneda}</b>.`,
    alerta_desactivada: "🔕 Alert disabled.",
    alerta_disparada: (tarjetas, moneda) => {
      const m = moneda || "EUR";
      const bandera = MONEDAS_FIAT[m] || "";
      const simboloMoneda = SIMBOLOS_MONEDA[m] || m;
      const simboloLira = "₺";
      const banderaTurquia = "🇹🇷";
      const lineas = tarjetas.map(t => {
        const equivalente = (300 / t.valor) * t.precioFiat;
        return `  ${banderaTurquia} ${t.valor} ${simboloLira} → <b>${t.precioFiat.toFixed(2)}${simboloMoneda}</b> (equiv. ${banderaTurquia} 300 ${simboloLira} for ${bandera} <b>${equivalente.toFixed(2)}${simboloMoneda}</b>)`;
      }).join("\n");
      return `🎯 <b>Your target price reached!</b>\n\n${lineas}`;
    },
    alerta_error: (moneda) => `❌ Invalid price. You must enter a reasonable decimal number for your currency (${moneda}).\nExample: <code>/alert 5.60</code>`,
    alerta_limite: `⚠️ You've changed your alert too many times today. Try again tomorrow.`,
    limite_diario: `⚠️ Daily interaction limit reached (200). It will reset automatically at 00:00 UTC.`,
    notificaciones_on: `🔔 Notifications enabled. Morning summaries resumed.`,
    notificaciones_off: `🔕 Notifications paused. You will no longer receive automatic summaries.`,
    mantenimiento: `🔧 Bot under maintenance.`,
    comando_desconocido: `❓ Unknown command. Type /help to see available commands.`,
    error_precios: `⚠️ No prices available at this moment. Try again later.`,
    lang_ok: `✅ Language changed to English.`,
    lang_proximamente: "⏳ Coming soon.",
    lang_boton_es: "🇪🇸 Español",
    lang_boton_en: "🇬🇧 English",
    lang_boton_fr: "🇫🇷 Français",
    lang_boton_de: "🇩🇪 Deutsch",
    lang_boton_pt: "🇵🇹 Português",
    lang_boton_it: "🇮🇹 Italiano",
    lang_boton_cancelar: "❌ Cancel",
    lang_ayuda_manual: "Or use /lang [code] – e.g. /lang es",
    ya_suscrito: `Already subscribed. Use /config to see your settings.`,
    actualizar_voto: (n, total, minutos) => {
      const faltan = total - n;
      return `🗳️ <b>Vote registered (${n}/${total})</b>\n\n⚠️ We need <b>${faltan} more vote${faltan !== 1 ? "s" : ""}</b> from other users to force the update and avoid overloading the system.\n⏱️ Voting expires in ${minutos} minute${minutos !== 1 ? "s" : ""}.`;
    },
    actualizar_ya_votaste: (n) => `⚠️ <b>You have already voted in this round</b>\n\nThe count is still at <b>${n} of 5 votes</b>.\nIf we don't reach enough votes, don't worry — prices are updated regularly anyway.`,
    actualizar_lanzado: `⏳ <b>Target reached (5/5 votes)!</b>\n\nI have sent the command to scan Eneba right now. I will send you a message with the new prices in a couple of minutes.`,
    actualizar_cooldown: (min) => `🛑 <b>Scraper on cooldown</b>\n\nPrices were updated very recently. You must wait <b>${min} minute${min > 1 ? "s" : ""}</b> before starting another vote.\n\n💡 You can check the current prices with /prices.`,
    actualizar_limite: `⚠️ /refresh limit reached for today. Please try again tomorrow.`,
    moneda_ok: (codigo, bandera) => `✅ <b>Currency changed to ${bandera} ${codigo}!</b>\n\nTo prevent conflicts, your previous alerts have been cleared. Your summaries will continue to arrive at 9:00 AM (you can adjust your exact local timezone at any time using /frequency).`,
    moneda_error: `❌ Invalid currency. Check /currencies`,
    moneda_boton_cancelar: "❌ Cancel",
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
  if (lang === "es") {
    return `📖 <b>Comandos disponibles</b>\n\n` +
      `🎯 /alerta → Configurar alerta de precio inteligente\n` +
      `🏷️ /precios → Ver precios actuales\n\n` +
      `⚙️ <b>Ajustes</b>\n` +
      `💱 /moneda → Cambiar moneda (€, $, £…)\n` +
      `📅 /frecuencia → Días y hora del resumen\n` +
      `🔔 /notificaciones → Pausar o reanudar avisos\n` +
      `🌐 /lang → Cambiar idioma\n` +
      `⚙️ /config → Ver tu configuración\n\n` +
      `🔄 /actualizar → Forzar actualización (por votos)\n` +
      `🆔 /id → Ver tu ID de Telegram\n` +
      `❌ /baja → Darse de baja\n` +
      `❓ /ayuda → Ver esta lista`;
  }
  return `📖 <b>Available commands</b>\n\n` +
    `🎯 /alert → Set up smart price alert\n` +
    `🏷️ /prices → View current prices\n\n` +
    `⚙️ <b>Settings</b>\n` +
    `💱 /currency → Change currency (€, $, £…)\n` +
    `📅 /frequency → Summary frequency & time\n` +
    `🔔 /notifications → Pause or resume alerts\n` +
    `🌐 /lang → Change language\n` +
    `⚙️ /config → Show your settings\n\n` +
    `🔄 /refresh → Request price update (by vote)\n` +
    `🆔 /id → Show your Telegram ID\n` +
    `❌ /unsubscribe → Unsubscribe\n` +
    `❓ /help → Show this list`;
}
