import { NextResponse } from "next/server";
import { emailer } from "../lib/mailer";
import bot from "../lib/tg";

export const POST = async (req: Request, res: Response) => {
  console.log('Recibiendo POST en /trigger...');
  const b = await req.json()
  if(b.password == process.env.TRIGGER_PASSWORD){
    console.log(`Enviando mail...`)
    await emailer.enviarReandar(b.mail, b.nombre)
    console.log(`Enviando chat...`)
    await bot.sendMessage(process.env.TG_CHAT_ID!, `Mail y pdfs enviados a ${b.nombre} (${b.mail})`)
    console.log(`Enviados!`)
    return NextResponse.json({ok: true})
  }else{
    return NextResponse.json({ok: false, msg: `No autorizado c:`})
  }
}
