// Put all the javascript code here, that you want to execute after page load.
const log = (...args) => {
  console.log(...args)
}
log('key-to-click extension: this script loads on every page')

async function getHostConfig(host = tabHost) {
  // https://github.com/mdn/webextensions-examples/blob/master/stored-credentials/storage.js
  const storedObj = await browser.storage.local.get();
  if (storedObj === null || typeof storedObj === 'undefined') {
    return {}
  }
  if (storedObj.hasOwnProperty(host)) {
    return storedObj[host];
  } else {
    return {}
  }
}

// Listen for messages from the background script (popup.js)
browser.runtime.onMessage.addListener((message) => {
  if (message.command === 'send-data') {
    log('Received data from key-to-click popup', message.data);
  }
});

function isVisible(el) {
  // TODO: perhaps add check for other visibility tactics
  // - such as: aria-hidden="true", etc.
  if (window.getComputedStyle(el, null).display === 'none') {
    return false
  }
  if (el.parentElement) {
    return isVisible(el.parentElement)
  }
  return true
}

async function getConfig() {
  return getHostConfig(window.location.host)
}

function getVisibleElements(els) {
  const visibleElements = Array.from(els).filter(el => {
    return isVisible(el)
  })
  return visibleElements
}

function findElement(selector) {
  const elements = document.querySelectorAll(selector);
  const visibleElements = getVisibleElements(elements)

  if (visibleElements.length === 0) {
    const shadowElements = getVisibleElements(shadowSelectorAll(selector)) // fall back to searching through shadow DOM
    return shadowElements?.[0] || elements?.[0]
  }

  return visibleElements?.[0] || elements?.[0]
}

// Thank you nathnolt: https://stackoverflow.com/a/71787772/4151489
function shadowSelectorAll(selector, rootNode = document.body) {
  const arr = []
  const traverser = node => {
    // 1. decline all nodes that are not elements
    if (node.nodeType !== Node.ELEMENT_NODE) return

    // 2. add the node to the array, if it matches the selector
    if (node.matches(selector)) arr.push(node)

    // 3. loop through the children
    const children = node.children
    if (children.length) {
      for (const child of children) {
        traverser(child)
      }
    }

    // 4. check for shadow DOM, and loop through it's children
    const shadowRoot = node.shadowRoot
    if (shadowRoot) {
      const shadowChildren = shadowRoot.children
      for (const shadowChild of shadowChildren) {
        traverser(shadowChild)
      }
    }
  }

  traverser(rootNode)

  return arr
}

async function keyListener(ev) {
  // ignore keyboard events while typing in any of these elements
  // Enter (without shift) in a textarea overrides the input detection skip
  const enterWithoutShiftPressed = ev.key === 'Enter' && !ev.shiftKey
  // TODO: allow config to override this
  if (['SELECT', 'INPUT', 'TEXTAREA'].includes(ev.target.tagName) && !enterWithoutShiftPressed) {
    log(`Ignoring key event because target element is an ignored type of '${ev.target.tagName}' and 'Enter' key (without shift) is not pressed`)
    return
  }

  const currentConfig = await getConfig()
  if (currentConfig && Object.keys(currentConfig).length > 0) {
    log(ev.key, 'pressed')
    let foundConfigKey = null
    Object.entries(currentConfig).forEach(([key, selector]) => {
      const { key: keyPressed } = ev;
      if (keyPressed === key) {
        foundConfigKey = key
        const element = findElement(selector)
        if (element) {
          element.click()
          ev.preventDefault()
        } else log(`Selector '${selector}' found no element`);
      }
    });
    if (foundConfigKey) {
      log('Element for key:', currentConfig[ev.key])
      foundConfigKey = false
    } else {
      log('No configured element for key:', ev.key)
    }
  } else {
    log(`No key-to-click config found for '${window.location.host}'`)
  }
}
document.addEventListener('keyup', keyListener);
