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

function validateStoppable(stoppable) {
  if( typeof stoppable !== 'boolean' && typeof stoppable !== 'undefined' ) {
    throw new Error('invalid stoppable');
  }
}

function validateEnqueue(enqueue) {
  if( typeof enqueue !== 'boolean' && typeof enqueue !== 'undefined' ) {
    throw new Error('invalid enqueue');
  }
}

function validateFailOnCancel(failOnCancel) {
  if( typeof failOnCancel !== 'boolean' && typeof failOnCancel !== 'undefined' ) {
    throw new Error('invalid failOnCancel');
  }
}

export async function scroll(params) {
  // extract params
  let {
    container,
    target,
    transition,
    duration,
    stoppable,
    enqueue,
    failOnCancel,
  } = params;

  // validate parameter
  validateContainer(container);
  validateTarget(target);
  validateTransition(transition);
  validateDuration(duration);
  validateStoppable(stoppable);
  validateEnqueue(enqueue);
  validateFailOnCancel(failOnCancel);

  // fix parameter
  if( typeof target === 'object' ) {
    const value = target;
    target = () => value;
  }
  if( typeof transition === 'string' ) {
    transition = transitions[transition];
  }
  if( typeof stoppable === 'undefined' ) {
    stoppable = true;
  }
  if( typeof enqueue === 'undefined' ) {
    enqueue = true;
  }
  if( typeof failOnCancel === 'undefined' ) {
    failOnCancel = false;
  }

  // get origin metrics
  const origin = getScrollMetrics(container).scrollPosition;

  // clear queue if requested
  if(!enqueue) {
    clearQueue(container);
  }

  // enqueue
  return await new Promise((resolve, reject) => {
    addToQueue(
      container,
      origin,
      target,
      transition,
      duration,
      stoppable,
      (result) => {
        if(failOnCancel && result.status === 'cancelled') {
          reject(new Error('cancelled'));
        }
        else {
          resolve(result);
        }
      }
    );
  });
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
