import express from "express";

const app = express();
const {
  CLIENT_ID, CLIENT_SECRET, BOT_TOKEN, GUILD_ID, REDIRECT_URI, LOG_CHANNEL_ID,
  UPSTASH_URL, UPSTASH_TOKEN, ADMIN_KEY, NEW_GUILD_ID, NEW_ROLE_ID,
} = process.env;

const OUDE_ROL = "1573138403610857513";
const NIEUWE_ROL = "1573104279839838372";
const API = "https://discord.com/api/v10";
const SERVER_NAAM = "TS SERVICES";

const authUrl =
  `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}` +
  `&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=identify+email+guilds.join`;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const sneeuw = Array.from({ length: 28 }, () => {
  const l = (Math.random() * 100).toFixed(1);
  const d = (8 + Math.random() * 10).toFixed(1);
  const v = (Math.random() * 10).toFixed(1);
  const s = (2 + Math.random() * 4).toFixed(1);
  return `<i style="left:${l}%;width:${s}px;height:${s}px;animation-duration:${d}s;animation-delay:-${v}s"></i>`;
}).join("");

const ICONEN = {
  ok: `<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 15-17"/></svg>`,
  fout: `<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M18 18l16 16M34 18L18 34"/></svg>`,
  schild: `<svg viewBox="0 0 52 52"><path d="M26 5l17 6v13c0 11-7 19-17 23C16 43 9 35 9 24V11z"/><path d="M19 26l5 5 10-11"/></svg>`,
};

const CSS = `
*{box-sizing:border-box;margin:0}
:root{--accent:#00bfff}
html,body{min-height:100%}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#e8f4ff;
background:radial-gradient(ellipse at 50% 0%,#0b2a4a 0%,#05080f 65%) fixed;
display:flex;align-items:center;justify-content:center;padding:20px;min-height:100vh}
.snow{position:fixed;inset:0;overflow:hidden;pointer-events:none}
.snow i{position:absolute;top:-10px;background:#fff;border-radius:50%;opacity:.7;animation:val linear infinite}
@keyframes val{to{transform:translate(30px,105vh)}}
.kaart{position:relative;width:100%;max-width:440px;text-align:center;padding:38px 26px 30px;
border-radius:24px;background:rgba(10,20,35,.78);border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);
box-shadow:0 0 45px color-mix(in srgb,var(--accent) 20%,transparent),inset 0 0 30px rgba(0,191,255,.05);
backdrop-filter:blur(8px);animation:op .6s ease both}
@keyframes op{from{opacity:0;transform:translateY(14px) scale(.98)}}
.merk{font-size:12px;letter-spacing:.35em;color:var(--accent);margin-bottom:22px;font-weight:700;text-shadow:0 0 12px var(--accent)}
.icoon{width:84px;height:84px;margin:0 auto 18px;filter:drop-shadow(0 0 12px var(--accent))}
.icoon svg{width:100%;height:100%;fill:none;stroke:var(--accent);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.icoon path{stroke-dasharray:80;stroke-dashoffset:80;animation:teken .8s .3s ease forwards}
@keyframes teken{to{stroke-dashoffset:0}}
.avatar{width:72px;height:72px;border-radius:50%;border:2px solid var(--accent);box-shadow:0 0 18px var(--accent);margin:0 auto 10px;display:block}
.naam{font-weight:700;margin-bottom:14px;font-size:17px}
h1{font-size:clamp(22px,6vw,28px);margin-bottom:10px}
p{color:#a9c4de;line-height:1.55;font-size:15px;margin-bottom:24px}
.knop{display:block;padding:14px 18px;border-radius:14px;text-decoration:none;font-weight:700;margin-top:10px;
border:1px solid var(--accent);color:var(--accent);transition:.2s}
.knop.hoofd{background:linear-gradient(135deg,#00bfff,#0077ff);color:#021018;border:0;box-shadow:0 0 22px rgba(0,191,255,.45)}
.knop:hover,.knop:active{transform:translateY(-2px);box-shadow:0 0 26px color-mix(in srgb,var(--accent) 55%,transparent)}
.voet{margin-top:22px;font-size:11px;color:#5d7893;letter-spacing:.08em}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.icoon path{stroke-dashoffset:0}}
`;

const ADMIN_CSS = `
.admin{max-width:820px;text-align:left}
.admin .merk{text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:18px 0}
.tegel{padding:16px;border-radius:16px;border:1px solid rgba(0,191,255,.3);background:rgba(0,191,255,.06)}
.tegel b{display:block;font-size:28px;color:var(--accent);text-shadow:0 0 12px rgba(0,191,255,.5)}
.tegel span{font-size:12px;color:#8fb0cc;letter-spacing:.05em}
h2{font-size:13px;letter-spacing:.2em;color:var(--accent);margin:26px 0 10px}
.rij{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:14px}
.rij small{color:#6f8aa3}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{padding:6px 10px;border-radius:999px;font-size:12px;border:1px solid rgba(0,191,255,.35)}
.chip.uit{border-color:#ff4d6d;color:#ff4d6d}
`;

function pagina({ icoon = "ok", titel, tekst, gebruiker, knoppen = [], fout = false }) {
  const avatar = gebruiker
    ? `<img class="avatar" alt="" src="${
        gebruiker.avatar
          ? `https://cdn.discordapp.com/avatars/${esc(gebruiker.id)}/${esc(gebruiker.avatar)}.png?size=128`
          : "https://cdn.discordapp.com/embed/avatars/0.png"
      }"><div class="naam">${esc(gebruiker.global_name || gebruiker.username)}</div>`
    : `<div class="icoon">${ICONEN[icoon]}</div>`;
  const knopHtml = knoppen
    .map((k) => `<a class="knop${k.hoofd ? " hoofd" : ""}" href="${esc(k.href)}">${esc(k.tekst)}</a>`)
    .join("");
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titel)} | ${SERVER_NAAM}</title>
<style>${CSS}${fout ? ":root{--accent:#ff4d6d}" : ""}</style></head>
<body><div class="snow">${sneeuw}</div>
<main class="kaart"><div class="merk">${SERVER_NAAM}</div>${avatar}
<h1>${esc(titel)}</h1><p>${esc(tekst)}</p>${knopHtml}
<div class="voet">Beveiligde verificatie via Discord</div></main></body></html>`;
}

const opnieuw = [{ tekst: "Opnieuw proberen", href: authUrl, hoofd: true }];

/* ---------- Foutafhandeling ---------- */

// Fout van de Discord API, met statuscode en Discord-foutcode erbij
class DiscordFout extends Error {
  constructor(stap, status, code, fout, detail) {
    super(
      `${stap} mislukt: ${status}` +
      (code ? ` (code ${code})` : "") +
      (fout ? ` [${fout}]` : "") +
      (detail ? ` - ${detail}` : "")
    );
    this.status = status;
    this.code = code;   // bijv. 30001 of 50025
    this.fout = fout;   // bijv. "invalid_grant" bij het token-endpoint
  }
}

async function leesFout(resp) {
  const txt = await resp.text().catch(() => "");
  let d = {};
  try { d = JSON.parse(txt); } catch { /* geen JSON */ }
  return {
    code: d.code,
    fout: d.error,
    detail: d.message || d.error_description || (txt ? txt.slice(0, 200) : ""),
  };
}

async function check(resp, stap) {
  if (!resp.ok) {
    const f = await leesFout(resp);
    throw new DiscordFout(stap, resp.status, f.code, f.fout, f.detail);
  }
  return resp;
}

/* ---------- Database (Upstash Redis via REST) ---------- */

async function redis(...cmd) {
  const r = await fetch(UPSTASH_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.result;
}

function tokenRecord(t) {
  return {
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: Date.now() + (t.expires_in - 300) * 1000,
  };
}

async function bewaarTokens(userId, t) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    await redis("SET", `tok:${userId}`, JSON.stringify(tokenRecord(t)));
  } catch (e) {
    console.error("Tokens opslaan mislukt:", e.message);
  }
}

/* ---------- Logs ---------- */

async function stuurBericht(body) {
  if (!LOG_CHANNEL_ID) return;
  try {
    const resp = await fetch(`${API}/channels/${LOG_CHANNEL_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) console.error(`Log mislukt: ${resp.status}`);
  } catch (e) {
    console.error("Log mislukt:", e.message);
  }
}

async function logVerificatie(user) {
  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : "https://cdn.discordapp.com/embed/avatars/0.png";
  await stuurBericht({
    embeds: [{
      title: "✅ Nieuwe verificatie",
      color: 0x00bfff,
      thumbnail: { url: avatar },
      fields: [
        { name: "Gebruiker", value: `<@${user.id}> (${user.username})`, inline: true },
        { name: "ID", value: user.id, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: SERVER_NAAM },
    }],
  });
}

/* ---------- Statistieken voor het dashboard ---------- */

async function registreer(user) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    const dag = new Date().toISOString().slice(0, 10);
    await redis("INCR", "stat:total");
    await redis("INCR", `stat:dag:${dag}`);
    await redis("LPUSH", "recent", JSON.stringify({
      id: user.id,
      naam: user.global_name || user.username,
      tijd: Date.now(),
    }));
    await redis("LTRIM", "recent", "0", "19");
  } catch (e) {
    console.error("Stats mislukt:", e.message);
  }
}

async function guildInfo(id) {
  if (!id) return null;
  try {
    const r = await fetch(`${API}/guilds/${id}?with_counts=true`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/* ---------- Leden naar een andere server zetten ---------- */

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

async function vernieuw(userId, data) {
  const resp = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: data.refresh_token,
    }),
  });
  if (!resp.ok) {
    const f = await leesFout(resp);
    console.error(`Token vernieuwen ${userId}: ${resp.status}`, f.fout || "", f.detail || "");
    return null;
  }
  const nieuw = tokenRecord(await resp.json());
  await redis("SET", `tok:${userId}`, JSON.stringify(nieuw));
  return nieuw;
}

// Geeft { status, code, message } terug. 201 = nieuw, 204 = zat er al in.
async function voegToe(userId, accessToken) {
  const body = { access_token: accessToken };
  if (NEW_ROLE_ID) body.roles = [NEW_ROLE_ID];
  for (let poging = 0; poging < 3; poging++) {
    const resp = await fetch(`${API}/guilds/${NEW_GUILD_ID}/members/${userId}`, {
      method: "PUT",
      headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) {
      const d = await resp.json().catch(() => ({}));
      await wacht(((d.retry_after || 2) + 0.5) * 1000);
      continue;
    }
    if (!resp.ok) {
      const f = await leesFout(resp);
      console.error(`Pull ${userId}: ${resp.status} (code ${f.code ?? "-"}) ${f.detail}`);
      return { status: resp.status, code: f.code, message: f.detail };
    }
    return { status: resp.status };
  }
  return { status: 429, message: "Rate limit" };
}

async function pullAlleLeden() {
  const keys = await redis("KEYS", "tok:*");
  const tel = { nieuw: 0, alLid: 0, serverLimiet: 0, ongeldig: 0, mislukt: 0 };

  for (const key of keys) {
    const userId = key.slice(4);
    try {
      let data = JSON.parse(await redis("GET", key));
      if (Date.now() > data.expires_at) data = await vernieuw(userId, data);
      if (!data) {
        // refresh token werkt niet meer (bijv. gebruiker heeft de app ingetrokken)
        tel.ongeldig++;
        await redis("DEL", key);
        continue;
      }

      let r = await voegToe(userId, data.access_token);

      // Ongeldige access token: één keer vernieuwen en opnieuw proberen
      if (r.code === 50025) {
        const v = await vernieuw(userId, data);
        if (v) r = await voegToe(userId, v.access_token);
      }

      if (r.status === 201) { tel.nieuw++; await wacht(1000); }
      else if (r.status === 204) { tel.alLid++; await wacht(150); }
      else if (r.code === 30001) { tel.serverLimiet++; await wacht(300); }
      else if (r.code === 50025) {
        tel.ongeldig++;
        await redis("DEL", key); // token is onbruikbaar, gebruiker moet opnieuw verifiëren
        await wacht(300);
      }
      else { tel.mislukt++; await wacht(300); }
    } catch (e) {
      tel.mislukt++;
      console.error(`Pull ${userId}:`, e.message);
    }
  }

  await stuurBericht({
    embeds: [{
      title: "📦 Pull klaar",
      color: 0x00bfff,
      description:
        `Opgeslagen leden: **${keys.length}**\n` +
        `Nieuw toegevoegd: **${tel.nieuw}**\n` +
        `Zaten er al in: **${tel.alLid}**\n` +
        `Server-limiet bereikt (100 servers): **${tel.serverLimiet}**\n` +
        `Token ongeldig (moeten opnieuw verifiëren): **${tel.ongeldig}**\n` +
        `Overig mislukt: **${tel.mislukt}**`,
      timestamp: new Date().toISOString(),
      footer: { text: SERVER_NAAM },
    }],
  });
}

let pullBezig = false;

app.get("/pull", async (req, res) => {
  if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) {
    return res.status(403).send(pagina({
      icoon: "fout", fout: true,
      titel: "Geen toegang",
      tekst: "Deze pagina is alleen voor admins.",
    }));
  }
  if (!NEW_GUILD_ID || !UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).send(pagina({
      icoon: "fout", fout: true,
      titel: "Instellingen ontbreken",
      tekst: "NEW_GUILD_ID, UPSTASH_URL of UPSTASH_TOKEN ontbreekt in Render.",
    }));
  }
  if (pullBezig) {
    return res.send(pagina({
      icoon: "schild",
      titel: "Pull bezig",
      tekst: "Er loopt al een pull. Het resultaat komt in je logkanaal zodra hij klaar is.",
    }));
  }

  let aantal = "?";
  try {
    aantal = (await redis("KEYS", "tok:*")).length;
  } catch (e) {
    console.error("Tellen mislukt:", e.message);
  }

  pullBezig = true;
  pullAlleLeden()
    .catch((e) => console.error("Pull fout:", e.message))
    .finally(() => { pullBezig = false; });

  res.send(pagina({
    icoon: "ok",
    titel: "Pull gestart",
    tekst: `${aantal} opgeslagen leden worden naar de nieuwe server gezet. Je kunt dit venster sluiten, het resultaat komt in je logkanaal.`,
  }));
});

/* ---------- Admin-dashboard ---------- */

app.get("/admin", async (req, res) => {
  if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) {
    return res.status(403).send(pagina({
      icoon: "fout", fout: true,
      titel: "Geen toegang",
      tekst: "Deze pagina is alleen voor admins.",
    }));
  }

  let opgeslagen = "–", vandaag = "–", totaal = "–", recent = [];
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const dag = new Date().toISOString().slice(0, 10);
      opgeslagen = (await redis("KEYS", "tok:*")).length;
      vandaag = (await redis("GET", `stat:dag:${dag}`)) || 0;
      totaal = (await redis("GET", "stat:total")) || 0;
      recent = (await redis("LRANGE", "recent", "0", "9")).map((x) => JSON.parse(x));
    } catch (e) {
      console.error("Admin data mislukt:", e.message);
    }
  }

  const [hoofd, nieuw] = await Promise.all([guildInfo(GUILD_ID), guildInfo(NEW_GUILD_ID)]);
  const key = encodeURIComponent(req.query.key);

  const instellingen = {
    CLIENT_ID, CLIENT_SECRET, BOT_TOKEN, GUILD_ID, REDIRECT_URI, LOG_CHANNEL_ID,
    UPSTASH_URL, UPSTASH_TOKEN, ADMIN_KEY, NEW_GUILD_ID, NEW_ROLE_ID,
  };
  const chips = Object.entries(instellingen)
    .map(([naam, waarde]) => `<span class="chip${waarde ? "" : " uit"}">${waarde ? "✅" : "❌"} ${naam}</span>`)
    .join("");

  const tegel = (waarde, label) => `<div class="tegel"><b>${esc(waarde)}</b><span>${esc(label)}</span></div>`;
  const rijen = recent.length
    ? recent.map((r) => `<div class="rij"><span>${esc(r.naam)} <small>${esc(r.id)}</small></span><small>${esc(
        new Date(r.tijd).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", dateStyle: "short", timeStyle: "short" })
      )}</small></div>`).join("")
    : `<div class="rij"><small>Nog geen verificaties sinds het dashboard actief is.</small></div>`;

  res.send(`<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Dashboard | ${SERVER_NAAM}</title>
<style>${CSS}${ADMIN_CSS}</style></head>
<body><div class="snow">${sneeuw}</div>
<main class="kaart admin"><div class="merk">${SERVER_NAAM} · DASHBOARD</div>
<div class="grid">
${tegel(hoofd?.approximate_member_count ?? "–", "Leden hoofdserver")}
${tegel(nieuw?.approximate_member_count ?? "–", "Leden nieuwe server")}
${tegel(opgeslagen, "Opgeslagen (pullbaar)")}
${tegel(vandaag, "Verificaties vandaag")}
${tegel(totaal, "Verificaties totaal")}
${tegel(Math.floor(process.uptime() / 60) + " min", "Server actief")}
</div>
<h2>LAATSTE VERIFICATIES</h2>${rijen}
<h2>INSTELLINGEN</h2><div class="chips">${chips}</div>
<h2>ACTIES</h2>
<a class="knop hoofd" href="/pull?key=${key}">Pull starten</a>
<a class="knop" href="/admin?key=${key}">Verversen</a>
<a class="knop" href="/">Verificatiepagina openen</a>
<div class="voet">Alleen voor admins · deel deze link nooit</div></main></body></html>`);
});

/* ---------- Pagina's ---------- */

app.get("/", (_req, res) => {
  res.send(pagina({
    icoon: "schild",
    titel: "Verificatie",
    tekst: "Autoriseer de bot met je Discord-account om toegang te krijgen tot de server.",
    knoppen: [{ tekst: "Verifiëren met Discord", href: authUrl, hoofd: true }],
  }));
});

app.get("/ping", (_req, res) => res.send("ok"));

// Codes die al zijn ingewisseld (een OAuth-code werkt maar één keer)
const gebruikteCodes = new Map();
setInterval(() => {
  const grens = Date.now() - 10 * 60 * 1000;
  for (const [c, t] of gebruikteCodes) if (t < grens) gebruikteCodes.delete(c);
}, 60 * 1000).unref();

app.get("/callback", async (req, res) => {
  try {
    if (req.query.error) {
      return res.status(200).send(pagina({
        icoon: "fout", fout: true,
        titel: "Geannuleerd",
        tekst: "Je hebt de verificatie geannuleerd. Probeer het opnieuw als je toegang wilt.",
        knoppen: opnieuw,
      }));
    }

    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).send(pagina({
        icoon: "fout", fout: true,
        titel: "Geen code",
        tekst: "Open de verificatieknop in Discord om te beginnen.",
        knoppen: opnieuw,
      }));
    }

    // Dubbele aanvraag met dezelfde code (verversen / dubbel klikken)
    if (gebruikteCodes.has(code)) {
      return res.send(pagina({
        icoon: "schild",
        titel: "Al verwerkt",
        tekst: "Deze verificatie is al gestart. Open Discord, je zou nu toegang moeten hebben. Lukt het niet, probeer dan opnieuw te verifiëren.",
        knoppen: [
          { tekst: "Open Discord", href: `https://discord.com/channels/${GUILD_ID}`, hoofd: true },
          { tekst: "Opnieuw verifiëren", href: authUrl },
        ],
      }));
    }
    gebruikteCodes.set(code, Date.now());

    const tokenResp = await fetch(`${API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    await check(tokenResp, "Token ophalen");
    const tokenData = await tokenResp.json();
    const { access_token } = tokenData;

    const userResp = await check(
      await fetch(`${API}/users/@me`, { headers: { Authorization: `Bearer ${access_token}` } }),
      "Gebruiker ophalen"
    );
    const user = await userResp.json();

    const memberUrl = `${API}/guilds/${GUILD_ID}/members/${user.id}`;
    const botHeaders = { Authorization: `Bot ${BOT_TOKEN}` };

    await check(await fetch(memberUrl, {
      method: "PUT",
      headers: { ...botHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ access_token }),
    }), "Gebruiker toevoegen");

    await check(await fetch(`${memberUrl}/roles/${NIEUWE_ROL}`, { method: "PUT", headers: botHeaders }), "Nieuwe rol geven");
    await check(await fetch(`${memberUrl}/roles/${OUDE_ROL}`, { method: "DELETE", headers: botHeaders }), "Oude rol weghalen");

    await bewaarTokens(user.id, tokenData);
    await logVerificatie(user);
    await registreer(user);

    return res.send(pagina({
      icoon: "ok",
      gebruiker: user,
      titel: "Je bent geverifieerd!",
      tekst: `Welkom bij ${SERVER_NAAM}. Je hebt nu toegang tot de server.`,
      knoppen: [{ tekst: "Open Discord", href: `https://discord.com/channels/${GUILD_ID}`, hoofd: true }],
    }));
  } catch (err) {
    console.error(err.message);

    // Gebruiker zit al in het maximum aantal servers
    if (err.code === 30001) {
      return res.status(400).send(pagina({
        icoon: "fout", fout: true,
        titel: "Te veel servers",
        tekst: "Je zit al in het maximum aantal Discord-servers (100, of 200 met Nitro). Verlaat een server en probeer het daarna opnieuw.",
        knoppen: opnieuw,
      }));
    }

    // Code verlopen/al gebruikt, of token ongeldig
    if (err.fout === "invalid_grant" || err.code === 50025) {
      return res.status(400).send(pagina({
        icoon: "fout", fout: true,
        titel: "Verificatie verlopen",
        tekst: "De verificatiecode is verlopen of al gebruikt. Klik op de knop om opnieuw te verifiëren.",
        knoppen: opnieuw,
      }));
    }

    return res.status(500).send(pagina({
      icoon: "fout", fout: true,
      titel: "Er ging iets mis",
      tekst: "De verificatie is niet gelukt. Probeer het opnieuw, of neem contact op met een admin als het blijft misgaan.",
      knoppen: opnieuw,
    }));
  }
});

app.listen(process.env.PORT || 3000);
