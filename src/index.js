import React from './reactCode/React';
import { ReactDOM } from './reactCode/ReactDOM';
import { useReducer } from './reactCode/ReactFiberHooks';

const single1 = document.getElementById('single1');
const single1Update = document.getElementById('single1Update');

const single2 = document.getElementById('single2');
const single2Update = document.getElementById('single2Update');

const single3 = document.getElementById('single3');

single1.addEventListener('click', () => {
  let element = (
    <div key="title" id="title">title</div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

single1Update.addEventListener('click', () => {
  let element = (
    <div key="title" id="title2">title2</div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

// single2.addEventListener('click', () => {
//   let element = (
//     <ul key="ul">
//       <li key="A">A</li>
//       <li key="B" id="b">B</li>
//       <li key="C">C</li>
//       <li key="D">D</li>
//       <li key="E">E</li>
//       <li key="F">F</li>
//     </ul>
//   )
//   ReactDOM.render(element, document.getElementById('root'));
// })

// single2Update.addEventListener('click', () => {
//   let element = (
//     <ul key="ul">
//       <li key="A">A</li>
//       <li key="C">C</li>
//       <li key="E">E</li>
//       <li key="B" id="b2">B2</li>
//       <li key="G">G</li>
//       <li key="D">D</li>
//     </ul>
//   )
//   ReactDOM.render(element, document.getElementById('root'));
// })

single2.addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="C">C</li>
      <li key="B">B</li>
      <li key="A">A</li>
    </ul>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

single2Update.addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="C">C</li>
      <li key="B">B</li>
    </ul>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

function Test() {
  const [count, setCount] = useReducer((x) => x + 1, 0);
  return <button key="title2" id="title2" onClick={() => setCount(count + 1)}>{count}</button>
}

single3.addEventListener('click', () => {
  let element = (
    <div key="title">
      <div key="title1" id="title">title3</div>
      <Test />
    </div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

// ReactDOM.render(element, document.getElementById('root'));
