import { Client, GatewayIntentBits } from "discord.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID; // kanaal waar mensen vragen stellen
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const COOLDOWN_MS = 10_000;

// Kanaal waar je tickets maakt. Pas dit ID aan als het een ander kanaal is.
const TICKET_KANAAL_ID = "1574174907665883237";

// ====== HIER STEL JE ZELF IN WAT DE BOT WEET ======
const SERVER_INFO = `
Over TS SERVICES:
TS SERVICES maakt Discord-servers en custom bots op aanvraag.
Tickets maak je in het kanaal <#${TICKET_KANAAL_ID}>. Bestellen gaat altijd via een ticket.

Hoe bestel je:
1. Open een ticket.
2. Vertel wat je wilt.
3. Geef je gewenste functies door.
4. Kies je beheeroptie.
5. Je krijgt vooraf een prijsopgave.

Diensten en prijzen (alle prijzen zijn "vanaf", de echte prijs hangt af van je wensen):
- Small Custom Bot: vanaf €5. Eigen Discord-bot met eigen naam en profielfoto, commands en functies naar wens. 30 dagen hosting via TS SERVICES inbegrepen (verlengen kan). Volledige overdracht met broncode kan tegen een meerprijs.
- Starter Server: vanaf €4. 10-15 rollen, 10-15 kanalen, 5-7 categorieën, basis machtigingen, eigen rolkleuren.
- Advanced Server: vanaf €8,50. 15-25 rollen, 20-30 kanalen, 8-12 categorieën, aangepaste machtigingen, welkomstbot, moderatiebot, basis automatisering.
- Premium Server: vanaf €11,50. 25-40 rollen, 30-45 kanalen, 12-18 categorieën, ticketbot, moderatiebot, welkomstbot, verificatiesysteem, automatische moderatie.
- Ultimate Server: vanaf €15. 40-60 rollen, 45-70 kanalen, 18-25 categorieën, volledig aangepaste machtigingen, ticketbot, moderatiebot, welkomstbot, verificatiesysteem, beveiligingssysteem, automatische moderatie en extra automatisering.
- Ook mogelijk: BDFD scripts en commands, ticket- en verificatiesystemen, moderatie en beveiliging.
`;
// ===================================================

const BASIS_PROMPT =
  "Je bent de assistent van de Discord-server TS SERVICES. " +
  "Antwoord in het Nederlands, kort en duidelijk. " +
  "Gebruik alleen de informatie hieronder voor vragen over TS SERVICES, prijzen en diensten. " +
  "Verzin nooit prijzen, regels of informatie. Weet je iets niet, zeg dat eerlijk en verwijs naar een ticket. " +
  "Voor andere algemene vragen mag je gewoon helpen.\n";

if (!DISCORD_TOKEN || !GROQ_API_KEY || !CHANNEL_ID) {
  console.error("[vragenbot] Zet DISCORD_TOKEN, GROQ_API_KEY en CHANNEL_ID. AI-bot niet gestart.");
} else {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const lastUsed = new Map();

  async function askAI(question, guild) {
    const live = guild ? `\nLive serverinfo: ${guild.name} heeft ${guild.memberCount} leden.\n` : "";
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: BASIS_PROMPT + live + SERVER_INFO },
            { role: "user", content: question },
          ],
          max_tokens: 1500,
        }),
      });
      if (!res.ok) {
        const tekst = await res.text().catch(() => "");
        console.error(`[vragenbot] Groq fout ${res.status}: ${tekst.slice(0, 300)}`);
        return "Er ging iets mis bij de AI, probeer het straks opnieuw.";
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || "Daar heb ik geen antwoord op, probeer het anders te vragen.";
    } catch (err) {
      console.error("[vragenbot]", err);
      return "Er ging iets mis bij de AI, probeer het straks opnieuw.";
    }
  }

  client.once("ready", () => console.log(`[vragenbot] Ingelogd als ${client.user.tag}`));

  client.on("messageCreate", async (message) => {
    if (message.author.bot || message.channel.id !== CHANNEL_ID) return;
    if (!message.content.trim()) return;

    const now = Date.now();
    const wait = COOLDOWN_MS - (now - (lastUsed.get(message.author.id) || 0));
    if (wait > 0) {
      await message.reply(`Rustig aan, probeer het over ${Math.ceil(wait / 1000)} seconden opnieuw.`);
      return;
    }
    lastUsed.set(message.author.id, now);

    await message.channel.sendTyping();
    const answer = await askAI(message.content, message.guild);
    await message.reply({ content: answer.slice(0, 1900), allowedMentions: { parse: [] } });
  });

  client.login(DISCORD_TOKEN).catch((err) => console.error("[vragenbot] Login mislukt:", err));
}
