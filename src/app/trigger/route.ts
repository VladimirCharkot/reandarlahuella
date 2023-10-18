import { NextResponse } from "next/server";
import { emailer } from "../lib/mailer";
import bot from "../lib/tg";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const POST = async (req: Request, res: Response) => {
  console.log('Recibiendo POST en /trigger...');
  const b = await req.json()
  if(b.password == process.env.TRIGGER_PASSWORD){
    console.log(`Enviando mail...`)
    bot.sendMessage(process.env.TG_CHAT_ID!, `Enviando mails y pdfs a ${b.nombre} (${b.mail})`).then( () => console.log(`Mensaje enviado a Tg`) )
    const p = emailer.enviarReandar(b.mail, b.nombre)
    p
      .then(r => {
        bot.sendMessage(process.env.TG_CHAT_ID!, `@sendMessage then`)
      })
      .catch(r => {
        bot.sendMessage(process.env.TG_CHAT_ID!, `@sendMessage catch ${r}`)
      })
      .finally(() => {
        bot.sendMessage(process.env.TG_CHAT_ID!, `@sendMessage finally`) 
      })
    
    // emailer.enviarReandar(b.mail, b.nombre).then(() => {
    //   console.log(`Reandar enviado`)
    //   bot.sendMessage(process.env.TG_CHAT_ID!, `Mail y pdfs enviados a ${b.nombre} (${b.mail})`)
    // })
    return NextResponse.json({ok: true, anticache: Math.random()})
  }else{
    return NextResponse.json({ok: false, anticache: Math.random(), msg: `No autorizado c:`})
  }
}
