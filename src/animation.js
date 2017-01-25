import {
  hasActiveQueues, getActiveQueues,
  getQueue, deactivateQueue
} from './queueing.js';
import { setScrollPosition } from './metrics.js';

let currentRequest = null;
let lastTimestamp = null;

export function activateAnimation() {
  if(!currentRequest && hasActiveQueues() > 0) {
    lastTimestamp = null;
    currentRequest = requestAnimationFrame(frame);
  }
}

export function deactivateAnimation() {
  if(currentRequest) {
    cancelAnimationFrame(currentRequest);
    lastTimestamp = null;
    currentRequest = null;
  }
}

export function frame() {
  const now = Date.now();
  if(!lastTimestamp) {
    lastTimestamp = now;
  }
  console.log('animation frame', now-lastTimestamp);
  for(let container of getActiveQueues()) {
    containerFrame(container, now);
  }
  if(hasActiveQueues() > 0) {
    lastTimestamp = now;
    currentRequest = requestAnimationFrame(frame);
  }
  else {
    lastTimestamp = null;
    currentRequest = null;
  }
}

export function containerFrame(container, now) {
  // get first element of queue
  const queue = getQueue(container);
  if(queue.length == 0) {
    return;
  }
  const sequence = queue[0];

  // determine progress, target and position
  sequence.progress = Math.min(
    sequence.progress + (now - lastTimestamp),
    sequence.duration
  );

  const target = sequence.target();

  const position = sequence.transition(
    sequence.origin,
    target,
    sequence.progress / sequence.duration
  );

  // update scroll position
  setScrollPosition(container, position);

  // handle completion of sequence
  if(sequence.progress >= sequence.duration) {
    try {
      sequence.callback({
        status: 'completed',
        progress: sequence.progress,
        duration: sequence.duration,
      });
    }
    catch(e) { }
    queue.shift();
    if(queue.length == 0) {
      deactivateQueue(container);
    }
  }
}
