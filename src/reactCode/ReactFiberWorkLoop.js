import { createWorkInProgress } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { completeWork } from './ReactFiberCompleteWork';
import { Deletion, Placement, Update, PlacementAndUpdate } from './ReactFiberFlags';
import { commitPlacement, commitDeletion, commitWork } from './ReactFiberCommitWork';
// 当前正在更新的根
let workInProgressRoot = null;

// 当前正在更新fiber节点
let workInProgress = null;

/**
 * 不管如何更新，不管谁来更新，都会调度到这个方法里
 * @param {*} fiber
 */
export function scheduleUpdateOnFiber(fiber) {
  const fiberRoot = markUpdateLaneFromFiberToRoot(fiber);
  performSyncWorkOnRoot(fiberRoot);
}

/**
 * 根据老的fiber树和更新对象创建新的fiber树，然后根据新的fiber树去更新真实DOM
 * @param {*} fiberRoot
 */
function performSyncWorkOnRoot(fiberRoot) {
  workInProgressRoot = fiberRoot;
  workInProgress = createWorkInProgress(workInProgressRoot.current);
  workLoopSync(); // 执行工作循环，构建副作用链
  commitRoot(); // 提交，修改DOM
}

function commitRoot() {
  // 指向新构建的fiber树
  const finishedWork = workInProgressRoot.current.alternate;
  workInProgressRoot.finishedWork = finishedWork;
  commitMutationEffects(workInProgressRoot);
}

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

function commitMutationEffects(root) {
  const finishedWork = root.finishedWork;
  let nextEffect = finishedWork.firstEffect;
  let effectsList = '';
  while (nextEffect) {
    effectsList += `(${getFlags(nextEffect.flags)}#${nextEffect.type}#${nextEffect.key})`;
    const flags = nextEffect.flags;
    const current = nextEffect.alternate;
    if (flags === Placement) {
      commitPlacement(nextEffect);
    } else if (flags === PlacementAndUpdate) {
      commitPlacement(nextEffect);
      nextEffect.flags = Update;
      commitWork(current, nextEffect);
    } else if (flags === Update) {
      commitWork(current, nextEffect);
    } else if (flags === Deletion) {
      commitDeletion(nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
  effectsList += 'null';
  console.log(effectsList, 'effectsList');
  console.log(finishedWork, 'finishedWork');
  root.current = finishedWork;
}

/**
 * 开始自上而下构建新的fiber树
 */
function workLoopSync() {
  while (workInProgress) {
    performUnitWork(workInProgress);
  }
}

/**
 * 执行单个工作单元
 * workInProgress　要处理的fiber
 */
function performUnitWork(unitOfWork) {
  // 获取当前正在构建的fiber的替身
  const current = unitOfWork.alternate;
  // 开始构建当前fiber的子fiber链表
  // 它会返回下一个要处理的fiber，一般都是unitOfWork的大儿子
  // div#title这个fiber它的返回值是一个null
  const next = beginWork(current, unitOfWork);
  // 在beginWork后，需要把新属性同步到老属性上
  // div id = 1 变成 id = 2 memorizedProps={id：2} pendingProps={id：1}
  unitOfWork.memorizedProps = unitOfWork.pendingProps;
  // 当前的fiber还有子节点
  if (next) {
    workInProgress = next;
  } else {
    // 如果当前fiber没有子fiber，那么当前的fiber就算完成
    completeUnitOfWork(unitOfWork);
  }
}

/**
 * 完成一个fiber节点
 * @param {*} unitOfWork
 */
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    // 完成此fiber对应的真实DOM节点创建和属性赋值的功能
    completeWork(current, completedWork);
    // 收集当前fiber的副作用到父fiber上
    collectEffectList(returnFiber, completedWork);
    // 当自己这个fiber完成后，如何寻找下个要构建的fiber
    const siblingFiber = completedWork.sibling;
    if (siblingFiber) {
      // 如果有弟弟，就开始构建弟弟，处理弟弟 beginwork
      workInProgress = siblingFiber;
      return;
    }
    // 如果没有弟弟，说明这是最后一个儿子，父亲也可以完成了
    // 这个循环到最后的时候，returnFiber就是null，也就是根fiber的父亲
    completedWork = returnFiber;
    // 不停的修改当前正在处理的fiber，最后workInProgress=null 就可以退出workLoop了
    workInProgress = completedWork;
  } while (workInProgress)
}

function collectEffectList(returnFiber, completedWork) {
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = completedWork.firstEffect;
    }
    // 如果自己有链表尾
    if (completedWork.lastEffect) {
      // 并且父亲也有链表尾
      if (returnFiber.lastEffect) {
        // 把自己身上的effectList挂接到父亲的链表尾部
        returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
      }
      returnFiber.lastEffect = completedWork.lastEffect;
    }
    const flags = completedWork.flags;
    // 如果此完成的fiber有副作用，那么就需要添加到effectList里
    if (flags) {
      // 如果父fiber有lastEffect的话，说明父fiber已经有effect链表
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = completedWork;
      } else {
        returnFiber.firstEffect = completedWork;
      }
    }
  }
}

function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent) {
    // 一直往上找到fiber树的根节点
    node = parent;
    parent = parent.return;
  }
  // node其实就是fiber树的根节点，hostFiberRoot.stateNode  div#root
  return node.stateNode;
}
