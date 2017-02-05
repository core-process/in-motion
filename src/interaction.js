import { getActiveQueues, getQueue, clearQueue } from './queueing.js';

function onInteraction(event) {
  for(let container of getActiveQueues()) {
    const queue = getQueue(container);
    if(queue.length > 0 && queue[0].stoppable) {
      clearQueue(container);
    }
  }
}

function onInteractionGulp(event) {
  if(event) {
    event.stopPropagation();
    event.preventDefault();
  }
  onInteraction(event);
}

window.addEventListener('click', onInteraction, true);
window.addEventListener('contextmenu', onInteraction, true);
window.addEventListener('touchstart', onInteraction, true);
window.addEventListener('mousewheel', onInteraction, true);
window.addEventListener('DOMMouseScroll', onInteraction, true);
window.addEventListener('keypress', onInteractionGulp, true);
