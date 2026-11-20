import express from "express";

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

const OUDE_ROL = "1573138403610857513";
const NIEUWE_ROL = "1573104279839838372";
const API = "https://discord.com/api/v10";

app.get("/", (_req, res) => {
  res.send("TS SERVICES verificatie draait.");
});

app.get("/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).send("Verificatiecode ontbreekt.");
    }

    const tokenResponse = await fetch(`${API}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.status(400).send("Verificatie mislukt.");
    }

    const userResponse = await fetch(`${API}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    if (!userResponse.ok) {
      throw new Error(`Gebruiker ophalen mislukt: ${userResponse.status}`);
    }
    const userData = await userResponse.json();

    const memberUrl = `${API}/guilds/${GUILD_ID}/members/${userData.id}`;
    const botHeaders = {
      Authorization: `Bot ${BOT_TOKEN}`,
    };

    const joinResponse = await fetch(memberUrl, {
      method: "PUT",
      headers: {
        ...botHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: tokenData.access_token }),
    });
    if (!joinResponse.ok) {
      throw new Error(`Gebruiker toevoegen mislukt: ${joinResponse.status}`);
    }

    const addRoleResponse = await fetch(
      `${memberUrl}/roles/${NIEUWE_ROL}`,
      { method: "PUT", headers: botHeaders },
    );
    if (!addRoleResponse.ok) {
      throw new Error(`Nieuwe rol toekennen mislukt: ${addRoleResponse.status}`);
    }

    const removeRoleResponse = await fetch(
      `${memberUrl}/roles/${OUDE_ROL}`,
      { method: "DELETE", headers: botHeaders },
    );
    if (!removeRoleResponse.ok) {
      throw new Error(`Oude rol verwijderen mislukt: ${removeRoleResponse.status}`);
    }

    return res.send("✅ Je bent geverifieerd! Je kunt Discord weer openen.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Er ging iets mis.");
  }
});

app.listen(process.env.PORT || 3000);
