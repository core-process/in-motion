import { scroll, stopScroll } from '../../';

const level1 = document.querySelector('.level1');
const level2 = document.querySelector('.level2');
const level3 = document.querySelector('.level3');

let targetTop = 500;

setTimeout(
  async () => {
    const result = await scroll({
      container: level1,
      target: () => ({ left: 0, top: targetTop }),
      easing: 'easeInOutCubic',
      duration: 3 * 1000,
    });
    console.log(JSON.stringify(result));
  },
  1 * 1000
);

/*
setTimeout(
  () => {
    console.log('set target top to new value');
    targetTop = 500;
  },
  2 * 1000
);
*/
