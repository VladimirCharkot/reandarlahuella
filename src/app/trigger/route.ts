import { NextResponse } from "next/server";
import { emailer } from "../lib/mailer";
import bot from "../lib/tg";

export const POST = async (req: Request, res: Response) => {
  console.log('Recibiendo POST en /trigger...');
  const b = await req.json()
  if(b.password == process.env.TRIGGER_PASSWORD){
    console.log(`Enviando mail...`)
    bot.sendMessage(process.env.TG_CHAT_ID!, `Enviando mails y pdfs a ${b.nombre} (${b.mail})`).then( () => console.log(`Mensaje enviado a Tg`) )
    const p = emailer.enviarReandar(b.mail, b.nombre)
    p
      .then(r => {
        bot.sendMessage(process.env.TG_CHAT_ID!, `Mail salió!`)
      })
      .catch(r => {
        bot.sendMessage(process.env.TG_CHAT_ID!, `Mail falló: ${r}`)
      })
    
    // emailer.enviarReandar(b.mail, b.nombre).then(() => {
    //   console.log(`Reandar enviado`)
    //   bot.sendMessage(process.env.TG_CHAT_ID!, `Mail y pdfs enviados a ${b.nombre} (${b.mail})`)
    // })
    return NextResponse.json({ok: true})
  }else{
    return NextResponse.json({ok: false, msg: `No autorizado c:`})
  }
}
