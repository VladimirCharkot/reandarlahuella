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

  const male_sal = async (msg: string) => {
    log(msg);
    log(`Devolviendo status HTTP 200`)
    await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // Diálogo con MP:

  const body = await req.json()
  log('Notificación recibida:');
  log(JSON.stringify(body))

  try {

    if (body.topic == 'merchant_order') {

      log('Es una merchant order. Consultando...');

      // Acá nos enteramos del pago de las preferencias (o sea de checkoutpro)
      let orden_response = await fetch(body.resource, { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` } });
      const orden = await orden_response.json();
      if (orden_response.status != 200) { return await male_sal(`Error queryiando merchant_order: ${JSON.stringify(orden_response)}`) }

      // Obtenemos la orden, que tiene la referencia a la preferencia
      log('Orden obtenida:')
      log(JSON.stringify(orden))
      if (orden.payments.length == 0) { return await male_sal('Todavia no hay info de pago disponible. Omitiendo.'); }

      // Obtenemos el pago asociado

      log(`Buscando el pago en https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`)

      let pago_response = await fetch(`https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`, { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` } })
      const pago = await pago_response.json()
      if (pago_response.status != 200) { return await male_sal(`Error queryiando pago: ${JSON.stringify(pago)}`) }

      log(`Pago obtenido. El status es ${pago.collection.status}:`)
      log(JSON.stringify(pago))

      // No procesar si la caché lo tiene como aprobado o con el mismo status que este
      if (cache_pagos.hasOwnProperty(pago.collection.id) &&
        (cache_pagos[pago.collection.id] == 'approved' || cache_pagos[pago.collection.id] == pago.collection.status)) {
        return await male_sal(`Pago ${pago.collection.id} encontrado en cache con status ${pago.collection.status}`)
      }

      const identificacion = pago.collection.payer.identification.number ?? "NO_ENCONTRADO";

      // Extraemos nuestros propios datos de la **orden**
      const provisto = JSON.parse(orden.additional_info);
      log(`Obtenida información provista por el usuario:`)
      log(JSON.stringify(provisto))

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

      if(process.env.DEBUG){
        await bot.sendMessage(process.env.TG_CHAT_ID!, trace.join('\n'))
      }
      await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
    }
  } catch (e: any) {
    log(`Error en webhook: ${e.message}`)
    await bot.sendMessage(process.env.TG_CHAT_ID!, `Error en webhook: ${e.message}\n\n
    Body: ${JSON.stringify(body)}\n\nTrace:\n ${trace.join('\n')}`)
    await fetch('https://eoqadvsrz962xm4.m.pipedream.net', { method: 'POST', body: JSON.stringify({ trace }) })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}