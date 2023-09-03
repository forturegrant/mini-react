import { HostRoot, HostComponent, FunctionComponent } from './ReactWorkTags';
import { reconcileChildFibers, mountChildFibers } from './ReactChildFiber';
import { shouldSetTextContent } from './ReactDomHostConfig';
import { renderHooks } from './ReactFiberHooks';

export function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case FunctionComponent:
      return updateFunctionComponent(current, workInProgress);
    default:
      break;
  }
}

/**
 *
 * @param {*} current
 * @param {*} workInProgress
 */
function updateHostRoot(current, workInProgress) {
  const updateQuene = workInProgress.updateQuene;
  const nextChildren = updateQuene.shared.pending.payload.element;
  // 处理子节点，根据老fiber和新的虚拟dom进行对比，创建新的fiber树
  reconcileChildren(current, workInProgress, nextChildren);
  // 返回第一个子fiber
  return workInProgress.child;
}

function updateHostComponent(current, workInProgress) {
  // 获取此原生组件的类型 span p
  const type = workInProgress.type;
  // 新属性
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  // 在react中，如果一个原生组件，它只有一个儿子，并且这个儿子是一个字符串的话，
  // 不会对此儿子创建一个fiber节点，而是把它当成一个属性来处理
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }
  // 处理子节点，根据老fiber和新的虚拟DOM进行对比，创建新的fiber树
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

function updateFunctionComponent(current, workInProgress) {
  renderHooks(workInProgress);
  const { type, props } = workInProgress;
  const children = type(props);
  reconcileChildren(current, workInProgress, children);
  return workInProgress.child;
}

export function reconcileChildren(current, workInProgress, nextChildren) {
  // 如果current有值，说明这是更新
  if (current) {
    workInProgress.child = reconcileChildFibers(
      workInProgress, // 新fiber
      current.child, // 老fiber的第一个子节点fiber
      nextChildren
    );
  } else {
    workInProgress.child = mountChildFibers(
      workInProgress, // 新fiber
      null,
      nextChildren
    );
  }
}
