import _ from 'lodash';
import {
  hasActiveQueues, getActiveQueues,
  getQueue, deactivateQueue
} from './queueing.js';
import { getScrollMetrics, setScrollPosition } from './metrics.js';

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
  //console.log('animation frame', now-lastTimestamp);
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

  // calculate time delta and detect frame drops
  let timeDelta = now - lastTimestamp;
  if(timeDelta >= 30) {
    timeDelta = 30;
    sequence.frameDrops += 1;
  }

  // determine progress, target and position
  sequence.progress = Math.min(
    sequence.progress + timeDelta,
    sequence.duration
  );
  sequence.relativeProgress = sequence.progress / sequence.duration;

  // get target
  const target = sequence.target();

  if(sequence.targetValue && !_.isEqual(target, sequence.targetValue)) {
    console.info('in-motion: target changed - new = ' + JSON.stringify(target) + '; previous = ' + JSON.stringify(sequence.targetValue));
  }
  sequence.targetValue = target;

  // get requested position
  const reqPos = { };

  function transition(property) {
    if(typeof sequence.targetValue[property] !== 'undefined') {
      const o = sequence.origin[property];
      const t = sequence.targetValue[property];
      const e = sequence.easing(sequence.relativeProgress, property);
      reqPos[property] = Math.round(o + (t - o) * e);
    }
  }

  transition('left');
  transition('top');

  // update scroll position
  setScrollPosition(container, reqPos);

  // handle completion of sequence
  if(sequence.progress >= sequence.duration) {
    // check if we could reach requested position
    const curPos = getScrollMetrics(container).scrollPosition;
    if( (typeof reqPos.left !== 'undefined' && curPos.left !== reqPos.left)
     || (typeof reqPos.top !== 'undefined' && curPos.top !== reqPos.top)
    ) {
      console.info('in-motion: requested position could not be reached - requested = ' + JSON.stringify(reqPos) + '; current = ' + JSON.stringify(curPos));
    }

    // call completion handler
    try {
      sequence.callback({
        status: 'completed',
        progress: sequence.progress,
        duration: sequence.duration,
      });
    }
    catch(e) { }

    // adjust queue
    queue.shift();
    if(queue.length == 0) {
      deactivateQueue(container);
    }

    // warn about detected frame drops
    if(sequence.frameDrops > 0) {
      console.info('in-motion: frame drops detected - ', sequence.frameDrops);
    }
  }
}
