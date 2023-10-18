import { NextResponse } from "next/server";
import { emailer } from "../lib/mailer";
import bot from "../lib/tg";
import { enviarReandarYVidriera } from "../lib/sendgrid";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const POST = async (req: Request, res: Response) => {
  console.log('Recibiendo POST en /trigger...');
  const b = await req.json()
  if (b.password == process.env.TRIGGER_PASSWORD) {
    console.log(`Enviando mail...`)
    bot.sendMessage(process.env.TG_CHAT_ID!, `Enviando mails y pdfs a ${b.nombre} (${b.mail})...`)
    enviarReandarYVidriera(b.mail, b.nombre)
      .then(
        r => {
          console.log(`...mail enviado!`)
          bot.sendMessage(process.env.TG_CHAT_ID!, `...enviado a ${b.nombre} (${b.mail})! ${r}`)
        })
      .catch(e => {
        console.log(`...falló envío!`)
        bot.sendMessage(process.env.TG_CHAT_ID!, `...falló envío a ${b.nombre} (${b.mail})! ${e}`)
      })
    return NextResponse.json({ ok: true, anticache: Math.random() })
  } else {
    return NextResponse.json({ ok: false, anticache: Math.random(), msg: `No autorizado c:` })
  }
}
