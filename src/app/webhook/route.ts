import { NextResponse } from "next/server";
import { acciones, Status } from '../pagos/route';

const POST = async (req: Request) => {

  console.log('Recibiendo POST en /webhook...');

  const {topic, resource} = await req.json() 

  if(topic == 'merchant_order'){

    // Acá nos enteramos del pago de las preferencias (o sea de checkoutpro)
    let r = await fetch(resource, {headers: {'Authorization': `Bearer ${process.env.MP_TOKEN}`}})
    if(r.status != 200){ console.log(`Error queryiando merchant_order: ${JSON.stringify(r)}`); return; }

    // Obtenemos la orden, que tiene la referencia a la preferencia
    const orden = await r.json();
    console.log('Entró una merchant order en webhook:');
    console.log(JSON.stringify(orden));

    if(orden.payments.length == 0){
      console.log('Todavia no hay info de pago disponible. Omitiendo.');
      return NextResponse.json({});
    }

    // Obtenemos el pago asociado
    console.log(`Buscando el pago en https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`)
    let r2 = await fetch(`https://api.mercadolibre.com/collections/notifications/${orden.payments[0].id}`, {headers: {'Authorization': `Bearer ${process.env.MP_TOKEN}`}})

    if(r2.status != 200){ console.log(`Error queryiando pago: ${JSON.stringify(r2)}`); return NextResponse.json({}, {status: 400}) }
    const pago = await r2.json();
    console.log('El pago asociado es:');
    console.log(JSON.stringify(pago));

    const identificacion = pago.collection.payer.identification.number ?? "NO_ENCONTRADO";

    const provisto = JSON.parse(orden.additional_info);

    acciones[pago.collection.status as Status]({
      nombre: provisto.nombre,
      monto: pago.collection.transaction_amount,
      email: provisto.mail,
      dni: identificacion,
      medio: 'mercadopago',
      id: pago.collection.id
    })

  }

  NextResponse.json({})
}