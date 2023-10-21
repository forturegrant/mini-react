#### 前言

先看看react大概是怎么实现的朋友们可以想看看上文 [react的基本实现](https://juejin.cn/post/7278305453599096893)

代码地址在这里 [mini-react](https://github.com/forturegrant/mini-react)

#### hook原理

上文我们讲了react的虚拟dom实现和diff算法，还讲了React触发更新的整个过程，这一篇就继续讲一下关于hooks的内容

我们先来看看我们日常使用hooks的是怎么使用的

我们还是沿用上篇文章的代码继续展开

同样的我们在html里面加上一个button并点击按钮渲染对应的内容

```index.html
<body>
  <div id="root"></div>
  <div>
    <button id="single1">1.单节点diff</button>
    <button id="single1Update">更新</button>
  </div>

  <div>
    <button id="single2">2.多节点diff</button>
    <button id="single2Update">更新</button>
  </div>

  <div>
    <button id="single3">3.多节点diff</button>
    <button id="single3Update">3.更新</button>
  </div>

  <div>
    <button id="single4">4.hooks</button>
  </div>
<body>
```
```index.js
function Test() {
  const [count, setCount] = useReducer((x) => x + 1, 0);
  const [count2, setCount2] = useState(0);
  return <div>
    <button key="title2" id="title2" onClick={() => setCount(count + 1)}>{count}</button>
    <button onClick={() => setCount2(count2 + 1)}>{count2}</button>
  </div>
}

single4.addEventListener('click', () => {
  let element = (
    <div key="title">
      <div key="title1" id="title">title3</div>
      <Test />
    </div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})
```
点击之后

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4d13a473a3d4444a11b71b11872644d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=897&h=1035&s=182407&e=png&b=ffffff)

可以看到这里我们渲染出来了对应的function Test里面的内容，**而且我们新的fiber tree上面有了这个function对应的fiber节点，fiber节点上面有一个memorizedState属性，这个属性里面存储了一个通过next链接的单向链表**，这就是我们写的useReducer和useState的状态，第一个 **memorizedState：0** 对应的useReducer的 0，**而next中memorizedState存的则是useState的0**，这里我们先不展开讲useReducer和useState的实现原理（后面会讲到），这里我们先讲hooks到底是什么样的结构，并且hooks的信息是怎么存储到fiber节点上的

大概实现是这样的

```ReactFiberHooks.js
function updateWorkInProgressHook() {
  let hook;

  const current = currentlyRenderingFiber.alternate;

  if (current) {
    // 更新，复用老hook，在老的基础上更新
    currentlyRenderingFiber.memoizedState = current.memoizedState;

    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next;
    } else {
      hook = workInProgressHook = currentlyRenderingFiber.memoizedState;
    }
  } else {
    // 初次渲染，从0创建hook
    hook = {
      memorizedState: null,
      next: null
    };
    // 把hook挂到fiber上
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // hook0
      workInProgressHook = currentlyRenderingFiber.memoizedState = hook;
    }
  }

  return hook;
}
```

遇到第一个hooks useReducer，**看看fiber里有没有 memorizeState，没有就建一个 { memorizeState: 0, next: null }，然后将这个对象赋值给workInProgressHook和对应的fiber节点（即代码中的currentlyRenderingFiber）的memorizedState，此时workInProgressHook = currentlyRenderingFiber = { memorizeState: 0, next: null }**，到了第二hooks useState，因为fiber里已经有memorizeState了，就直接workInProgressHook的next变成 { memorizeState: 1, next: null }，然后同时将next赋值给workInProgressHook，因为对象引用的关系，currentlyRenderingFiber上的memorizeState也会一起变化，所以workInProgressHook总是会指向最后一个hooks，**所以不管一个函数组件有多少个hook，我们都可以通过workInProgressHook来把最新的hook添加到尾部（因为是链表，如果是数组我们可以直接push到尾部），而不用从头开始找到最后**

#### hook实现

##### useState & useReducer

为什么要把useState和useReducer放在一起讲呢，因为useState其实就是用useReducer实现的

我们继续接着上面的例子，我们写了一个函数组件Test

```index.html
<body>
  <div id="root"></div>
  <div>
    <button id="single1">1.单节点diff</button>
    <button id="single1Update">更新</button>
  </div>

  <div>
    <button id="single2">2.多节点diff</button>
    <button id="single2Update">更新</button>
  </div>

  <div>
    <button id="single3">3.多节点diff</button>
    <button id="single3Update">3.更新</button>
  </div>

  <div>
    <button id="single4">4.hooks</button>
  </div>
<body>
```
```index.js
function Test() {
  const [count, setCount] = useReducer((x) => x + 1, 0);
  const [count2, setCount2] = useState(0);
  return <div>
    <button key="title2" id="title2" onClick={() => setCount(count + 1)}>{count}</button>
    <button onClick={() => setCount2(count2 + 1)}>{count2}</button>
  </div>
}

single4.addEventListener('click', () => {
  let element = (
    <div key="title">
      <div key="title1" id="title">title3</div>
      <Test />
    </div>
  )
  ReactDOM.render(element, document.getElementById('root'));
})
```
点击之后按钮 4.hooks 之后可以看到我们的两个按钮渲染了出来，（想知道点击按钮按钮 4.hooks 之后是如何渲染出dom的，可以看文章开头写到的上文 [react的基本实现](https://juejin.cn/post/7278305453599096893) ），按钮的值也是useState和useReducer的初始值

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4d13a473a3d4444a11b71b11872644d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=897&h=1035&s=182407&e=png&b=ffffff)

那我们接下来就开始先实现useReducer

按照我们上面对hook基本原理的了解，当遇到第一个hooks useReducer时，**看看fiber里有没有 memorizeState，没有就建一个 { memorizeState: 0, next: null }，然后将这个对象赋值给workInProgressHook和对应的fiber节点（即代码中的currentlyRenderingFiber）的memorizedState，此时workInProgressHook = currentlyRenderingFiber = { memorizeState: 0, next: null }**，下面我们实现这个逻辑

```ReactFiberHooks.js
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';
import { isFn } from './utils';
let currentlyRenderingFiber = null;
let workInProgressHook = null;

// todo 获取当前hook
function updateWorkInProgressHook() {
  let hook;

  const current = currentlyRenderingFiber.alternate;

  if (current) {
    // 更新，复用老hook，在老的基础上更新
    currentlyRenderingFiber.memoizedState = current.memoizedState;

    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next;
    } else {
      hook = workInProgressHook = currentlyRenderingFiber.memoizedState;
    }
  } else {
    // 初次渲染，从0创建hook
    hook = {
      memorizedState: null,
      next: null
    };
    // 把hook挂到fiber上
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // hook0
      workInProgressHook = currentlyRenderingFiber.memoizedState = hook;
    }
  }

  return hook;
}

// 函数组件执行的时候
export function renderHooks(workInProgress) {
  currentlyRenderingFiber = workInProgress;
  workInProgressHook = null;
}

export function useReducer(reducer, initialState) {
  const hook = updateWorkInProgressHook();
  if (!currentlyRenderingFiber.alternate) {
    // 初次渲染
    hook.memorizedState = initialState;
  }
  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    hook,
    reducer
  );
  return [hook.memorizedState, dispatch];
}

function dispatchReducerAction(
  fiber,
  hook,
  reducer,
  action
) {
  // 兼容了 useReducer 和 useState
  hook.memorizedState = reducer
    ? reducer(hook.memorizedState, action)
    : isFn(action)
      ? action()
      : action;
  // 当前函数组件的fiber
  scheduleUpdateOnFiber(fiber);
};
```
可以看到我们在执行useReducer时，先通过**updateWorkInProgressHook**这个方法成功在fiber添加了我们想要的**memorizeState链表**，然后就是实现**useReducer**的逻辑了，其实就是**dispatchReducerAction**这个方法，可以看到这个方法并没有实现什么太多的逻辑，他只是把hooks上的memorizedState更新了一下，**然后执行scheduleUpdateOnFiber这个方法带上当前函数组件的fiber**，就开始执行**react diff的过程去更新dom tree而已**。（这里想了解scheduleUpdateOnFiber是怎么实现的，可以看文章开头写到的上文 [react的基本实现](https://juejin.cn/post/7278305453599096893)，**scheduleUpdateOnFiber这个方法不管如何更新，不管谁来更新，都会调度到这个方法里**）

简单实现完useReducer之后我们就可以开始点击这个按钮，可以看到按钮的值一直在改变

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2113a0c252f645c99f6b5b87cf0ebeac~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=892&h=728&s=40427&e=png&b=fefefe)

这样我们的useReducer就实现了

不过这里我们是使用button点击之后改变状态的，react是有一套属于自己的事件机制的，实现起来比较复杂，所以我们这里就稍微简单粗暴一下监听了一下事件的触发，如果属性是on开头，那就直接绑定事件

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff0e97d82e604f1db90116e7067e19d4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=603&h=379&s=45667&e=png&b=1f1f1f)

然后我们再实现一下useState，上面也说过useState其实就是useReducer实现的

```ReactFiberHooks.js
export function useState(initialState) {
  return useReducer(null, initialState);
}
```
#### 总结

大概就讲到这里，主要内容还是讲了react hook的原理和实现，还很简单的实现了一下useState和useReducer，有兴趣的同学可以直接看仓库 [mini-react](https://github.com/forturegrant/mini-react)


