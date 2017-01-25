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
  // clear queue
  getQueue(container)
    .length = 0;
  // deactivate queue
  deactivateQueue(container);
}

export function addToQueue(container, origin, target, transition, duration, stoppable) {
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
  activateQueue(container);
}
