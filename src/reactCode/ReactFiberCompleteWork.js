import { FunctionComponent, HostComponent } from "./ReactWorkTags";
import {
  appendChild,
  createInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from "./ReactDomHostConfig";
import { Update } from "./ReactFiberFlags";

export function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostComponent:
      if (current && workInProgress.stateNode) {
        updateHostComponent(
          current,
          workInProgress,
          workInProgress.tag,
          newProps
        );
      } else {
        // 创建真实的DOM节点
        const type = workInProgress.type; // div p span
        // 创建此fiber的真实DOM
        const instance = createInstance(type, newProps);
        appendAllChildren(instance, workInProgress);
        // 让此fiber的真实DOM属性指向instance
        workInProgress.stateNode = instance;
        // 给真实DOM添加属性
        finalizeInitialChildren(instance, type, newProps);
      }
      break;
    default:
      break;
  }
}

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node) {
    if (node.tag === HostComponent) {
      appendChild(parent, node.stateNode);
    }
    if (node.tag === FunctionComponent) {
      appendChild(parent, node.child.stateNode);
    }
    node = node.sibling;
  }
}

function updateHostComponent(current, workInProgress, tag, newProps) {
  const oldProps = current.memorizedProps;
  const instance = workInProgress.stateNode;
  const updatePayload = prepareUpdate(instance, tag, oldProps, newProps);
  workInProgress.updateQuene = updatePayload;
  if (updatePayload) {
    workInProgress.flags |= Update;
  }
}

/**
 * 根fiber rootFiber updateQuene.shared.pending 上面是一个环状链表 update {payload: element}
 * 原生组件fiber HostComponent updateQuene=updatePayload 数组[ key1, value1, key2, value2]
 */
