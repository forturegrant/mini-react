import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';
import isFn from './utils';
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
  debugger;
  hook.memorizedState = reducer
    ? reducer(hook.memorizedState, action)
    : isFn(action)
      ? action()
      : action;
  fiber.alternate = { ...fiber };
  // 当前函数组件的fiber
  scheduleUpdateOnFiber(fiber);
};
