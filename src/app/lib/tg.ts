import TelegramBot from 'node-telegram-bot-api'

const token = process.env.TG_BOT_TOKEN;

if(!token) throw new Error("Falta el token de telegram")

const bot = new TelegramBot(token)
// , {polling: true});

console.log(`Inicializando bot...`)

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `@chatId ${chatId}: Received your message`);
});


export default bot