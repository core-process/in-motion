
export function findContainer(element, vertical, horizontal) {
  // top-level container case
  if(  element instanceof Window
    || element.tagName == 'HTML'
    || element.tagName == 'BODY'
  ) {
    return null;
  }
  // get parent element and check for top-level container
  var container = element.parentNode;
  if(  element instanceof Window
    || container.tagName == 'HTML'
    || container.tagName == 'BODY'
  ) {
    return element.ownerDocument.defaultView;
  }
  // check for intermediate container
  var style = getComputedStyle(container);
  if(  vertical
    && container.scrollHeight > container.clientHeight
    && (style.overflowY == 'auto' || style.overflowY == 'scroll')
  ) {
    return container;
  }
  if(  horizontal
    && container.scrollWidth > container.clientWidth
    && (style.overflowX == 'auto' || style.overflowX == 'scroll')
  ) {
    return container;
  }
  // check for container of parent
  return findContainer(container, vertical, horizontal);
}
