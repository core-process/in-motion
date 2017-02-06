import { scroll, stopScroll } from '../../';

setTimeout(
  async () => {
    const result = await scroll({
      container: document.querySelector('.container'),
      target: { element: '.target2', vertical: '-10%', skipIfVisible: false },
      easing: 'easeInOutCubic',
      duration: 3 * 1000,
    });
    console.log(JSON.stringify(result));
  },
  1 * 1000
);

setTimeout(
  () => {
    document.querySelector('.target2').style.marginTop = '200px';
  },
  2.5 * 1000
);
