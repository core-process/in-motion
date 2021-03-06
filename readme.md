# in-motion

An excellent library for a smooth scrolling experience, which supports handling of frame skips, sub-containers, scroll-stop on user interaction, and fluid adjustment if scroll-target relocates.

![npm downloads total](https://img.shields.io/npm/dt/in-motion.svg) ![npm version](https://img.shields.io/npm/v/in-motion.svg) ![npm license](https://img.shields.io/npm/l/in-motion.svg)

## Features

* supports queueing of scroll-request per scroll-container
* handles frame skips gracefully
* supports scrolling of sub-containers
* supports automatic detection of scroll-container
* allows cancellation of scrolling on user interaction
* fluid adjustment if scroll-target relocates while scrolling

### Examples

Scroll `'.container'` to `'-10%'` of targets height before `'.target'` within 3 seconds using `'easeInOutCubic'` easing:

```js
scroll({
  container: '.container',
  target: { element: '.target', vertical: '-10%' },
  easing: 'easeInOutCubic',
  duration: 3 * 1000,
});
```

Scroll window to top of `'.target'` within 3 seconds using `'swing'` easing:

```js
scroll({
  container: window,
  target: { element: '.target', vertical: 'top' },
  easing: 'swing',
  duration: 3 * 1000,
});
```

Scroll automatically detected container to top of `someElement` using custom easing and a function to derive duration from pixel distance:

```js
scroll({
  target: { element: someElement, vertical: 'top' },
  easing: (x) => x,
  duration: (distance) => distance.combined * 10,
});
```

Clear all scrolling requests of container `'.container'`:

```js
stopScroll('.container');
```

## Installation

Install the `in-motion` module via

```sh
npm install in-motion --save
```

or

```sh
yarn add in-motion
```

## Usage

The module exports the functions ``scroll`` to enqueue a scrolling request and ``stopScroll`` to cancel all or specific scroll requests.

### Scroll Request

The function ``scroll`` exposes the signature ``(options) -> Promise``. The promise returns once the scrolling request had been executed successfully. The following options are provided:

| Parameter | Description | Example | Default Value |
| :--- | :--- | :--- | :--- |
| `container` | scroll-container, either an `HTMLElement` or a `Window` | `window` | container of `target.element` in case it is provided |
| `target` | function which evaluates to target scroll coordinates `{ left, top }` | `() => ({ top })` | none |
|          | or object which describes target scroll coordinates in relation to an element: | | |
| `target.element` | target element, either `HTMLElement` or a css selector string | `'.some .element'` | none |
| `target.vertical` | vertical position in relation to target element, valid formats are `/(top)|(bottom)|(!?-?\d+px)|(!?-?\d+%)/` (enables vertical scrolling) | `'-20px'` | none |
| `target.horizontal` | horizontal position in relation to target element, valid formats are `/(left)|(right)|(!?-?\d+px)|(!?-?\d+%)/` (enables horizontal scrolling) | `'-20px'` | none |
| `target.skipIfVisible` | skip scrolling if target element is visible within container  | `true` | `false` |
| `easing` | easing behavior of scrolling animation, either a string or a function of signature `(x) => y` where `0 <= x <= 1` | `'swing'` | `'easeInOutCubic'` |
| `duration` | duration of scrolling animation in milliseconds | `3 * 1000` | none |
|            | or as a function deriving milliseconds from pixel distance | `(distance) => distance.combined * 10` | none |
| `stoppable` | stoppable by user interaction, e.g. mouse click, key press or mouse scrolling | `false` | `true` |
| `enqueue` | enqueue scrolling request instead of overriding all queued requests  | `false` | `true` |
| `failOnCancel` | fail promise if scrolling request gets cancelled | `true` | `false` |
| `softFrameSkip` | soften up frame skips by pausing if frame skip gets detected  | `false` | `true` |

### Clear Requests

The function ``stopScroll`` exposes the signatures ``()`` to clear all scrolling requests and ``(container)`` to clear all scrolling requests of a container.
