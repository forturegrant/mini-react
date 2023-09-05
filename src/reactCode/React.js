import { REACT_ELEMENT_TYPE } from "./ReactSymbols";

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
}

/**
 * 创建虚拟DOM
 * @param {*} type 元素的类型
 * @param {*} config 配置对象
 * @param {*} children 第一个儿子，如果有多个儿子的话会依次放在后面
 */

function createElement(type, config, children) {
  let propName;
  const props = {};
  let key = null;
  let ref = null;
  if (config) {
    if (config.key) {
      key = config.key;
    }
    if (config.ref) {
      ref = config.ref;
    }
    for (propName in config) {
      if (!RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = new Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE, // 类型是一个React元素
    type,
    ref,
    key,
    props
  }
};

const React = {
  createElement
};

export default React;
