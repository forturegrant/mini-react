/**
 * 初始化更新队列
 * 所有的fiber都会把等待更新的内容放在更新队列中
 */
export function initializeUpdateQuene (fiber) {
  const updateQuene = {
    shared: {
      pending: null
    }
  };
  fiber.updateQuene = updateQuene;
}

export function createUpdate () {
  return {};
}

/**
 *
 * @param {*} fiber
 * @param {*} update
 */
export function enqueneUpdate (fiber, update) {
  console.log(fiber, 'fiber');
  const updateQuene = fiber.updateQuene;
  const shared = updateQuene.shared;
  const pending = shared.pending;
  // 环状链表，头尾相接
  if (!pending) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  // pending永远指向最新的更新
  shared.pending = update;
}

// let fiber = { baseState: { number: 0 } };
// initializeUpdateQuene(fiber);
// const update1 = createUpdate();
// update1.payload = { number: 1 }; // update1 = { payload: { number: 1 } }
// // 把update1添加到更新队列链表里
// enqueneUpdate(fiber, update1);

// // 再添加一个update2
// const update2 = createUpdate();
// update1.payload = { number: 2 }; // update2 = { payload: { number: 2 } }
// // 把update1添加到更新队列链表里
// enqueneUpdate(fiber, update2);
