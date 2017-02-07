import * as easings from './easings.js';
import { addToQueue, clearQueue, getActiveQueues } from './queueing.js';
import { getScrollMetrics, getLocalClientRect } from './metrics.js';
import { findContainer } from './container.js';
import './interaction.js';

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
  if( typeof target !== 'function' ) {
    throw new Error('invalid target');
  }
}

function validateEasing(easing) {
  if( typeof easing !== 'function' ) {
    throw new Error('invalid easing');
  }
}

function validateDuration(duration) {
  if( typeof duration !== 'number' ) {
    throw new Error('invalid duration');
  }
}

function validateStoppable(stoppable) {
  if( typeof stoppable !== 'boolean' ) {
    throw new Error('invalid stoppable');
  }
}

function validateEnqueue(enqueue) {
  if( typeof enqueue !== 'boolean' ) {
    throw new Error('invalid enqueue');
  }
}

function validateFailOnCancel(failOnCancel) {
  if( typeof failOnCancel !== 'boolean' ) {
    throw new Error('invalid failOnCancel');
  }
}

function validateSoftFrameSkip(softFrameSkip) {
  if( typeof softFrameSkip !== 'boolean' ) {
    throw new Error('invalid softFrameSkip');
  }
}

function toPixel(base, span, value) {
  if(typeof value === 'string') {
    if(!isNaN(value)) {
      value = parseFloat(value);
    }
    else
    if(value == 'top' || value == 'left') {
      value = 0;
    }
    else
    if(value == 'bottom' || value == 'right') {
      value = span;
    }
    else
    if(value.substr(-1) == '%') {
      const inverse = value.substr(0, 1) == '!';
      value = parseFloat(value.substr(inverse ? 1 : 0, value.length-1)) / 100;
      value = span * (inverse ? (1 - value) : value);
    }
    else
    if(value.substr(-2) == 'px') {
      const inverse = value.substr(0, 1) == '!';
      value = parseFloat(value.substr(inverse ? 1 : 0, value.length-2));
      value = inverse ? (span - value) : (0 + value);
    }
    else {
      throw new Error('invalid measure string');
    }
  }
  else
  if(typeof value === 'number') {
    value = value;
  }
  else {
    throw new Error('invalid measure data type');
  }
  return base + value;
};

export async function scroll(params) {
  // extract params
  let {
    container,
    target,
    easing,
    duration,
    stoppable,
    enqueue,
    failOnCancel,
    softFrameSkip,
  } = params;

  let skipHorizontal = false,
      skipVertical = false;

  // fix parameter
  if( typeof container === 'string' ) {
    container = document.querySelector(container);
  }
  if( typeof target === 'object' ) {
    if(typeof target.left === 'number' || typeof target.top === 'number') {
      const value = target;
      target = () => value;
    }
    else
    if(  target.element instanceof HTMLElement
      || typeof target.element === 'string'
    ) {
      const value = target;
      // resolve element function
      const resolveElement = () => {
        const element =
          (value.element instanceof HTMLElement)
            ? value.element
            : document.querySelector(value.element);
        if(!element) {
          throw new Error('could not find element');
        }
        return element;
      };
      // lookup container
      if(!container) {
        container = findContainer(
          resolveElement(),
          !!value.vertical,
          !!value.horizontal
        );
      }
      // handle skipIfVisible flag
      skipHorizontal = (typeof value.horizontal === 'undefined');
      skipVertical = (typeof value.vertical === 'undefined');
      if(value.skipIfVisible) {
        const element = resolveElement(),
              elementRect = getLocalClientRect(container, element),
              containerMetrics = getScrollMetrics(container);
        if(!skipHorizontal) {
          if(  elementRect.left >= containerMetrics.scrollPosition.left
            && elementRect.right < (containerMetrics.scrollPosition.left + containerMetrics.viewportSize.width)) {
            skipHorizontal = true;
          }
        }
        if(!skipVertical) {
          if(  elementRect.top >= containerMetrics.scrollPosition.top
            && elementRect.bottom < (containerMetrics.scrollPosition.top + containerMetrics.viewportSize.height)) {
            skipVertical = true;
          }
        }
      }
      // create target function
      target = () => {
        const element = resolveElement(),
              elementRect = getLocalClientRect(container, element),
              result = { };
        if(!skipHorizontal) {
          result.left = toPixel(elementRect.left, elementRect.width, value.horizontal);
        }
        if(!skipVertical) {
          result.top = toPixel(elementRect.top, elementRect.height, value.vertical);
        }
        return result;
      };
    }
  }
  if( typeof easing === 'string' ) {
    easing = easings[easing];
  }
  if( typeof easing === 'undefined' ) {
    easing = easings.easeInOutCubic;
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
  if( typeof softFrameSkip === 'undefined' ) {
    softFrameSkip = true;
  }

  // validate parameter
  validateContainer(container);
  validateTarget(target);
  validateEasing(easing);
  validateStoppable(stoppable);
  validateEnqueue(enqueue);
  validateFailOnCancel(failOnCancel);
  validateSoftFrameSkip(softFrameSkip);

  // get origin metrics
  const origin = getScrollMetrics(container).scrollPosition;

  // fix and validate duration
  if( typeof duration === 'function' ) {
    const targetValue = target();
    if(typeof targetValue.left !== 'undefined' && typeof targetValue.top !== 'undefined') {
      duration = duration({
        combined:
          Math.sqrt(
              Math.pow(Math.abs(targetValue.left-origin.left), 2)
            + Math.pow(Math.abs(targetValue.top-origin.top), 2)
          ),
        left: Math.abs(targetValue.left-origin.left),
        top: Math.abs(targetValue.top-origin.top),
      });
    }
    else
    if(typeof targetValue.left !== 'undefined') {
      duration = duration({
        combined: Math.abs(targetValue.left-origin.left),
        left: Math.abs(targetValue.left-origin.left),
      });
    }
    else
    if(typeof targetValue.top !== 'undefined') {
      duration = duration({
        combined: Math.abs(targetValue.top-origin.top),
        top: Math.abs(targetValue.top-origin.top),
      });
    }
    else {
      duration = duration({ total: 0 });
    }
  }
  validateDuration(duration);

  // skip if possible
  if(skipHorizontal && skipVertical) {
    return { status: 'skipped', progress: 0, duration };
  }

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
      easing,
      duration,
      stoppable,
      softFrameSkip,
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
    if( typeof container === 'string' ) {
      container = document.querySelector(container);
    }
    validateContainer(container);
    clearQueue(container);
  }
}
