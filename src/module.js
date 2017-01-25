import * as transitions from './transitions.js';
import { addToQueue, clearQueue, getActiveQueues } from './queueing.js';
import { getScrollMetrics } from './metrics.js';

function validateContainer(container) {
  if( !(container instanceof HTMLElement) && !(container instanceof Window)) {
    throw new Error('invalid container');
  }
  if( container instanceof HTMLElement
    && (container.tagName == 'HTML' || container.tagName == 'BODY')
  ) {
    throw new Error('invalid container');
  }
}

function validateTarget(target) {
  if( typeof target !== 'function' && typeof target !== 'object' ) {
    throw new Error('invalid target');
  }
}

function validateTransition(transition) {
  if( typeof transition !== 'function' && typeof target !== 'string' ) {
    throw new Error('invalid transition');
  }
}

function validateDuration(duration) {
  if( typeof duration !== 'number' ) {
    throw new Error('invalid duration');
  }
}

function validateEnqueue(enqueue) {
  if( typeof enqueue !== 'boolean' && typeof enqueue !== 'undefined' ) {
    throw new Error('invalid enqueue');
  }
}

function validateStoppable(stoppable) {
  if( typeof stoppable !== 'boolean' && typeof stoppable !== 'undefined' ) {
    throw new Error('invalid stoppable');
  }
}

export function scroll(params) {
  // extract params
  let {
    container,
    target,
    transition,
    duration,
    stoppable,
    enqueue,
  } = params;

  // validate parameter
  validateContainer(container);
  validateTarget(target);
  validateTransition(transition);
  validateDuration(duration);
  validateEnqueue(enqueue);
  validateStoppable(stoppable);

  // fix parameter
  if( typeof target === 'object' ) {
    const value = target;
    target = () => value;
  }
  if( typeof transition === 'string' ) {
    transition = transitions[transition];
  }
  if( typeof enqueue === 'undefined' ) {
    enqueue = true;
  }
  if( typeof stoppable === 'undefined' ) {
    stoppable = true;
  }

  // get origin metrics
  const origin = getScrollMetrics(container).scrollPosition;

  // clear queue if requested
  if(!enqueue) {
    clearQueue(container);
  }

  // enqueue
  addToQueue(
    container,
    origin,
    target,
    transition,
    duration,
    stoppable
  );
}

export function stopScroll(container) {
  if(!container) {
    for(let container of getActiveQueues()) {
      clearQueue(container);
    }
  }
  else {
    validateContainer(container);
    clearQueue(container);
  }
}
