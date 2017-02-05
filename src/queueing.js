import { activateAnimation, deactivateAnimation } from './animation.js';

const queues = new WeakMap();
const activeQueues = new Set();

export function getQueue(container) {
  if(!queues.has(container)) {
    queues.set(container, [ ]);
  }
  return queues.get(container);
}

export function activateQueue(container) {
  activeQueues.add(container);
  activateAnimation();
}

export function deactivateQueue(container) {
  activeQueues.delete(container);
  if(activeQueues.size == 0) {
    deactivateAnimation();
  }
}

export function getActiveQueues() {
  return Array.from(activeQueues);
}

export function hasActiveQueues() {
  return activeQueues.size > 0;
}

export function clearQueue(container) {
  const queue = getQueue(container);
  // execute all pending callbacks
  for(let sequence of queue) {
    try {
      sequence.callback({
        status: 'cancelled',
        progress: sequence.progress,
        duration: sequence.duration,
      });
      console.info('in-motion: sequence cancelled');
    }
    catch(e) { }
  }
  // clear queue
  queue.length = 0;
  // deactivate queue
  deactivateQueue(container);
}

export function addToQueue(container, origin, target, easing, duration, stoppable, callback) {
  // put into queue
  getQueue(container)
    .push({
      origin,
      target,
      targetValue: null,
      easing,
      transition: null,
      duration,
      stoppable,
      progress: 0,
      relativeProgress: 0,
      callback,
      frameDrops: 0,
    });
  // activate queue
  activateQueue(container);
}
