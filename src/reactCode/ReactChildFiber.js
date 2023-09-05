import { REACT_ELEMENT_TYPE } from "./ReactSymbols";
import { createFiberFromElement, createWorkInProgress } from "./ReactFiber";
import { Deletion, Placement } from "./ReactFiberFlags";

function childReconciler(shouldTrackSideEffects) {
  function deleteRemainingChildren(returnFiber, childToDelete) {
    while (childToDelete) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }

  function useFiber(oldFiber, pendingProps) {
    return createWorkInProgress(oldFiber, pendingProps);
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    const key = element.key;
    let child = currentFirstChild;
    while (child) {
      if (child.key === key) {
        if (child.type === element.type) {
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        } else {
          deleteChild(returnFiber, child);
          break;
        }
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
    const crated = createFiberFromElement(element);
    crated.return = returnFiber;
    return crated;
  }

  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      return;
    }
    const lastEffect = returnFiber.lastEffect;
    if (lastEffect) {
      lastEffect.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    childToDelete.nextEffect = null;
    childToDelete.flags = Deletion;
  }

  function placeSingleChild(newFiber) {
    // 如果当前需要跟踪副作用，并且当前这个新的fiber它的替身不存在
    if (shouldTrackSideEffects && !newFiber.alternate) {
      // 给这个新fiber添加一个副作用，表示在未来提交阶段的DOM操作中回向真实DOM树中添加此节点
      newFiber.flags = Placement;
    }
    return newFiber;
  }

  function createChild(returnFiber, newChild) {
    const created = createFiberFromElement(newChild);
    created.return = returnFiber;
    return created;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    const oldFiber = currentFirstChild;
    let newIdx = 0;
    if (!oldFiber) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx]);
        newFiber.flags = Placement;
        if (!previousNewFiber) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }
    return resultingFirstChild;
  }

  function reconcilerChildFibers(returnFiber, currentFirstChild, newChild) {
    // 判断newChild是不是一个对象，如果是的话说明新的虚拟DOM只有一个React元素节点
    const isObject =
      Object.prototype.toString.call(newChild) === "[object Object]";
    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );
      }
    } else if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }
  }
  return reconcilerChildFibers;
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
