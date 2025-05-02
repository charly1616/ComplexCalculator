import { use, useState } from 'react'
import './App.css'
import CalcButton from './CalcButton';

const buttons = [
  "|x|", "AC", "i", "+/-", "/",
  "√x", "7", "8", "9", "x",
  "Ln", "4", "5", "6", "-",
  "^", "1", "2", "3", "+",
  "↩", "DEL", "0", ".", "="
];

function addNumbers(seq){
  let ans = [seq[0]]
  for (let j = 1; j < seq; j++){
    for (let i = 0; i < ans.length; i++){
      let u = seq[j].addNumber();
      if (u) {
        ans[i] = u
        break;
      } else {
        ans.push(seq[j])
      }
    }
  }
  return ans
}

class CNumber {
  constructor (num, i=false, positive=true){
    this.num = num;
    this.i = i;
    this.positive = positive;
  }

  addDigit(dig){
    if (dig === '.' && this.num.includes('.')) return false;
    this.num += dig;
    return true;
  }

  removeDigit(){
    this.num = this.num.slice(0,-1);
    return this.num.length > 0;
  }

  addNumber(num){
    if (this.i !== num.i) return false
    let ans = (num.positive ? 1 : -1) * parseFloat(num.num) + (this.positive ? 1 : -1) * parseFloat(this.num);
    return new CNumber(Math.abs(ans).toString(), this.i ,ans >= 0);
  }

  toString(){
    return this.num + (this.i ? 'i' : '')
  }
}


function App() {
  const [theButtons] = useState(buttons);
  
  const [lastOperation, setLastOperation] = useState('(1+4i) x (4+3i)');
  const [pastOperations, setPastOperations] = useState([])
  const [operationPool, setOperationPool] = useState([new CNumber('')])

  const [operated, setOperated] = useState(false)


  const [op, setOp] = useState('0')

  const handleAddDig = (e) => {
    operationPool[operationPool.length -1].addDigit(e);
    console.log(operationPool)
    handleShow()
  }

  const handleRemDig = () => {
    if (operationPool[operationPool.length -1] instanceof  CNumber){
      operationPool[operationPool.length -1].removeDigit()
      if (operationPool[operationPool.length -1].num === '' && operationPool.length > 1) setOperationPool(prev => prev.slice(0, -1));
    }
    else setOperationPool(operationPool.slice(0,-1))

    handleShow()
  }

  const handleShow = () => {
    let te = (operationPool[0].positive ? '' : '-') + operationPool[0].toString()
    for (let i = 1; i < operationPool.length; i++){
      if (operationPool[i].num !== '') te += (operationPool[i].positive) ? '+' : '-';
      te += operationPool[i].toString();
    }
    if (te === '') te = '0'
    setOp(te);
  }

  const handleNewNum = (positive) => {
    setOperationPool(prev => [...prev, new CNumber('', false, positive)]);
    console.log('added num')
    handleShow();
  }




  return (
    <div className="backg">
      <div className="calc">
        <div className="calc-ans">
          <p className="calc-prevOp">
            {lastOperation}
          </p>
          <p className="calc-currOp">
            {op}
          </p>
        </div>
        <div className="buttons">
          {theButtons.map( (e,i) => {
            let func = 'oo';
            if ((e >= '0' && e <= 9) || e == '.') func = ()=>handleAddDig(e);
            if (e === 'i') func = () => {
              operationPool[operationPool.length -1].i = !operationPool[operationPool.length -1].i;
              handleShow();
            } //Switch last imaginary
            if (e === '+/-') func = () => {
              operationPool[operationPool.length -1].positive = !operationPool[operationPool.length -1].positive;
              handleShow();
            } //Switch last sign
            if (e === "-" || e === "+") func = () => {handleNewNum(e === "+");}
            if (e==='DEL') func = ()=> {handleRemDig()};
            if (e==='AC') func = ()=>{setOperationPool([new CNumber('')]); handleShow()}
            

            if (i===0 || i===4) return <CalcButton className='CalcButton sides top' key={i} text={e} onClick={func} disabled={func==='oo'}/>
            if (i===20 || i===24) return <CalcButton className='CalcButton sides bottom' key={i} text={e} onClick={func} disabled={func==='oo'}/>
            if (i%5===0 || i%5 === 4) return <CalcButton className='CalcButton sides' key={i} text={e} onClick={func} disabled={func==='oo'}/>
            else return <CalcButton className='CalcButton' key={i} text={e} onClick={func} disabled={func==='oo'}/>
          })}
        </div>
      </div>
      
    </div>
  )
}

export default App
