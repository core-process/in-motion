
export function getLocalClientRect(container, element) {
  var containerRect = container instanceof Window ? { left: 0, top: 0 } : container.getBoundingClientRect(),
      containerMetrics = getScrollMetrics(container),
      elementRect = element.getBoundingClientRect();
  return {
    left: elementRect.left - containerRect.left + containerMetrics.scrollPosition.left,
    top: elementRect.top - containerRect.top + containerMetrics.scrollPosition.top,
    right: elementRect.left - containerRect.left + elementRect.width + containerMetrics.scrollPosition.left,
    bottom: elementRect.top - containerRect.top + elementRect.height + containerMetrics.scrollPosition.top,
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

export function calculateDistance(point1, point2) {
  // calculate distance
  if(  typeof point1.left !== 'undefined' && typeof point1.top !== 'undefined'
    && typeof point2.left !== 'undefined' && typeof point2.top !== 'undefined'
  ) {
    return {
      combined:
        Math.sqrt(
            Math.pow(Math.abs(point2.left-point1.left), 2)
          + Math.pow(Math.abs(point2.top-point1.top), 2)
        ),
      left: point2.left-point1.left,
      top: point2.top-point1.top,
    };
  }
  else
  if(typeof point1.left !== 'undefined' && typeof point2.left !== 'undefined') {
    return {
      combined: point2.left-point1.left,
      left: point2.left-point1.left,
    };
  }
  else
  if(typeof point1.top !== 'undefined' && typeof point2.top !== 'undefined') {
    return {
      combined: point2.top-point1.top,
      top: point2.top-point1.top,
    };
  }
  else {
    return { combined: 0 };
  }
}
