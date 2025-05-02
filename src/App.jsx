import { use, useEffect, useState } from 'react'
import './App.css'
import CalcButton from './CalcButton';

const buttons = [
  "|x|", "AC", "i", "+/-", "/",
  "√x", "7", "8", "9", "x",
  "Ln", "4", "5", "6", "-",
  "^", "1", "2", "3", "+",
  "↩", "DEL", "0", ".", "="
];

function Simplify(seq){
  if (!(seq instanceof Array)) return [new CNumber('0',false, true)]
  let is = new CNumber('0',true, true);
  let real = new CNumber('0',false, true);

  let op = null;

  let rightSide = null;

  for (let j = 0; j < seq.length; j++){
    if (!(seq[j] instanceof CNumber)){
      op = seq[j]
      rightSide = Simplify(seq.slice(j+1,seq.length))
      break;
    }
    if (seq[j].i){
      let v = is.addNumber(seq[j])
      is = v
    } else {
      let v = real.addNumber(seq[j])
      real = v
    }
  }

  if (op instanceof OneNumOp){
    return op.operate([is, real])
  } else if (op !== null){
    return op.operate([is, real], rightSide)
  }

  return [real, is]
}

function operationToString(seq){
  if (seq.length < 1) return new CNumber('0', false, true)
  let te = (seq[0].positive ? '' : '-') + seq[0].CtoString()
  let op = null;
  let rightSide = null;
  for (let i = 1; i < seq.length; i++){
    if (!(seq[i] instanceof CNumber)){
      op = seq[i]
      rightSide = operationToString(seq.slice(i+1,seq.length))
      break;
    }
    te += (seq[i].positive) ? '+' : '-';
    te += seq[i].CtoString();
  }
  if (op instanceof OneNumOp){
    return op.wrap('('+te+')')
  } else if (op !== null){
    return op.wrap('('+te+')', (rightSide? '('+rightSide+')' : ''))
  }

  return te
}



class OneNumOp{
  constructor (op){
    this.op = op;
  }

  operate(v){
    let simp = Simplify(v)
    if (!simp.some(a => a.i)) simp.push(new CNumber('0', true, true)) //Si no hay imaginario se añade
    if (!simp.some(a => !a.i)) simp.unshift(new CNumber('0', false, true)) //Si no hay real se añade

    const real = (n) => parseFloat(n[0].num) * (n[0].positive ? 1 : -1);
    const img = (n) => parseFloat(n[1].num) * (n[0].positive ? 1 : -1);
    const mod = (n) => Math.sqrt( Math.pow(real(n),2) + Math.pow(img(n),2))
    const arg = (n) => Math.atan2(img(n), real(n));
    switch (this.op){
      case '|x|':
        return [new CNumber(mod(simp).toString(), false, true)];
      case "√x": {
        let z = mod(simp)
        let r = real(simp)
        return [
          new CNumber(Math.sqrt((z+r)/2).toString(), false, true),
          new CNumber(Math.sqrt((z-r)/2).toString(), true, simp[0])
        ]
      };
      case "Ln": {
        let lnZ = Math.log(mod(simp))
        return [
          new CNumber(Math.abs(lnZ).toString(), false, lnZ>=0),
          new CNumber(arg(simp).toString(), true, true)
        ]
      }
    }
  }

  wrap(v){
    switch (this.op){
      case '|x|': return "|"+v+"|";
      case "√x": return "√"+v;
      case "Ln": return "Ln"+v
    }

  }
}

class TwoOpNum{
  constructor (op){
    this.op = op;
  }

  operate(v, d){
    let simp = Simplify(v)
    let dimp = Simplify(d)
    if (!simp.some(a => a.i)) simp.push(new CNumber('0', true, true)) //Si no hay imaginario se añade
    if (!simp.some(a => !a.i)) simp.unshift(new CNumber('0', false, true)) //Si no hay real se añade
    if (!dimp.some(a => a.i)) dimp.push(new CNumber('0', true, true)) //Si no hay imaginario se añade
    if (!dimp.some(a => !a.i)) dimp.unshift(new CNumber('0', false, true)) //Si no hay real se añade

    const real = (n) => parseFloat(n[0].num) * (n[0].positive ? 1 : -1);
    const img = (n) => parseFloat(n[1].num) * (n[0].positive ? 1 : -1);
    const mod = (n) => Math.sqrt( Math.pow(real(n),2) + Math.pow(img(n),2))
    const arg = (n) => Math.atan2(img(n), real(n));
    switch (this.op){
      case 'x':{
        const re = real(simp)*real(dimp) - img(simp)*img(dimp)
        const im = real(simp)*img(dimp) + img(simp)*real(dimp)
        return [
          new CNumber(Math.abs(re).toString(), false, re>=0),
          new CNumber(Math.abs(im).toString(), true, im>=0)
        ];
      }
        
      case '/': {
        const a = real(simp), b = img(simp);
        const c = real(dimp), d = img(dimp);
        const denominator = c * c + d * d;
    
        const re = (a * c + b * d) / denominator;
        const im = (b * c - a * d) / denominator;
    
        return [
          new CNumber(Math.abs(re).toString(), false, re >= 0),
          new CNumber(Math.abs(im).toString(), true, im >= 0)
        ];
      }
    
      case '^': {
        const c = real(dimp), d = img(dimp); // exponente

        const ln_r = Math.log(mod(simp));    // ln|base|
        const theta = arg(simp);             // arg(base)

        const realExp = c * ln_r - d * theta;
        const imagExp = d * ln_r + c * theta;

        const magnitude = Math.exp(realExp);
        let re = magnitude * Math.cos(imagExp);
        re = re.toFixed(8);
        let im = magnitude * Math.sin(imagExp);
        im = im.toFixed(8);

        return [
          new CNumber(Math.abs(re).toString(), false, re >= 0),
          new CNumber(Math.abs(im).toString(), true, im >= 0)
        ];
      }
    }
  }

  wrap(v, d){
    return v + this.op + d
  }
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
    console.log(typeof this.num)
    this.num = this.num.slice(0,-1);
    return this.num.length > 0;
  }

  addNumber(num){
    if (this.i !== num.i) return false;
    let ans = (num.positive ? 1 : -1) * parseFloat(num.num) + (this.positive ? 1 : -1) * parseFloat(this.num);
    return new CNumber(Math.abs(ans).toString(), this.i ,ans >= 0);
  }

  CtoString(){
    if (this.num === '') return '0'
    if (this.num === '1' && this.i) return 'i'
    return this.num + ((this.i) ? 'i' : '')
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
    if (!(operationPool[operationPool.length -1] instanceof CNumber)) return
    operationPool[operationPool.length -1].addDigit(e);
    console.log(Simplify(operationPool))
    handleShow()
  }

  const handleRemDig = () => {
    if (operationPool[operationPool.length -1] instanceof  CNumber){
      operationPool[operationPool.length -1].removeDigit()
      if (operationPool[operationPool.length -1].num === '' && operationPool.length > 1) setOperationPool(prev => prev.slice(0, -1));
    }
    else{
      setOperationPool(operationPool.slice(0,-1))
      setOperated(false)
    }
    handleShow()
  }

  const handleShow = () => {
    setOp(operationToString(operationPool));
  }

  const handleNewNum = (positive) => {
    setOperationPool(prev => [...prev, new CNumber('', false, positive)]);
    handleShow();
  }


  const handleFinishOp = () => {
    setPastOperations(prev => [...prev, operationPool])
    setLastOperation(operationToString(operationPool))
    let c = Simplify(operationPool).filter( e => e.num !== '' && e.num !== '0')
    setOperationPool(c)
    setOp(operationToString(c));
    setOperated(false)
  }

  const handleNewOneOperation = (e) => {
    if (operated) return;
    setLastOperation(operationToString([...operationPool, new OneNumOp(e)]))
    setPastOperations(prev => [...prev, [...operationPool, new OneNumOp(e)]])
    const ans = Simplify([...operationPool, new OneNumOp(e)]).filter( e => e.num !== '' && e.num !== '0')
    setOperationPool(ans)
    setOp(operationToString(ans));
    setOperated(false)
  }

  const handleNewTwoOperation = (e) => {
    if (operated) return;
    setOperationPool(prev => [...prev, new TwoOpNum(e), new CNumber('', false, true)]);
  }


  useEffect (()=>{
    setOp(operationToString(operationPool));
  }, [operationPool])




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
            if (e === '=') func = handleFinishOp
            if (['Ln', '|x|', '√x'].includes(e)) func = () => handleNewOneOperation(e);
            if (['x', '/','^'].includes(e)) func = () => handleNewTwoOperation(e);

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
