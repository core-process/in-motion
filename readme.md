# in-motion

``in-motion`` is an excellent library for a smooth scroll experience, which supports handling of frame skips, sub-containers, scroll-stop on user interaction, and fluid adjustment if scroll-target relocates.

![npm downloads total](https://img.shields.io/npm/dt/in-motion.svg) ![npm version](https://img.shields.io/npm/v/in-motion.svg) ![npm license](https://img.shields.io/npm/l/in-motion.svg)

## Features

* supports queueing of scroll-request per scroll-container
* handles frame skips gracefully
* supports scrolling of sub-containers
* supports automatic detection of scroll-container
* allows cancellation of scrolling on user interaction
* fluid adjustment if scroll-target relocates while scrolling

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

The module exports the functions ``scroll({ ... }) -> Promise`` and ``stopScroll(container)``.

### scroll

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
| `stoppable` | stoppable by user interaction, e.g. mouse click, key press or mouse scrolling | `false` | `true` |
| `enqueue` | enqueue scrolling request instead of overriding all queued requests  | `false` | `true` |
| `failOnCancel` | fail promise if scrolling request gets cancelled | `true` | `false` |
| `softFrameSkip` | soften up frame skips by pausing if frame skip gets detected  | `false` | `true` |
