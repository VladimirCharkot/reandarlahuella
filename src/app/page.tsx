"use client"
import { capitalize } from 'lodash'
import Image from 'next/image'
import TxtInput from '@/components/txtInput';
import { NumberInput } from '@/components/numberInput';
import { useState } from 'react';



export default function Home() {
  const [monto, setMonto] = useState(0)
  const [nombre, setNombre] = useState("")
  const [mail, setMail] = useState("")
  const [nan, setNan] = useState(false)

  return (
    <main className="text-xs md:text-base font-base bg-black flex min-h-screen flex-col text-white">

      <div className='portada relative bg-tapa bg-[length:auto_65vh] bg-right md:bg-contain md:bg-center bg-no-repeat min-h-screen p-6 md:p-24'>
        <h1 className='text-xl md:text-4xl text-white mt-6'>RE-ANDAR LA HUELLA</h1>
        <h2 className='text-lg md:text-2xl text-orange-300 mt-1 md:mt-4'>Caminos de investigación en Malabar</h2>
        <p className='group absolute text-xl md:text-2xl text-orange-300 hover:underline hover:font-black cursor-pointer bottom-6 mb-12 md:bottom-24 md:mb-24'
          onClick={() => {
            console.log('ndakjnsdkjan')
            window.scrollTo({
              top: document.querySelector('.portada')!.getBoundingClientRect().height ,
              left: 0,
              behavior: "smooth"
            })
          }} >
            Descargar
          <span className='group-hover:text-white'> -&gt;</span>
        </p>
        <h2 className='absolute text-lg md:text-2xl text-orange-300 bottom-0 mb-6 md:mb-24'>Sebastián Rojo</h2>
      </div>

      <div className='descarga min-h-screen my-10 p-6 md:p-24'>
        <h2 className='text-xl md:text-4xl text-white'>Descarga oficial</h2>
        <h3 className='text-lg md:text-2xl text-orange-300'>Re-andar la huella</h3>
        <p>Se ofrece aquí el texto en pdf para descarga junto a la posibilidad de colaborar</p>

        <div className='grid lg:grid-cols-2 md:grid-cols-1 m-2 md:m-12'>

          <div className='text-center mt-12'>

            <h3 className='text-2xl text-center text-orange-300'>Desde Argentina</h3>

            <div className='m-10'>
              <h4 className='text-xl text-orange-300'>Mercadopago</h4>
              <p>Cargá tu mail, nombre y monto para generar un link de pago:</p>
              <div className='grid columns-2'>
                <TxtInput nombre="nombre" valor={nombre} setValor={setNombre} />
                <TxtInput nombre="mail" valor={mail} setValor={setMail} />
                <label htmlFor="">Monto:</label>
                <NumberInput value={monto} update={setMonto} setNaN={setNan} />
                {nan && <p>Sólo números en monto</p>}
              </div>
              <button className='border m-5 p-5' onClick={async () => {
                if (nombre == "" || mail == "" || monto == 0) { alert(`Por favor completar todos los datos`); return; }
                console.log(`Sending al server el coso este:`)
                console.log({ nombre, mail, monto })
                const r = await fetch(`/mp/`, { method: 'POST', body: JSON.stringify({ nombre, mail, monto }), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
                const j = await r.json()
                open(j.body.sandbox_init_point)
              }}>Ir a MercadoPago -&gt;</button>
            </div>

            {/* <div className='m-10'>
              <h4 className='text-xl text-orange-300'>Transferencia</h4>
               
            </div> */}

          </div>

          <div className='text-center'>

            <h3 className='text-2xl text-center text-orange-300'>Desde el exterior</h3>

            <div className='m-10'>
              <h4 className='text-xl text-orange-300'>Criptomonedas</h4>
              <p>Transferir USDT por red <span className="text-xl font-bold">Ethereum</span> o <span className="text-xl font-bold">BNB Chain</span> a <span style={{ overflowWrap: 'anywhere' }}>0x517387e96e263f86fd1485a9547128a93c11cadb</span> </p>
            </div>

            <div className='m-10'>
              <h4 className='text-xl text-orange-300'>Western Union</h4>
              <p>Enviar giro a </p>
              <p className="font-bold">Sebastián Rojo</p>
              <p className="font-bold">DNI 24.357.725</p>
              <p className="font-bold">bastianrojo@gmail.com</p>
              <p className="font-bold">+5493512116751</p>
              <p className="font-bold">Córdoba, Argentina</p>
              <p>Escribinos a ese mail o celular indicando monto, remitente y número de transferencia (MTCN)</p>
            </div>

          </div>


        </div>
      </div>

    </main>
  )
}
