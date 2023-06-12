import { NextResponse } from 'next/server';
import { pick } from 'lodash';
import mercadopago from 'mercadopago';

const url_base = 'https://reandarlahuella.vercel.app';


export async function POST(req: Request) {
  console.log(`================================`)
  console.log(`Procesando pago...`)
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
      return NextResponse.json({ status: 'error', status_detail: `${e.name}: ${e.message}`}, {status: 500})
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



// Acciones a llevar a cabo sobre las planillas según status de la situación:
export const acciones: Record<Status, any> = {
  approved: async (data: any) => {

  },
  in_process: async (data: any) => {
    
  },
  rejected: async (data: any) => {
    
  }
}

export type Status = 'approved' | 'in_process' | 'rejected'