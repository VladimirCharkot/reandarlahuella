
export const SelectRed = ({red, setRed}: any) =>
<>
  <label htmlFor="">Red:</label>
  <select className="bg-slate-700 p-4 text-center mb-4" value={red} name="red" id="red" onChange={e => setRed(e.target.value)}>
    <option value="">Seleccionar...</option>
    <option value="bnb">BNB Chain</option>
    <option value="eth">Ethereum</option>
  </select>
  </>