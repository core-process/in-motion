import { getActiveQueues, getQueue, clearQueue } from './queueing.js';

function onInteraction(event) {
  let stopped = false;
  for(let container of getActiveQueues()) {
    const queue = getQueue(container);
    if(queue.length > 0 && queue[0].stoppable) {
      clearQueue(container);
      stopped = true;
    }
  }
  return stopped;
}

function onInteractionGulp(event) {
  const stopped = onInteraction(event);
  if(stopped && event) {
    event.stopPropagation();
    event.preventDefault();
  }
}

window.addEventListener('click', onInteraction, true);
window.addEventListener('contextmenu', onInteraction, true);
window.addEventListener('touchstart', onInteraction, true);
window.addEventListener('mousewheel', onInteraction, true);
window.addEventListener('DOMMouseScroll', onInteraction, true);
window.addEventListener('keypress', onInteractionGulp, true);
