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
