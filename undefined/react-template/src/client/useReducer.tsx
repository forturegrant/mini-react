// @ts-nocheck
import React, { useReducer, useContext, createContext } from 'react';

const initialState = {
    count: 0
}
const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
        case 'increment':
            return {
                ...state,
                count: state.count + payload,
            }
        case 'decrement':
            return {
                ...state,
                count: state.count - payload,
            }
        default:
            break;
    }
}

const CountContext = createContext({});

const GrandFather = () => {
    const [count, dispatch] = useReducer(reducer, initialState);
    return <CountContext.Provider value={{ count, dispatch }}>
        <Father />
    </CountContext.Provider>
}

const Father = () => {
    return <Child />
}

const Child = () => {
    const { count, dispatch } = useContext(CountContext);
    return <div>
        {count.count}
        <button onClick={() => dispatch({ type: 'increment', payload: 1 })}>增加</button>
        <button onClick={() => dispatch({ type: 'decrement', payload: 1 })}>减少</button>
    </div>
}

export default GrandFather;