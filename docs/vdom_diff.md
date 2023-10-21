#### 前言
会贴一部分代码和截图方便理解，但是代码太多不会全部贴上，有需要的同学可以直接上github上 [源码demo](https://github.com/forturegrant/mini-react) 跑起来慢慢食用
#### 虚拟DOM
我们都知道react的入口文件都是类似这样的

```js
import React from 'react';
import { ReactDOM } from "../../reactCode/react";


export default class App extends React.Component {
    render() {
        return <div>
            <div className='header'>222</div>
        </div>
    }
}


ReactDOM.render(<App />, document.getElementById('root'));
```
今天我们就来一步步实现ReactDOM.render，一步步来看看react的核心源码实现属于我们自己的react

我们先实现react的虚拟DOM，react使用的jsx是利用babel编译成React.createElement之后，再由js执行React.createElement生成虚拟DOM

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7bdd56b5b184e8385e2e09482922178~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1242&h=622&s=123398&e=png&b=2e2e2b)

这里先**实现下React.createElement**

```reactCode/react.js
import { REACT_ELEMENT_TYPE } from "./ReactSymbols";

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
}

/**
 * 创建虚拟DOM
 * @param {*} type 元素的类型
 * @param {*} config 配置对象
 * @param {*} children 第一个儿子，如果有多个儿子的话会依次放在后面
 */

function createElement(type, config, children) {
  let propName;
  const props = {};
  let key = null;
  let ref = null;
  if (config) {
    if (config.key) {
      key = config.key;
    }
    if (config.ref) {
      ref = config.ref;
    }
    for (propName in config) {
      if (!RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = new Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE, // 类型是一个React元素
    type,
    ref,
    key,
    props
  }
};

const React = {
  createElement
};

export default React;
```
然后在这里打印下

```index.js
import React from './reactCode/React';
import ReactDOM from './reactCode/ReactDOM';

let element = (
  <div key="title" id="title">title</div>
)

console.log(element);
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01525f10ca504a659c2d460fdbf5ff6a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=944&h=220&s=40413&e=png&b=ffffff)

可以看到这里打印出来我们需要的虚拟DOM的结构

首先我们要先搞懂react16的fiber架构是怎样的，fiber架构是 React在16以后引入的，之前是直接递归渲染vdom，现在则是多了一步vdom（vdom即是虚拟DOM，后面都简称vdom）转fiber的reconcile，dom diff也是用新的vdom和老的fiber树去对比，然后生成的fiber树，那fiber树的结构是怎样的，可以看下面这个图

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f3e3cbcb1e2f499f9757035bf92e1587~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=649&h=464&s=92812&e=png&b=f7f7f7)

fiberTree都有一个根节点rootFiber，父节点的child是子节点，子节点的return是兄弟节点

那么react是如何构建一个新的fiber树呢，流程大概如下

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e28b0ae39394940acbec4091b152834~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=694&h=513&s=107819&e=png&b=f9f9f6)

当一个节点没有子节点了，他就走completework，然后找右边的兄弟元素，兄弟元素没有子节点也走completework，直到所有兄弟元素走完completework就回到父节点，父节点走completework

看一个更复杂的例子

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/316a030608b0496594c8714d6a69aefb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=663&h=343&s=150683&e=png&b=f7f6f6)

大概就是这么一个流程

那我们再来仔细看看fiber tree的具体结构，fiberRootNode其实就是我们的root容器，它的current指向fiber tree 的根节点rootFiber，rootFiber的stateNode则指向我们的root容器

在`React`中最多会同时存在两棵`Fiber树`。当前屏幕上显示内容对应的`Fiber树`称为`current Fiber树`，正在内存中构建的`Fiber树`称为`workInProgress Fiber树`。

`current Fiber树`中的`Fiber节点`被称为`current fiber`，`workInProgress Fiber树`中的`Fiber节点`被称为`workInProgress fiber`，他们通过`alternate`属性连接。

即当`workInProgress Fiber树`构建完成交给`Renderer`渲染在页面上后，应用根节点的`current`指针指向`workInProgress Fiber树`，此时`workInProgress Fiber树`就变为`current Fiber树`。

每次状态更新都会产生新的`workInProgress Fiber树`，通过`current`与`workInProgress`的替换，完成`DOM`更新。

这里`workInProgress Fiber树`其实就是通过对比老的`current Fiber树`和`新的虚拟DOM diff`出来生成的

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8de53e3704db446a92773c6c3a5c7b68~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1100&h=646&s=452887&e=png&b=fcfbfb)

那我们就来一步步实现吧，直接开始实现ReactDOM.render

```index.js
import React from './reactCode/React';
import ReactDOM from './reactCode/ReactDOM';

let element = (
  <div key="title" id="title">title</div>
)

ReactDOM.render(element, document.getElementById('root'));

```

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2403fde6422a4f84a9371e1795b66794~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=745&h=398&s=88303&e=png&b=fbfbfb)

首先会创建fiberRootNode和hostRootFiber，然后将fiberRootNode的current指向hostRootFiber，在第一次渲染的时候，其实react就已经开始使用双缓存树了，先建一个current tree，这个tree上只有hostRootFiber这个根节点，然后再从hostRootFiber的updateQuene里面拿到真正要渲染的部分，就是`<div key="title" id="title">title</div>`

**也就是说，react在第一次渲染的时候就使用双缓存树，利用新的vDOM和老的current tree 去 dom diff生成 workInProgress tree**

当第一次渲染结束之后就会变成这样

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5f6f7453ad74908aa2791c074b13338~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1100&h=646&s=450096&e=png&b=fcfbfb)

然后此时开始进行下图的流程

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5d2599aac204ea391c249d0d35c9baa~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1952&h=1182&s=523351&e=png&b=f8f8f8)

这是更加仔细的流程

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/291bef035d5848fb91586f11f0310957~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=230&h=234&s=57488&e=png&b=fbf9f9)

来看下具体代码的实现吧

代码实在有点多，感兴趣的可以直接跳到 https://github.com/forturegrant/mini-react

里面有全部代码的实现

```reactCode/reactDOM.js
import { createHostRootFiber } from './ReactFiber';
import { updateContainer } from './ReactFiberReconciler';
import { initializeUpdateQuene } from './ReactUpdateQuene';

// ReactDom.render 开始把虚拟dom渲染到容器中
function render(element, container) {
  let fiberRoot = container._reactRootContainer;
  if (!fiberRoot) {
    fiberRoot = container._reactRootContainer = createFiberRoot(container);
  }
  updateContainer(element, fiberRoot);
}

export const ReactDOM = {
  render
};

// createFiberRoot  创建fiberRootNode（真实dom，id = 'root'）和hostRootFiber（stateNode指向fiberRootNode）

function createFiberRoot(containerInfo) {
  const fiberRoot = { containerInfo }; // fiberRoot指的就是容器对象containerInfo  div#root
  const hostRootFiber = createHostRootFiber(); // 创建fiber树的根节点   这两个对应上面说的
  // 当前fiberRoot的current指向这个根fiber
  // current当前的意思，它指的是当前跟我们页面中真实dom相同的fiber树
  fiberRoot.current = hostRootFiber;
  // 让此根fiber的真实节点指向fiberRoot div#root  stateNode就是指真实dom的意思
  hostRootFiber.stateNode = fiberRoot;
  initializeUpdateQuene(hostRootFiber);
  return fiberRoot;
}

export * from './ReactFiberHooks';
```

reactFiber代码里主要是创建了fiber这种数据结构，react16的fiber架构就是基于fiber节点实现的

```reactCode/reactFiber.js
import { NoFlags } from './ReactFiberFlags';
import { FunctionComponent, HostComponent, HostRoot } from './ReactWorkTags';

export function createHostRootFiber() {
  return createFiber(HostRoot);
}

/**
 * 创建fiber节点
 * @date 2023-04-24
 * @param {any} tag  fiber的标签  HostRoot指的是根结点（HostRoot的tag是3，对应的真实dom节点 div#root）  HostComponent（tag是5，例如div，span）
 * @param {any} pendingProps  等待生效的属性对象
 * @param {any} key
 * @returns {any}
 */
function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key);
}

function FiberNode(tag, pendingProps, key) {
  this.tag = tag;
  this.pendingProps = pendingProps;
  this.key = key;
}

export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (!workInProgress) {
    workInProgress = createFiber(current.tag, pendingProps, current.key)
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
  }
  workInProgress.flags = NoFlags;
  workInProgress.child = null;
  workInProgress.sibling = null;
  workInProgress.updateQuene = current.updateQuene;
  workInProgress.firstEffect = workInProgress.lastEffect = workInProgress.nextEffect = null;
  return workInProgress;
}

/**
 * 根据虚拟DOM元素创建fiber节点
 * @param {*} element
 * @returns
 */
export function createFiberFromElement(element) {
  const { key, type, props } = element;
  let tag;
  if (typeof type === 'string') { // span div p
    tag = HostComponent; // 标签等于原生组建
  }
  if (typeof type === 'function') {
    tag = FunctionComponent;
  }
  const fiber = createFiber(tag, props, key);
  fiber.type = type;
  return fiber;
}

```
#### DOM diff

接下来重点讲一下**dom diff**的过程

dom diff可以说是react源码里面最重要的部分了

我们举个例子再从代码里一步步分析react是如何进行dom diff的吧

react diff算法分为两种情况

##### 新的vDOM是单个节点

我们先说说单个节点的情况，上面我们已经实现了**ReactDOM.render**，但我们还没实现setState或者hook useState，没有办法通过这两个办法去触发更新，但是其实**ReactDOM.render和setState/useState后面的逻辑是差不多的**，都是生成新的vDOM去和老的fiber tree进行dom diff生成新的fiber tree，我们就还是用ReactDOM.render去触发更新

这里先直接在html里写入两个按钮，一个负责初次渲染，一个负责更新

```index.html
<body>
    <div id="root">
        <!-- app -->
    </div>
    <div>
        <button id="single1">1.key相同，类型相同，数量相同</button>
        <button id="single1Update">复用老节点，只更新属性</button>
    </div>
</body>
```
然后监听事件

```index.js
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

```
这里我们点击onClick，我们看看控制台打印了什么

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbf066478d8f482da3e2f1da12987fdd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1025&h=693&s=57846&e=png&b=ffffff)

打印出来了一个**effectList**和根节点的结构

这里的**effectList**是什么，每次react重新渲染的时候（包括第一次mounted，从前面我们知道mounted也会走dom diff的流程），然后dom diff的结果会以链表的形式存在根节点上，就是这个**firstEffect**，那这个**effectList**是怎么形成的，effects是通过nextEffect自下而上拼接起来的一个链表，然后react再去根据这个链表是进行对应的dom操作（其实就是我们常说的commit操作），其实就是在上面的workLoopSync结束之后，进行commitMutationEffects

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3a5297622dd4cc1bc1a174c23dfbc40~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=720&h=358&s=86508&e=png&b=f8f8f6)

上面的render之后可以看到我们打印出来的**插入#div#title  effectsList**，这时候react就会根据我们的flags去进行对应的dom操作，可以看到react给这些标识都行了二进制的处理

```ReactFiberWorkLoop.js
function getFlags(flags) {
  switch (flags) {
    case Placement:
      return '插入';
    case Update:
      return '更新';
    case PlacementAndUpdate:
      return '移动';
    case Deletion:
      return '删除';
    default:
      break;
  }
}

export const NoFlags = /*                      */ 0b0000000000000000000000000000;// 二进制0  没有动作
export const Placement = /*                    */ 0b0000000000000000000000000010;// 二进制2  添加或者创建挂载
export const Update = /*                       */ 0b0000000000000000000000000100;// 二进制4  更新
export const PlacementAndUpdate = /*           */ 0b0000000000000000000000000110;// 二进制6  移动
export const Deletion = /*                     */ 0b0000000000000000000000001000;// 二进制8  删除

```
那我们点击update按钮来看看，可以看到更新了dom，effectList也发生了改变，flags变成了4，是update

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2501bce8ff644e0587bc5acc69354de3~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=903&h=738&s=63615&e=png&b=ffffff) 

那这里如果新的vDOM只有一个节点他到底是怎么进行dom diff的呢

比较简单，如果是新的虚拟dom是单个节点，那就是直接去老的fiber里遍历，如果key相同，type相同，就搭上update标签，删掉其他的，如果key不同，继续找下一个，如果都不相同，那就全部删掉，自己新增一个

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/96cfc4676436458c869055663c8ae1eb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=589&h=260&s=24999&e=png&b=202020)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dcbc188cc9324036ba4b0975af85f1f5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=983&h=739&s=70223&e=png&b=ffffff)

这里我把key改成不同的，可以看到，如果key不同，就直接删掉，然后新增了一个

##### 新的vDOM是多个节点
    
多节点的情况比较复杂，我们还是通过代码来看效果

```index.js
import React from './reactCode/React';
import { ReactDOM } from './reactCode/ReactDOM';

const single1 = document.getElementById('single1');
const single1Update = document.getElementById('single1Update');

const single2 = document.getElementById('single2');
const single2Update = document.getElementById('single2Update');

single1.addEventListener('click', () => {
  let element = (
    <div key="title" id="title">title</div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

single1Update.addEventListener('click', () => {
  let element = (
    <div key="title2" id="title2">title2</div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

single2.addEventListener('click', () => {
  let element = (
    <ul key="ul1">
      <li key="A">A</li>
      <li key="B">B</li>
      <li key="C">C</li>
      <li key="D">D</li>
      <li key="E">E</li>
      <li key="F">F</li>
    </ul>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

single2Update.addEventListener('click', () => {
  let element = (
    <ul key="ul1">
      <li key="A">A</li>
      <li key="C">C</li>
      <li key="E">E</li>
      <li key="B">B</li>
      <li key="G">G</li>
      <li key="D">D</li>
    </ul>
  )
  ReactDOM.render(element, document.getElementById('root'));
})

// ReactDOM.render(element, document.getElementById('root'));

```

我们加多两个按钮来模拟多节点diff的情况

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1fad12231594e15b157ea3ecdc71e87~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=985&h=570&s=81587&e=png&b=ffffff)

可以看到这里打印出来的effectList，这里我们再来仔细讲讲多节点dom diff的流程是怎么样的

**如果新的虚拟dom是多个节点，那就先进入第一轮遍历，遍历的时候一一对应，如果不能复用，就立马跳出第一轮循环，进入第二轮循环，将剩余的老fiber放入一个以老fiberkey或者索引为key，value为fiber节点的Map中，然后遍历新dom到map中去找有没有可以复用的节点，
找到了就看这个节点的索引值是否大于lastplaceIndex，如果大就把lastplaceIndex置为这个fiber的索引，然后从map中删除该节点，如果小于lastPlaceIndex，就打上移动的标签**

lastPlaceIndex这个索引值，其实说的有点复杂，其实可以理解为老的fiber就只能往右移，并不会像左移动，像这个例子移动的只有B和D，C并不会往左移动，但是实现是通过lastPlaceIndex来实现的

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae86a78d9780465d9c9db09c90305eee~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=758&h=387&s=239674&e=png&b=fbfbfb)

再看一个例子，比如现在老fiber是 C=>B=>A 的结构，但是新DOM是A=>C>=B，那节点应该是怎么移动的

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/765f996e7faf4be9940575d70edd9537~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=831&h=547&s=80810&e=png&b=fefefe)

答案是移动C再移动B，其实最佳的方案应该是直接移动A到最前面就只用移动一个节点，但是由于react的 diff 设计如此，react diff 的时候就是单侧的，vue 的 dom diff就不是单侧的，而是双侧的，效率会更高，这里就不发散了，有兴趣的同学可以去了解下vue的dom diff。

这里同学们肯定还有一个疑问，为什么这里显示的是 **插入** 而不是 **移动** ，这是因为react在最后处理真实dom的时候使用了[node.appendChild](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild) 或者 [node.insertBefore](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore) ，这两个api **方法在插入节点的时候，如果给定的子节点是对文档中现有节点的引用，会将其从当前位置移动到新位置，不用重新创建一个节点，这就巧妙的达到了移动的效果，同时需要重新创建节点时候也是用这个api，也就是说这两个方法实现了移动的效果，react就不用去处理移动的问题**

所以react源码中只有需要更新且插入节点的时候，才会标记为移动，
移动（不需要更新的移动）和插入共用Placement这个标识

```js
function getFlags(flags) {
  switch (flags) {
    case Placement:
      return '插入';
    case Update:
      return '更新';
    case PlacementAndUpdate:
      return '移动';
    case Deletion:
      return '删除';
    default:
      break;
  }
}
```

#### 总结
大概就讲到这里，主要内容还是讲了react大概的实现和dom diff，主要就讲了ReactDOM.render的实现，setState 和 hooks 的知识也没讲到，还有调度机制lane也没有讲，后面也会继续更新hooks相关的内容
