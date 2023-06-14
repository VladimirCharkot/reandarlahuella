import TelegramBot from 'node-telegram-bot-api'

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TG_BOT_TOKEN;

if(!token) throw new Error("Falta el token de telegram")

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

console.log(`Inicializando bot...`)

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = `@chatId ${chatId}` + match !== null ? match![1] : "no \"whatever\""; // the captured "whatever"

  bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, `@chatId ${chatId}: Received your message`);
});

export default bot