import { NextResponse } from "next/server";
import bot from "../lib/tg";
import { enviarReandarYVidriera } from "../lib/sendgrid";

export const POST = async (req: Request, res: Response) => {
  const b = await req.json()
  if (b.password == process.env.TRIGGER_PASSWORD) {
    console.log(`Enviando mail...`)
    bot.sendMessage(process.env.TG_CHAT_ID!, `Enviando mails y pdfs a ${b.nombre} (${b.mail})...`)
    try{
      const r = await enviarReandarYVidriera(b.mail, b.nombre)
      bot.sendMessage(process.env.TG_CHAT_ID!, `...enviado a ${b.nombre} (${b.mail})! ${r}`)
    }catch(e){
      bot.sendMessage(process.env.TG_CHAT_ID!, `...falló envío a ${b.nombre} (${b.mail})! ${e}`)
    }
    return NextResponse.json({ ok: true })
  } else {
    return NextResponse.json({ ok: false, msg: `No autorizado c:` })
  }
}
