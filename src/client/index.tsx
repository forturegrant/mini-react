import React from 'react';
import { ReactDOM, useReducer } from "./reactCode/react";
//@ts-ignore

const single1 = document.getElementById('single1');
const single1Update = document.getElementById('single1Update');

const single2 = document.getElementById('single2');
const single2Update = document.getElementById('single2Update');

const single3 = document.getElementById('single3');
const single3Update = document.getElementById('single3Update');

const single4 = document.getElementById('single4');
const single4Update = document.getElementById('single4Update');

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

single2.addEventListener('click', () => {
    let element = (
        <div key="title" id="title">title</div>
    )
    ReactDOM.render(element, document.getElementById('root'));
})

single2Update.addEventListener('click', () => {
    let element = (
        <p key="title" id="title">title2</p>
    )
    ReactDOM.render(element, document.getElementById('root'));
})

function Test() {
    const [count, setCount] = useReducer((x) => x + 1, 0);
    return <button key="title2" id="title2" onClick={() => setCount(count + 1)}>{count}</button>
}

single3.addEventListener('click', () => {
    let element = (
        <div>
            <div key="title1" id="title">title3</div>
            <Test />
        </div>
    )
    ReactDOM.render(element, document.getElementById('root'));
})

single3Update.addEventListener('click', () => {
    let element = (
        <div key="title2" id="title">title</div>
    )
    ReactDOM.render(element, document.getElementById('root'));
})

single4.addEventListener('click', () => {
    let element = (
        <ul key="ul">
            <li key="A">A</li>
            <li key="B" id="B">B</li>
            <li key="C">C</li>
        </ul>
    )
    ReactDOM.render(element, document.getElementById('root'));
})

single4Update.addEventListener('click', () => {
    let element = (
        <ul key="ul" id="ul">
            <li key="B" id="B2">B2</li>
        </ul>
    )
    ReactDOM.render(element, document.getElementById('root'));
})
