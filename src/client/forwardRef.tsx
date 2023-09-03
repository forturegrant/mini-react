// @ts-nocheck
import React, { Component } from 'react';
// class Child extends Component {
//     constructor() {
//         super();
//     }
//     componentDidMount() {
//     }
//     render() {
//         return (
//             <div ref={this.props.myRef}>子组件</div>
//         )
//     }
// }
class Parent extends Component {
    constructor() {
        super();
        this.myChild = React.createRef();
        // this.myChild = null;
    }
    componentDidMount() {
        console.log(this.myChild);//获取的是Child组件
        // console.log(this.myChild.current);//获取的是Child组件
    }
    render() {
        return <Child
            ref={this.myChild} // 使用forwardRef转发还只能使用ref属性名来透传...              
        // myRef={el => this.myChild = el}
        />
    }
}


// class组件的Ref其实是可以通过props透传的, 可以通过createRef，也可以通过回调函数
// 但是createRef要通过current来访问，回调函数直接访问就行了


// 默认情况下，你不能在函数组件上使用 ref 透传（还是可以用ref, 只要它指向一个 DOM 元素或 class 组件），因为它们没有实例
// 想用的话只能用 forwardRef 或者换成class Component
// 把上面的child换成函数组件，就只能用forwardRef
// 使用forwardRef转发还只能使用ref属性名来透传...  
const Child = React.forwardRef((props, ref) => {
    return <div ref={ref}>子组件</div>
})

export default Parent;
