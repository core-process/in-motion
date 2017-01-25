import { scroll, stopScroll } from '../../';

const level1 = document.querySelector('.level1');
const level2 = document.querySelector('.level2');
const level3 = document.querySelector('.level3');

setTimeout(
  () => {
    for(let i=0; i<2; ++i) {
      scroll({
        container: level1,
        target: () => ({ left: 0, top: 150 }),
        transition: (origin, target, progress) => ({ left: 0, top: 150 * progress }),
        duration: 2 * 1000,
        stoppable: true,
        enqueue: true,
        failOnCancel: false,
      })
        .then((result) => { console.log('level 1 scrolling no. ' + i + ' ' + result.status, JSON.stringify(result)); })
        .catch((error) => { console.log(error.message); });
      scroll({
        container: level2,
        target: () => ({ left: 0, top: 150 }),
        transition: (origin, target, progress) => ({ left: 0, top: 150 * progress }),
        duration: 2 * 1000,
        stoppable: true,
        enqueue: true,
        failOnCancel: true,
      })
        .then((result) => { console.log('level 2 scrolling no. ' + i + ' ' + result.status, JSON.stringify(result)); })
        .catch((error) => { console.log(error.message); });
    }
  },
  1 * 1000
);

setTimeout(
  () => {
    stopScroll();
  },
  2 * 1000
);
