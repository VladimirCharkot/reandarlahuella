import { capitalize } from "lodash"
import { Dispatch, SetStateAction } from "react"

interface TxtInputProps{
  nombre: string, valor: string, setValor: Dispatch<SetStateAction<string>>
}

const TxtInput = ({ nombre, valor, setValor }: TxtInputProps) => <>
  <label className='mt-2' htmlFor={nombre}>{capitalize(nombre)}:</label>
  <input className="bg-slate-700 p-2 text-center mb-4" type="text" name={nombre} value={valor} onChange={e => setValor(e.target.value)}/>
</>

export default TxtInput