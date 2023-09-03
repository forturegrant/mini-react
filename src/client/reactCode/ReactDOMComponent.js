export function createElement(element) {
  console.log(element, 'element');
  return document.createElement(element);
}

export function setInitialProperties(domElement, tag, props) {
  for (const propKey in props) {
    const nextProp = props[propKey];
    if (propKey === 'children') {
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        domElement.textContent = nextProp;
      }
    } else if (propKey === 'style') {
      for (const stylePropKey in nextProp) {
        domElement.style[stylePropKey] = nextProp[stylePropKey];
      }
    } else if (propKey.slice(0, 2) === 'on') { // 伪模拟一下react的事件机制
      const eventName = propKey.slice(2).toLocaleLowerCase();
      domElement.removeEventListener(eventName, nextProp);
      domElement.addEventListener(eventName, nextProp);
    } else {
      domElement[propKey] = nextProp;
    }
  }
}

export function diffProperties(domELement, type, lastProps, nextProps) {
  let updatePayload = null;
  let propKey;
  for (propKey in lastProps) {
    if (lastProps.hasOwnProperty(propKey) && (!nextProps.hasOwnProperty(propKey))) {
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    if (propKey === 'children') {
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        if (nextProp !== lastProps[propKey]) {
          (updatePayload = updatePayload || []).push(propKey, nextProp);
        }
      }
    } else {
      if (nextProp !== lastProps[propKey]) {
        (updatePayload = updatePayload || []).push(propKey, nextProp);
      }
    }
  }
  return updatePayload;
}

export function updateProperties(domELement, updatePayload) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === 'children') {
      domELement.textContent = propValue;
    } else {
      domELement.setAttribute(propKey, propValue);
    }
  }
}
