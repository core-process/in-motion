
function findContainer(element, vertical, horizontal) {
  // top-level container case
  if(  element instanceof Window
    || element.tagName == 'HTML'
    || element.tagName == 'BODY'
  ) {
    return null;
  }
  // get parent element and check for top-level container
  var container = element.parentNode;
  if(  element instanceof Window
    || container.tagName == 'HTML'
    || container.tagName == 'BODY'
  ) {
    return element.ownerDocument.defaultView;
  }
  // check for intermediate container
  var style = getComputedStyle(container);
  if(  vertical
    && container.scrollHeight > container.clientHeight
    && (style.overflowY == 'auto' || style.overflowY == 'scroll')
  ) {
    return container;
  }
  if(  horizontal
    && container.scrollWidth > container.clientWidth
    && (style.overflowX == 'auto' || style.overflowX == 'scroll')
  ) {
    return container;
  }
  // check for container of parent
  return findContainer(container, vertical, horizontal);
}

function getLocalCoords(container, element) {
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

function getScrollMetrics(container) {
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

function setScrollPosition(container, { top, left }) {
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

const transitions = {
};

function scroll(params) {
  // extract params
  let {
    container,
    target,
    transition,
    duration,
    stoppable,
    enqueue,
  } = params;

  // validate 'container'
  if( !(container instanceof HTMLElement) && !(container instanceof Window)) {
    throw new Error('invalid container');
  }
  if( container instanceof HTMLElement
    && (container.tagName == 'HTML' || container.tagName == 'BODY')
  ) {
    throw new Error('invalid container');
  }
  // validate 'target'
  if( typeof target !== 'function' && typeof target !== 'object' ) {
    throw new Error('invalid target');
  }
  // validate 'transition'
  if( typeof transition !== 'function' && typeof target !== 'string' ) {
    throw new Error('invalid transition');
  }
  // validate 'duration'
  if( typeof duration !== 'number' ) {
    throw new Error('invalid duration');
  }
  // validate 'enqueue'
  if( typeof enqueue !== 'boolean' && typeof enqueue !== 'undefined' ) {
    throw new Error('invalid enqueue');
  }
  // validate 'stoppable'
  if( typeof stoppable !== 'boolean' && typeof stoppable !== 'undefined' ) {
    throw new Error('invalid stoppable');
  }

  // fix 'target'
  if( typeof target === 'object' ) {
    const value = target;
    target = () => value;
  }
  // fix 'transition'
  if( typeof transition === 'string' ) {
    transition = transitions[transition];
  }
  // fix 'enqueue'
  if( typeof enqueue === 'undefined' ) {
    enqueue = true;
  }
  // fix 'stoppable'
  if( typeof stoppable === 'undefined' ) {
    stoppable = true;
  }

  // clear queue if requested
  if(!enqueue) {
    clearQueue(container);
  }

  // enqueue
  enqueue(
    container,
    { target,
      transition,
      duration,
      stoppable,
    }
  );
}

const queue = new WeakMap();
const activeQueues = new Set();

function getQueue(container) {
  if(!queue.has(container)) {
    queue.set(container, [ ]);
  }
  return queue.get(container);
}

function getActiveContainer() {
  return Array.from(activeQueues);
}

function activateContainer(container) {
  activeQueues.add(container);
  activateAnimation();
}

function deactivateContainer(container) {
  activeQueues.delete(container);
  if(activeQueues.size == 0) {
    deactivateAnimation();
  }
}

export function clearQueue(container) {
  // clear queue
  getQueue(container)
    .length = 0;
  // deactivate queue
  deactivateContainer(container);
}

export function enqueue(container, target, transition, duration, stoppable) {
  // get origin scroll position
  const origin = getScrollMetrics(container).scrollPosition;
  // put into queue
  getQueue(container)
    .push({
      origin,
      target,
      transition,
      duration,
      stoppable,
      progress: 0,
    });
  // activate queue
  activateContainer(container);
}

let animationFrameRequest = null;
let animationTimestamp = null;

function activateAnimation() {
  if(!animationFrameRequest) {
    console.log('activate animation');
    animationTimestamp = Date.now();
    animationFrameRequest = requestAnimationFrame(animationFrameWrapper);
  }
}

function deactivateAnimation() {
  if(animationFrameRequest) {
    console.log('disable animation');
    cancelAnimationFrame(animationFrameRequest);
    animationTimestamp = null;
    animationFrameRequest = null;
  }
}

function animationFrameWrapper() {
  console.log('animation frame');
  animationFrame();
  if(activeQueues.size > 0) {
    animationTimestamp = Date.now();
    animationFrameRequest = requestAnimationFrame(animationFrameWrapper);
  }
  else {
    animationTimestamp = null;
    animationFrameRequest = null;
  }
}

function animationFrame() {
  for(let container of getActiveContainer()) {
    containerAnimationFrame(container);
  }
}

function containerAnimationFrame(container) {
  const queue = getQueue(container);
  if(queue.length == 0) {
    return;
  }

  const sequence = queue[0];

  sequence.progress = Math.min(
    sequence.progress + (Date.now() - animationTimestamp),
    sequence.duration
  );

  const position = sequence.transition(
    sequence.origin,
    sequence.target(),
    sequence.progress / sequence.duration
  );

  //console.log('progress = ', sequence.progress);
  //console.log('duration = ', sequence.duration);
  //console.log('scroll to: ' + JSON.stringify(position));

  setScrollPosition(container, position);

  if(sequence.progress == sequence.duration) {
    queue.shift();
    if(queue.length == 0) {
      deactivateContainer(container);
    }
  }
}
