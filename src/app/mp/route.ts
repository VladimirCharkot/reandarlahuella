import { NextResponse } from 'next/server'
import { fromPairs, pick } from 'lodash'
import mercadopago from 'mercadopago'
import {Currency} from 'mercadopago/shared/currency'
import bot from '@/app/lib/tg'

type Status = 'approved' | 'in_process' | 'rejected'
const url_base = 'https://reandarlahuella.vercel.app'
const cache_pagos: Record<string, string> = {}

console.log(`Bot polling: ${bot.isPolling()}`)

try{
  if (process.env.MP_TOKEN === undefined) throw new Error('Falta MP_TOKEN')
  mercadopago.configurations.setAccessToken(process.env.MP_TOKEN!)
  console.log('MercadoPago configurado')
}catch(e){
  console.error('No se pudo configurar MercadoPago. Está el token en el archivo correspondiente (.mptoken)?')
}


export async function PUT(req: Request) {

  if(!req.body){ return NextResponse.json({msg: 'No hay body'}, { status: 400 }) }
  const { nombre, mail, monto } = await req.json()

  //bot.sendMessage('', `${nombre} creó preferencia de monto $${monto}`)
  
  let preference = {
    additional_info: JSON.stringify({nombre, mail, monto}),
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

  try{
    console.log('Creando preferencia...')
    let r = await mercadopago.preferences.create(preference)
    console.log('Respuesta:')
    console.log(JSON.stringify(r))
    return NextResponse.json(r, {status: 201})
  }catch(e){
    console.error('Error al crear preferencia:')
    console.error(JSON.stringify(e))
  }

}


// Acciones a llevar a cabo sobre las planillas según status de la situación:
const acciones: Record<Status, any> = {
  approved: async (data: any) => {
    console.log(`@webhoook approved`)
    bot.sendMessage(process.env.TG_CHAT_ID!, `Entró pago de $${data.monto} de ${data.nombre} (${data.email})`)
  },
  in_process: async (data: any) => {
    console.log(`@webhoook in_process`)
    bot.sendMessage(process.env.TG_CHAT_ID!, `Entró pago de $${data.monto} de ${data.nombre} (${data.email})`)
  },
  rejected: async (data: any) => {
    console.log(`@webhoook rejected`)
    bot.sendMessage(process.env.TG_CHAT_ID!, `Entró pago de $${data.monto} de ${data.nombre} (${data.email})`)
  }
}


export const POST = async (req: Request, res: Response) => {

  console.log('Recibiendo POST en /webhook...');

  // Eco a pipedream
  const body = await req.json()
  fetch('https://eoqadvsrz962xm4.m.pipedream.net', {method: 'POST', body: JSON.stringify({...body, origen: 'Enviado desde @webhook'})})
  
  // Parseo query a mano
  // const query = fromPairs(req.url.split('?')[1].split('&').map(s => s.split('=')))

  if(body.topic == 'merchant_order'){
    
    console.log(body)

    // Acá nos enteramos del pago de las preferencias (o sea de checkoutpro)
    let r = await fetch(body.resource, {headers: {'Authorization': `Bearer ${process.env.MP_TOKEN}`}});
    const orden = await r.json();
    if(r.status != 200){
      console.error(`Error queryiando merchant_order: ${JSON.stringify(r)}`);
      return;
    }

    // Obtenemos la orden, que tiene la referencia a la preferencia
    console.log('Entró una merchant order en webhook:');
    console.log(JSON.stringify(orden));

    if(orden.payments.length == 0){
      console.log('Todavia no hay info de pago disponible. Omitiendo.');
      return NextResponse.json({ok: false})
    }

    // Obtenemos el pago asociado

    console.log(`Buscando el pago en https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`)

    let r2 = await fetch(`https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`, {headers: {'Authorization': `Bearer ${process.env.MP_TOKEN}`}});
    const pago = await r2.json();
    if(r2.status != 200){
      console.error(`Error queryiando pago: ${JSON.stringify(r2)}`);
      return NextResponse.json({ok: false});
    }
    
    console.log('El pago asociado es:');
    console.log(JSON.stringify(pago));

    // No procesar si la caché lo tiene como aprobado o con el mismo status
    if (cache_pagos.hasOwnProperty(pago.collection.id) && 
    (cache_pagos[pago.collection.id] == 'approved' || cache_pagos[pago.collection.id] == pago.collection.status)) {
      console.log('Pago ya procesado');
      return NextResponse.json({ok: true});
    }

    const identificacion = pago.collection.payer.identification.number ?? "NO_ENCONTRADO";

    // Extraemos nuestros propios datos de la preferencia
    const provisto = JSON.parse(orden.additional_info);
    console.log(`Ahora agregaría entrada pública con ${JSON.stringify({nombre: provisto.nombre, monto: pago.collection.transaction_amount})}`);
    console.log(`Ahora agregaría entrada privada con ${JSON.stringify({nombre: provisto.nombre, monto: pago.collection.transaction_amount, email: provisto.mail, dni: identificacion, medio: 'mercadopago'})}`);

    // Y appendeamos a la planilla correspondiente, según status del pago
    acciones[pago.collection.status as Status]({
      nombre: provisto.nombre,
      monto: pago.collection.transaction_amount,
      email: provisto.mail,
      dni: identificacion,
      medio: 'mercadopago',
      id: pago.collection.id
    })

    cache_pagos[pago.collection.id] = pago.collection.status;

  }

  NextResponse.json({ok: true}, {status: 200})
}