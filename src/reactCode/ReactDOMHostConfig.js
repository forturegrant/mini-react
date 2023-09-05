import { createElement, setInitialProperties, diffProperties } from './ReactDOMComponent';
export function shouldSetTextContent(type, props) {
  return typeof props.children === 'string' || typeof props.children === 'number';
}

export function createInstance(type) {
  return createElement(type);
}

export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props)
}

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child);
}

export function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}

export function prepareUpdate(domELement, type, oldProps, newProps) {
  return diffProperties(domELement, type, oldProps, newProps);
}
