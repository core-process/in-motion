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

  // determine target
  const ptv = sequence.targetValue;
  sequence.targetValue = sequence.target();

  // handle target update
  if(!_.isEqual(sequence.targetValue, ptv)) {
    console.info('in-motion: target updated - new = ' + JSON.stringify(sequence.targetValue) + '; previous = ' + JSON.stringify(ptv));

    // create transition method
    let transition =
      (origin, target, easing) =>
        (property) =>
          (progress) =>
            typeof target[property] !== 'undefined'
            ? Math.round(
                  (origin[property])
                + (target[property] - origin[property])
                    * easing(progress, property)
              )
            : undefined;

    transition = transition(
      sequence.origin,
      sequence.targetValue,
      sequence.easing
    );

    transition = {
      left: transition('left'),
      top: transition('top'),
    };

    if(!ptv) {
      sequence.transition = transition;
    }
    else {
      // migration routine
      let migration =
        (progressBegin, progressEnd, prevTrans, transition) =>
          (property) =>
            (progress) => {
              const scale = Math.min(
                  (progress - progressBegin)
                / (progressEnd - progressBegin),
                1.0
              );
              const pt = prevTrans[property](progress),
                    ct = transition[property](progress);
              if(typeof pt === 'undefined')
                return ct;
              if(typeof ct === 'undefined')
                return pt;
              return pt * (1 - scale) + ct * scale;
            };

      migration = migration(
        sequence.relativeProgress,
        (sequence.relativeProgress + 1.0) / 2.0,
        sequence.transition,
        transition
      );

      sequence.transition = {
        left: migration('left'),
        top: migration('top'),
      };
    }
  }

  // get requested position
  const reqPos = {
    left: sequence.transition.left(sequence.relativeProgress),
    top: sequence.transition.top(sequence.relativeProgress),
  };

  // update scroll position
  setScrollPosition(container, reqPos);
  console.log('reqPos = ', JSON.stringify(reqPos));

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
