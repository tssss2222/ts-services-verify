import { Client, GatewayIntentBits } from "discord.js";

// Pas "DISCORD_TOKEN" aan als je bot-token op Render onder een andere naam staat
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID; // kanaal waar mensen vragen stellen
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const COOLDOWN_MS = 10_000;

const SYSTEM_PROMPT =
  "Je bent een behulpzame assistent op de Discord-server TS SERVICES. " +
  "Antwoord in het Nederlands, kort en duidelijk. " +
  "Als je iets niet zeker weet, zeg dat eerlijk.";

if (!DISCORD_TOKEN || !GROQ_API_KEY || !CHANNEL_ID) {
  // De verificatieserver blijft gewoon draaien, alleen de AI-bot start niet
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

  async function askAI(question) {
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
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: question },
          ],
          max_tokens: 600,
        }),
      });
      if (!res.ok) return "Er ging iets mis bij de AI, probeer het straks opnieuw.";
      const data = await res.json();
      return data.choices[0].message.content;
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
    const answer = await askAI(message.content);
    await message.reply(answer.slice(0, 1900));
  });

  client.login(DISCORD_TOKEN).catch((err) => console.error("[vragenbot] Login mislukt:", err));
}
