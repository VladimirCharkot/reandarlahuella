import { NextResponse } from 'next/server'
import mercadopago from 'mercadopago'
import { Currency } from 'mercadopago/shared/currency'
import bot from '@/app/lib/tg'
import { enviarReandarYVidriera } from '../lib/sendgrid'

type Status = 'approved' | 'in_process' | 'rejected'
const url_base = 'https://reandarlahuella.com'
const cache_pagos: Record<string, string> = {}

console.log(`Bot polling: ${bot.isPolling()}`)

try {
  if (process.env.MP_ACCESS_TOKEN === undefined) throw new Error('Falta MP_ACCESS_TOKEN')
  mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN!
  })
  console.log('MercadoPago configurado')
} catch (e) {
  console.error('No se pudo configurar MercadoPago. Está el token en el archivo correspondiente?')
}


export async function PUT(req: Request) {

  if (!req.body) { return NextResponse.json({ msg: 'No hay body' }, { status: 400 }) }
  const { nombre, mail, monto } = await req.json()

  let preference = {
    additional_info: JSON.stringify({ nombre, mail, monto }),
    notification_url: url_base + '/mp',
    back_urls: {
      success: url_base + '/pago_aprobado',
      pending: url_base + '/pago_pendiente',
      failure: url_base + '/pago_fallido'
    },
    purpose: "wallet_purchase",
    items: [
      {
        title: 'Reandar la huella',
        description: 'Caminos de investigación en el malabar',
        currency_id: 'ARS' as Currency,
        unit_price: monto,
        quantity: 1,
        picture_url: process.env.IMG_ML
      },
    ]
  }

  try {
    console.log('Creando preferencia...')
    let r = await mercadopago.preferences.create(preference)
    console.log('Respuesta:')
    console.log(JSON.stringify(r))
    return NextResponse.json(r, { status: 201 })
  } catch (e) {
    console.error('Error al crear preferencia:')
    console.error(JSON.stringify(e))
  }

}

export async function DELETE(req: Request) {
  enviarReandarYVidriera('vlad.chk@gmail.com', 'Vladi').then(() => console.log(`Mail enviado`))
  bot.sendMessage(process.env.TG_CHAT_ID!, `Testeando`).then(() => console.log(`Tg enviado`))
  return NextResponse.json({ ok: true })
}

// Acciones a llevar a cabo sobre las planillas según status de la situación:
const acciones: Record<Status, any> = {
  approved: async (data: any) => {
    await enviarReandarYVidriera(data.email, data.nombre)
    await bot.sendMessage(process.env.TG_CHAT_ID!, `${data.nombre} (${data.email}) envió un pago de $${data.monto} por MP. Mail con adjunto enviado.`)
  },
  in_process: async (data: any) => {
    await bot.sendMessage(process.env.TG_CHAT_ID!, `Pago en proceso de $${data.monto} de ${data.nombre} (${data.email})`)
  },
  rejected: async (data: any) => {
    await bot.sendMessage(process.env.TG_CHAT_ID!, `Falló el pago de $${data.monto} de ${data.nombre} (${data.email})`)
  }
}


export const POST = async (req: Request, res: Response) => {

  console.log('Recibiendo POST en /webhook...');
  const trace: string[] = []

  const log = (txt: string) => {
    console.log(txt)
    trace.push(txt)
  }

  const body = await req.json()
  log('Logueando body...');
  log(JSON.stringify(body))

  try {

    if (body.topic == 'merchant_order') {

      log('Procesando merchant order...');

      // Acá nos enteramos del pago de las preferencias (o sea de checkoutpro)
      let r = await fetch(body.resource, { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` } });
      const orden = await r.json();
      if (r.status != 200) {
        log(`Error queryiando merchant_order: ${JSON.stringify(r)}`);
        await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
        return NextResponse.json({ ok: false }, {status: 406});
      }

      // Obtenemos la orden, que tiene la referencia a la preferencia
      log('Orden obtenida')

      if (orden.payments.length == 0) {
        log('Todavia no hay info de pago disponible. Omitiendo.');
        await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
        return NextResponse.json({ ok: false }, {status: 406})
      }

      // Obtenemos el pago asociado

      log(`Buscando el pago en https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`)

      let r2 = await fetch(`https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`, { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` } })
      const pago = await r2.json()
      if (r2.status != 200) {
        log(`Error queryiando pago: ${JSON.stringify(r2)}`)
        await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
        return NextResponse.json({ ok: false }, {status: 406})
      }

      console.log('Pago obtenido!')

      // No procesar si la caché lo tiene como aprobado o con el mismo status
      if (cache_pagos.hasOwnProperty(pago.collection.id) &&
        (cache_pagos[pago.collection.id] == 'approved' || cache_pagos[pago.collection.id] == pago.collection.status)) {
        log('Pago ya procesado')
        await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
        return NextResponse.json({ ok: true }, {status: 406})
      }

      const identificacion = pago.collection.payer.identification.number ?? "NO_ENCONTRADO";

      // Extraemos nuestros propios datos de la preferencia
      const provisto = JSON.parse(orden.additional_info);
      log(`Obtenida información provista por el cliente`)
      log(provisto)
      log(`El status es ${pago.collection.status}`)

      // Y ejecutamos la acción correspondiente, según status del pago
      await acciones[pago.collection.status as Status]({
        nombre: provisto.nombre,
        monto: pago.collection.transaction_amount,
        email: provisto.mail,
        dni: identificacion,
        medio: 'mercadopago',
        id: pago.collection.id
      })

      log(`Ejecutada acción ${pago.collection.status}`)
      
      cache_pagos[pago.collection.id] = pago.collection.status;
      
      await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
    }
  } catch (e: any) {
    log(`Error en webhook: ${e.message}`)
    await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
    await bot.sendMessage(process.env.TG_CHAT_ID!, `Error en webhook: ${e.message}
    Body: ${JSON.stringify(body)}`)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}