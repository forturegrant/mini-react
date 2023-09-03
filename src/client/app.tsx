import React from 'react';
import './index.less';
import Father from './useImperativeHandle';
import Test from './useReducer';
import Forward from './forwardRef';

export default class App extends React.Component {
    render() {
        return <div>
            <div className='header'>222</div>
            <Father />
            <Forward />
            <Test />
        </div>
    }
}
