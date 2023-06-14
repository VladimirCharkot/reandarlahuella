import { NextResponse } from 'next/server';
import { pick } from 'lodash';
import mercadopago from 'mercadopago';
import {Currency} from 'mercadopago/shared/currency';

type Status = 'approved' | 'in_process' | 'rejected'
const url_base = 'https://reandarlahuella.vercel.app';

try{
  if (process.env.MP_TOKEN === undefined) throw new Error('Falta MP_TOKEN')
  mercadopago.configurations.setAccessToken(process.env.MP_TOKEN!)
  console.log('MercadoPago configurado');
}catch(e){
  console.error('No se pudo configurar MercadoPago. Está el token en el archivo correspondiente (.mptoken)?')
}

export async function GET(request: Request) {
  
  const data = {msg: 'ola c:'};
 
  return NextResponse.json( data );
}


export async function POST(req: Request) {

  if(!req.body){ return NextResponse.json({msg: 'No hay body'}, { status: 400 }) }
  const { nombre, mail, monto } = await req.json();
  
  let preference = {
    additional_info: JSON.stringify({nombre, mail, monto}),
    notification_url: url_base + '/webhook',
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
  };

  try{
    console.log('Creando preferencia...');
    let r = await mercadopago.preferences.create(preference);
    // console.log('Respuesta:');
    // console.log(JSON.stringify(r));
    return NextResponse.json(r, {status: 201})
  }catch(e){
    console.error('Error al crear preferencia:');
    console.error(JSON.stringify(e));
  }

}



// Acciones a llevar a cabo sobre las planillas según status de la situación:
const acciones = {
  approved: async (data: any) => {

  },
  in_process: async (data: any) => {
    
  },
  rejected: async (data: any) => {
    
  }
}



const procesarPago = async (req: Request) => {

  try{
    const body = await req.json() 
    const { nombre, mail, transaction_amount, payer } = body;
    const payment = pick(body, [ 'payer', 'transaction_amount', 'payment_method_id', 'installments' ])

    let r;
    try{
      r = await mercadopago.payment.save({
        ...payment,
        notification_url: url_base + '/webhook' // Por si queda pendiente
      })
      console.log('Obtenida respuesta');
      // console.log(JSON.stringify(r.body));
    }catch(e: any){
      console.log(`${e.name}: ${e.message}`);
      return NextResponse.json({ status: 'error', status_detail: `${e.name}: ${e.message}`}, {status: 200})
    }
    if (!r) { return NextResponse.json({ status: 'error', status_detail: `No response`}, {status: 200}) }


    interface PaymentResponse{status: Status, status_detail: string, id: string}
    const { status, status_detail, id } = r.body as PaymentResponse;

    console.log(`Status es ${status}`);

    await acciones[status]({
      nombre,
      mail,
      monto: transaction_amount,
      dni: payer.identification.number,
      medio: 'mp',
      id
    })

    NextResponse.json({ status, status_detail, id }, {status: 200})

  }catch(e: any){

    console.log(e.message);
    NextResponse.json({ status: 'error', status_detail: e }, {status: 500})

  }

}