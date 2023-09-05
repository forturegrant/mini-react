import { HostComponent, HostRoot } from './ReactWorkTags';
import { appendChild, removeChild } from './ReactDOMHostConfig';
import { updateProperties } from './ReactDOMComponent';

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
  appendChild(parentStateNode, stateNode);
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
