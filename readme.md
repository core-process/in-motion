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

| Parameter | Description | Example | Default Value |
| :--- | :--- | :--- | :--- |
| `container` | scroll-container, either an `HTMLElement` or a `Window` | `window` | container of `target.element` if provided |
| `target` | function which evaluates to target scroll coordinates | `() => { top }` | none |
|          | or object which describes target scroll coordinates in relation to an `HTMLElement`: | | |
| `target.element` | target element, either `HTMLElement` or a css selector string | `'.some .element'` | none |
| `target.vertical` | vertical position in relation to target element, valid formats are `/(top)|(bottom)|(!?-?\d+px)|(!?-?\d+%)/` (enables vertical scrolling) | `'-20px'` | none |
| `target.horizontal` | horizontal position in relation to target element, valid formats are `/(left)|(right)|(!?-?\d+px)|(!?-?\d+%)/` (enables horizontal scrolling) | `'-20px'` | none |
| `target.skipIfVisible` | skip scrolling if target element is visible within container  | `true` | `false` |
| `` |  | `` |
