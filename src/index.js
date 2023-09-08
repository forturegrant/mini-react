import React from './reactCode/React';
import { ReactDOM } from './reactCode/ReactDOM';

const single1 = document.getElementById('single1');
const single1Update = document.getElementById('single1Update');

single1.addEventListener('click', () => {
  let element = (
    <div key="title" id="title">title</div>
  )
  console.log(element, 'element');
  ReactDOM.render(element, document.getElementById('root'));
})

single1Update.addEventListener('click', () => {
  let element = (
    <div key="title" id="title2">title2</div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

// ReactDOM.render(element, document.getElementById('root'));
