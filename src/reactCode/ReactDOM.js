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