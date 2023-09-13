import bot from '@/app/lib/tg'
import { NextResponse } from 'next/server'

export const POST = async (req: Request, res: Response) => {
  try{
    const body = await req.json()
    bot.sendMessage(process.env.TG_CHAT_ID!, `${body.nombre} (${body.mail}) envió un giro de WU por USD$${body.monto} desde ${body.pais} con el MTCN ${body.mtcn}`)
    return NextResponse.json({ok: true})
  }catch(e: any){
    return NextResponse.json({ok: false, msg: e.message}) 
  }
}