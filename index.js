// Status "Playing Roblox" untuk 1 akun milik sendiri.
// Token dibaca dari environment variable TOKEN (jangan pernah ditulis di file / di-commit).
try { require("dotenv").config(); } catch {}

const fs = require("fs");
const path = require("path");
const Discord = require("discord.js-selfbot-v13");
const { RichPresence } = Discord;

process.on("unhandledRejection", (e) => console.error("⚠️ unhandledRejection:", e && e.message ? e.message : e));
process.on("uncaughtException", (e) => console.error("⚠️ uncaughtException:", e && e.message ? e.message : e));

const YEAR_MS = 365.25 * 24 * 3600 * 1000;
const stamp = () => new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
const isValidURL = (u) => { try { new URL(u); return true; } catch { return false; } };

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ Isi environment variable TOKEN (file .env di lokal, atau menu Variables di hosting)");
  process.exit(1);
}

const client = new Discord.Client({ checkUpdate: false });
const launchedAt = Date.now();
let bigImage = null; // hasil ambil gambar disimpan supaya tidak diminta ulang terus

async function resolveImage() {
  const url = cfg.largeImageUrl;
  if (!isValidURL(url)) return null;
  try {
    const images = await RichPresence.getExternal(client, cfg.applicationId, url);
    const img = images.find((i) => i.url === url) || images[0];
    if (!img) { console.error("⚠️ gambar tidak dikenali Discord:", url); return null; }
    return img.url.includes("attachments") ? img.url : img.external_asset_path;
  } catch (e) {
    console.error(`⚠️ gagal ambil gambar: ${e.message}`);
    return null;
  }
}

async function apply() {
  try {
    if (!bigImage) bigImage = await resolveImage();

    const p = new RichPresence(client)
      .setApplicationId(cfg.applicationId)
      .setType("PLAYING")
      .setName(cfg.name || "Roblox");

    // Waktu elapsed: mulai dari sekarang (0) atau mundur sekian tahun. Hapus baris startYearsAgo di config kalau tidak mau ada waktu.
    if (cfg.startYearsAgo !== undefined && cfg.startYearsAgo !== null) {
      p.setStartTimestamp(launchedAt - (Number(cfg.startYearsAgo) || 0) * YEAR_MS);
    }
    if (cfg.details) p.setDetails(cfg.details);
    if (cfg.state) p.setState(cfg.state);
    if (bigImage) {
      p.setAssetsLargeImage(bigImage);
      if (cfg.largeText) p.setAssetsLargeText(cfg.largeText);
    }

    client.user.setPresence({ activities: [p] });
  } catch (e) {
    console.error(`❌ gagal set status: ${e.message}`);
  }
}

client.on("ready", async () => {
  console.log(`✅ aktif sebagai ${client.user.username}`);
  await apply();
  const mins = Number(cfg.refreshMinutes) || 60;
  setInterval(apply, mins * 60 * 1000).unref();
});

// Catat kalau terputus atau token dibatalkan Discord
client.on("error", (e) => console.error(`⚠️ error: ${e.message}`));
client.on("invalidated", () => console.error(`🚫 ${stamp()} sesi dibatalkan Discord (token tidak berlaku lagi)`));
client.on("shardDisconnect", (event) => {
  const code = event && event.code;
  console.warn(`🔌 ${stamp()} terputus dari gateway (kode ${code})${code === 4004 ? " = TOKEN DITOLAK" : ""}`);
});
client.on("shardReconnecting", () => console.warn(`🔄 ${stamp()} mencoba menyambung ulang`));
client.on("shardResume", () => console.log(`✅ ${stamp()} tersambung kembali`));

client.login(TOKEN).catch((e) => {
  console.error(`❌ login gagal: ${e && e.message ? e.message : "token salah/kedaluwarsa"}`);
  process.exit(1);
});
