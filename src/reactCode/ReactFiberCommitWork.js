import { HostComponent, HostRoot } from './ReactWorkTags';
import { appendChild, removeChild, insertBefore } from './ReactDOMHostConfig';
import { updateProperties } from './ReactDOMComponent';
import { Placement } from './ReactFiberFlags';

function getParentStateNode(fiber) {
  let parent = fiber.return;
  do {
    if (parent.tag === HostComponent) {
      return parent.stateNode;
    } else if (parent.tag === HostRoot) {
      return parent.stateNode.containerInfo;
    } else {
      // 函数组件或类组件
      parent = parent.return;
    }
  } while (parent)
}

export function commitPlacement(nextEffect) {
  const stateNode = nextEffect.stateNode;
  const parentStateNode = getParentStateNode(nextEffect);
  let before = getHostSibling(nextEffect);
  if (before) {
    insertBefore(parentStateNode, stateNode, before);
  } else {
    appendChild(parentStateNode, stateNode);
  }
}

function getHostSibling(fiber) {
  let node = fiber.sibling;
  while (node) {
    // 找它的弟弟们，找到最近一个，不是插入的节点，返回。。没有更新
    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
    node = node.sibling;
  }
  return null;
}

export function commitWork(current, finishedWork) {
  const updatePayload = finishedWork.updateQuene;
  // finishedWork.updateQuene = null;
  if (updatePayload) {
    updateProperties(finishedWork.stateNode, updatePayload);
  }
}

export function commitDeletion(fiber) {
  if (!fiber) return;
  const parentStateNode = getParentStateNode(fiber);
  removeChild(parentStateNode, fiber.stateNode);
}
