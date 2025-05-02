import { useState } from 'react'
import './App.css'

const buttons = [
  "|x|", "AC", "i", "+/-", "/",
  "√x", "7", "8", "9", "x",
  "^", "4", "5", "6", "-",
  "Ln", "1", "2", "3", "+",
  "↩", "DEL", "0", ".", "="
];

function App() {
  const [theButtons] = useState(buttons)
  const [count, setCount] = useState(0)

  return (
    <div className="backg">
      <div className="calc">
        <div className="calc-ans">
          <p className="calc-prevOp">
            (1+4i) x (4+3i)
          </p>
          <p className="calc-currOp">
            -8+19i
          </p>
        </div>
        <div className="buttons">
          {theButtons.map( (e,i) => {
            if (i===0 || i===4) return <button className='CalcButton sides top' key={i}>{e}</button>
            if (i===20 || i===24) return <button className='CalcButton sides bottom' key={i}>{e}</button>
            if (i%5===0 || i%5 === 4) return <button className='CalcButton sides' key={i}>{e}</button>
            else return <button className='CalcButton' key={i}>{e}</button>
          })}
        </div>
      </div>
      
    </div>
  )
}

export default App
