"use client"
import TxtInput from '@/components/txtInput';
import { NumberInput } from '@/components/numberInput';
import { useState } from 'react';
import { SelectRed } from '@/components/selectRed';

export default function Home() {
  const [montoMP, setMontoMP] = useState(0)
  const [montoWU, setMontoWU] = useState(0)
  const [montoUSDT, setMontoUSDT] = useState(0)

  const [nombre, setNombre] = useState("")
  const [mail, setMail] = useState("")
  const [txn, setTxn] = useState("")
  const [mtcn, setMtcn] = useState("")
  const [pais, setPais] = useState("")
  const [red, setRed] = useState("")
  const [nan, setNan] = useState(false)

  const [verWU, setVerWU] = useState(false)
  const [verMP, setVerMP] = useState(false)
  const [verCriptos, setVerCriptos] = useState(false)

  const [statusMP, setStatusMP] = useState('')
  const [statusCripto, setStatusCripto] = useState('')
  const [statusWU, setStatusWU] = useState('')

  return (
    <main className="text-xs md:text-base font-base bg-black flex min-h-screen flex-col text-white">

      <div className='portada relative bg-tapa bg-[length:auto_65vh] bg-right md:bg-contain md:bg-center bg-no-repeat min-h-screen p-6 md:p-24'>
        <h1 className='bg-black w-max p-1 text-xl md:text-4xl text-white mt-6'>RE-ANDAR LA HUELLA</h1>
        <h2 className='bg-black w-max p-1 text-lg md:text-2xl text-orange-300 mt-1 md:mt-4'>Caminos de investigación en Malabar</h2>
        <h1 className='bg-black w-max p-1 text-xl md:text-4xl text-white mt-6'>VIDRIERA MENTAL</h1>
        <h2 className='bg-black w-max p-1 text-lg md:text-2xl text-orange-300 mt-1 md:mt-4'>Una idea sobre el malabar</h2>
        <p className='bg-black p-1 group absolute text-xl md:text-2xl text-orange-300 hover:underline hover:font-black cursor-pointer bottom-6 mb-12 md:bottom-24 md:mb-24'
          onClick={() => {
            window.scrollTo({
              top: document.querySelector('.portada')!.getBoundingClientRect().height,
              left: 0,
              behavior: "smooth"
            })
          }} >
          Descargar
          <span className='group-hover:text-white'> -&gt;</span>
        </p>
        <h2 className='bg-black p-1 absolute text-lg md:text-2xl text-orange-300 bottom-0 mb-6 md:mb-24'>Sebastián Rojo</h2>
      </div>

      <div className='descarga min-h-screen my-10 p-6 md:p-24'>
        <h2 className='text-xl md:text-4xl text-white'>Descarga oficial</h2>
        <h3 className='text-lg md:text-2xl text-orange-300'>Re-andar la huella y Vidriera mental</h3>

        <p className='p-2'>Envianos tu colaboración y recibí los pdfs en tu mail. No hay monto mínimo, pero recordá que con tu contribución estás valorando el resultado de años de dedicación e investigación.</p>
        <p className='p-2'>Si transferís con MercadoPago el envío es automático. Si usás cripto o Western Union haremos el envío manual luego de verificar la transferencia. No demora y tenemos las notificaciones encendidas :)</p>
        <p className='p-2'>En cualquier caso en que hubieras efectuado el pago pero no hubieras recibido los pdfs, o por cualquier otra pregunta, consulta o comentario, escribinos sin dilación a <span className='font-mono'>elsilenciodondeescucho@gmail.com</span></p>
        <p className='p-2'>Salud!</p>

        <div className='grid lg:grid-cols-2 md:grid-cols-1 m-2 md:m-12'>

          <div className='text-center mt-12 md:mt-0'>

            <h3 className='text-2xl text-center text-orange-300'>Desde Argentina</h3>

            <div className='m-10'>
              <h4 className='text-xl text-orange-300'>Mercadopago</h4>
              <button className='border m-5 p-5' onClick={() => { setVerMP(!verMP) }}>Usar MercadoPago -&gt;</button>
              {verMP && <><p>Cargá tu mail, nombre y monto para generar un link de pago</p>
                <p>Al realizarse te enviaremos el pdf de manera automática al mail que hayas provisto :)</p>
                <div className='grid columns-2'>
                  <TxtInput nombre="nombre" valor={nombre} setValor={setNombre} />
                  <TxtInput nombre="mail" valor={mail} setValor={setMail} />
                  <label className='mt-2' htmlFor="">Monto (ARS):</label>
                  <NumberInput value={montoMP} update={setMontoMP} setNaN={setNan} />
                  {nan && <p>Sólo números en monto</p>}
                </div>
                <button className='border m-5 p-5' onClick={async () => {
                  if (nombre == "" || mail == "" || montoMP == 0) { alert(`Por favor completar todos los datos`); return; }
                  setStatusMP(`Creando link de pago por $${montoMP}...`)
                  const r = await fetch(`/mp/`, { method: 'PUT', body: JSON.stringify({ nombre, mail, monto: montoMP }), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
                  const j = await r.json()
                  setStatusMP(`Redirigiendo...`)
                  open(j.body.init_point)
                  setTimeout(() => { setStatusMP('') }, 3000)
                }}>Ir a MercadoPago -&gt;</button>
                <p>{statusMP}</p>
              </>}
            </div>

          </div>

          <div className='text-center'>

            <h3 className='text-2xl text-center text-orange-300'>Desde el exterior</h3>

            <div className='m-10'>
              <h4 className='text-xl text-orange-300'>Criptomonedas</h4>
              <button className='border m-5 p-5' onClick={() => { setVerCriptos(!verCriptos) }}>Usar criptos -&gt;</button>
              {verCriptos && <><p>Transferir USDT por red <span className="text-xl font-bold">Ethereum</span> o <span className="text-xl font-bold">BNB Chain</span> a <span className="text-xl font-bold" style={{ overflowWrap: 'anywhere' }}>0x0640b6c60Eda9BE0Ff83d4449DE53bBdE83B8c2b</span> </p>
                <p>Ingresá a continuación los datos de la transacción y te enviaremos el pdf a tu mail a la brevedad:</p>
                <div className='grid columns-2'>
                  <TxtInput nombre="nombre" valor={nombre} setValor={setNombre} />
                  <TxtInput nombre="mail" valor={mail} setValor={setMail} />
                  <TxtInput nombre="numero o id de transacción" valor={txn} setValor={setTxn} />
                  <label htmlFor="">Monto (USDT):</label>
                  <NumberInput value={montoUSDT} update={setMontoUSDT} setNaN={setNan} />
                  <SelectRed red={red} setRed={setRed} />
                </div>
                <button className='border m-5 p-5' onClick={async () => {
                  if (nombre == "" || mail == "" || montoUSDT == 0 || red == '' || txn == '') { alert(`Por favor completar todos los datos`); return; }
                  setStatusCripto(`Enviando información al servidor...`)
                  const r = await fetch(`/cripto/`, { method: 'POST', body: JSON.stringify({ nombre, mail, monto: montoUSDT, red, txn }), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
                  const j = await r.json()
                  if(j.ok){
                    setStatusCripto(`Recibido! En breve te estaremos enviando un mail :) Gracias!`)
                  }else{
                    console.log(`El problema:`)
                    console.log(j.msg)
                    setStatusCripto(`Ups, hubo algún problema. Podés escribirnos la misma información a vlad.chk@gmail.com y te enviaremos el archivo de forma manual`)
                  }
                }}>Hecho!</button>
                <p>{statusCripto}</p>
              </>}
            </div>

            <div className='m-10'>
              <h4 className='text-xl text-orange-300'>Western Union</h4>
              <button className='border m-5 p-5' onClick={() => { setVerWU(!verWU) }}>Usar WU -&gt;</button>
              {verWU && <>
                <p>Enviar giro a </p>
                <p className="font-bold">Sebastián Rojo</p>
                <p className="font-bold">DNI 24.357.725</p>
                <p className="font-bold">Córdoba, Argentina</p>
                <p>Para retirar correctamente el dinero, precisamos:</p>
                <ul >
                  <li className='m-2'>- tu nombre <span className="text-xl font-bold">completo</span></li>
                  <li className='m-2'>- el <span className="text-xl font-bold">MTCN</span>, que es el código de transacción que otorga WU</li>
                  <li className='m-2'>- el <span className="text-xl font-bold">país</span> desde el que estás enviando el giro</li>
                  <li className='m-2'>- el monto <span className="text-xl font-bold">en dólares</span></li>
                </ul>
                <p>Ingresá a continuación los datos de la transacción y te enviaremos el pdf a tu mail a la brevedad:</p>
                <div className='grid columns-2'>
                  <TxtInput nombre="nombre completo" valor={nombre} setValor={setNombre} />
                  <TxtInput nombre="mail" valor={mail} setValor={setMail} />
                  <TxtInput nombre="MTCN" valor={mtcn} setValor={setMtcn} />
                  <TxtInput nombre="país" valor={pais} setValor={setPais} />
                  <label htmlFor="">Monto (USD):</label>
                  <NumberInput value={montoWU} update={setMontoWU} setNaN={setNan} />
                </div>
                <button className='border m-5 p-5' onClick={async () => {
                  if (nombre == "" || mail == "" || montoWU == 0 || mtcn == '' || pais == '') { alert(`Por favor completar todos los datos`); return; }
                  setStatusWU(`Enviando información al servidor...`)
                  const r = await fetch(`/wu/`, { method: 'POST', body: JSON.stringify({ nombre, mail, monto: montoWU, mtcn, pais }), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
                  const j = await r.json()
                  if(j.ok){
                    setStatusWU(`Recibido! En breve te estaremos enviando un mail :) Gracias!`)
                  }else{
                    console.log(`El problema:`)
                    console.log(j.msg)
                    setStatusWU(`Ups, hubo algún problema. Podés escribirnos la misma información a vlad.chk@gmail.com y te enviaremos el archivo de forma manual`)
                  }
                }}>Hecho!</button>
                <p>{statusWU}</p>
              </>}
            </div>

          </div>


        </div>
      </div>

    </main>
  )
}
