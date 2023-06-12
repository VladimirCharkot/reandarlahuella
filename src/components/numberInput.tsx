import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface NumberInputProps {
  value: number,
  update: (n: number) => void,
  setNaN: Dispatch<SetStateAction<boolean>>
}

export const NumberInput = ({ value, update, setNaN }: NumberInputProps) => {
  const [valorTexto, setValorTexto] = useState('')

  useEffect(() => {
    if (valorTexto != "") {
      const n = parseInt(valorTexto)
      if (!isNaN(n)) {
        update(n)
        setNaN(false)
      } else {
        setNaN(true)
      }
    }else{
      update(0)
    }
  }, [valorTexto, update, setNaN])

  return (<input className="bg-slate-700 p-2 text-center" pattern="-?[0-9]*"
    value={valorTexto}
    onChange={e => {
      if (/-?[0-9]*/.test(e.target.value))
        setValorTexto(e.target.value)
    }}
    onKeyPress={(e) => {
      if (!/[0-9\-]/.test(e.key)) {
        e.preventDefault();
      }
    }} />)
}