import { hasActiveQueues } from './queueing.js';
import { setScrollPosition } from './metrics.js';

let currentRequest = null;
let lastTimestamp = null;

export function activateAnimation() {
  if(!currentRequest && hasActiveQueues() > 0) {
    lastTimestamp = Date.now();
    currentRequest = requestAnimationFrame(animationFrameWrapper);
  }
}

export function deactivateAnimation() {
  if(currentRequest) {
    cancelAnimationFrame(currentRequest);
    lastTimestamp = null;
    currentRequest = null;
  }
}

export function animationFrameWrapper() {
  const now = Date.now();
  console.log('animation frame', now);
  for(let container of getActiveContainer()) {
    containerFrame(container, now);
  }
  if(hasActiveQueues() > 0) {
    lastTimestamp = now;
    currentRequest = requestAnimationFrame(animationFrameWrapper);
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
    queue.shift();
    if(queue.length == 0) {
      deactivateContainer(container);
    }
  }
}
