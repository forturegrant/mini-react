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

  function updateElement(returnFiber, oldFiber, newChild) {
    if (oldFiber) {
      if (oldFiber.type === newChild.type) {
        const existing = useFiber(oldFiber, newChild.props);
        existing.return = returnFiber;
        return existing;
      }
    }
    // 如果没有老fiber
    const created = createFiberFromElement(newChild);
    created.return = returnFiber;
    return created;
  }

  function updateSlot(returnFiber, oldFiber, newChild) {
    const key = oldFiber ? oldFiber.key : null;
    if (newChild.key === key) {
      return updateElement(returnFiber, oldFiber, newChild);
    } else {
      // 如果key不一样，直接结束返回null
      return null;
    }
  }

  function placeChild(newFiber, lastPlacedIndex, newIdx) {
    newFiber.index = newIdx;
    if (!shouldTrackSideEffects) {
      return lastPlacedIndex;
    }
    const current = newFiber.alternate;
    // 如果有current说是更新，复用老节点的更新，不会添加Placement
    if (current) {
      const oldIndex = current.index;
      // 如果老fiber它对应的真是DOM挂载的索引比lastPlacedIndex小
      if (oldIndex < lastPlacedIndex) {
        // 老fiber对应的真是DOM就需要移动了
        newFiber.flags |= Placement;
        return lastPlacedIndex;
      } else {
        // 否则 不需要移动 并且把老fiber它的原来的挂载索引返回成为新的lastPlacedIndex
        return oldIndex;
      }
    } else {
      newFiber.flags = Placement;
      return lastPlacedIndex;
    }
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    // 将要返回的第一个新fiber
    let resultingFirstChild = null;
    // 上一个新fiber
    let previousNewFiber = null;
    // 当前的老fiber
    let oldFiber = currentFirstChild;
    // 下一个老fiber
    let nextOldFiber = null;
    // 新的虚拟DOM的索引
    let newIdx = 0;
    // 指的上一个可以复用的，不需要移动的节点的老索引
    let lastPlacedIndex = 0;
    // 处理更新的情况 老fiber和新fiber的存在
    for (; oldFiber && newIdx < newChildren.length; newIdx++) {
      // 先缓存下一个老fiber
      nextOldFiber = oldFiber.sibling;
      // 试图复用老fiber
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
      if (!newFiber) {
        break;
      }
      if (oldFiber && !newFiber.alternate) {
        deleteChild(returnFiber, oldFiber);
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (!previousNewFiber) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }
    if (!oldFiber) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx]);
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (!previousNewFiber) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }
    // 将剩下的老fiber放去map中
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
    for (; newIdx < newChildren.length; newIdx++) {
      // 去map中找找有没key相同并且类型相同可以复用的老fiber 老真实DOM
      const newFiber = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx]);
      if (newFiber) {
        if (newFiber.alternate) {
          existingChildren.delete(newFiber.key || newIdx);
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (!previousNewFiber) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }
    existingChildren.forEach(child => deleteChild(returnFiber, child));
    return resultingFirstChild;
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    const matchedFiber = existingChildren.get(newChild.key || newIdx);
    return updateElement(returnFiber, matchedFiber, newChild);
  }

  function mapRemainingChildren(returnFiber, currentFirstChild) {
    const existingChildren = new Map();
    let existingChild = currentFirstChild;
    while (existingChild != null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }
      existingChild = existingChild.sibling;
    }
    return existingChildren;
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
