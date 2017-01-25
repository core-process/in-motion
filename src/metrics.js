
export function getLocalClientRect(container, element) {
  var containerRect = container.getBoundingClientRect(),
      elementRect = element.getBoundingClientRect();
  return {
    left: elementRect.left - containerRect.left,
    top: elementRect.top - containerRect.top,
    right: elementRect.left - containerRect.left + elementRect.width,
    bottom: elementRect.top - containerRect.top + elementRect.height,
    width: elementRect.width,
    height: elementRect.height,
  };
}

export function getScrollMetrics(container) {
  if(container instanceof HTMLElement) {
    return {
      scrollPosition: {
        top: container.scrollTop,
        left: container.scrollLeft,
      },
      viewportSize: {
        height: container.clientHeight,
        width: container.clientWidth,
      },
      contentSize: {
        height: container.scrollHeight,
        width: container.scrollWidth,
      },
    };
  }
  else
  if(container instanceof Window) {
    return {
      scrollPosition: {
        top: container.pageYOffset,
        left: container.pageXOffset,
      },
      viewportSize: {
        height: container.document.documentElement.clientHeight,
        width: container.document.documentElement.clientWidth,
      },
      contentSize: {
        height: container.document.documentElement.scrollHeight,
        width: container.document.documentElement.scrollWidth,
      },
    };
  }
  console.log(container);
  throw new Error('invalid container type');
}

export function setScrollPosition(container, { top, left }) {
  if(container instanceof HTMLElement) {
    if(typeof top !== 'undefined') {
      container.scrollTop = top;
    }
    if(typeof left !== 'undefined') {
      container.scrollLeft = left;
    }
    return;
  }
  else
  if(container instanceof Window) {
    container.scrollTo(
      typeof left === 'undefined'
        ? container.pageXOffset
        : left,
      typeof top === 'undefined'
        ? container.pageYOffset
        : top
    );
    return;
  }
  console.log(container);
  throw new Error('invalid container type');
}