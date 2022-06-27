// Put all the javascript code here, that you want to execute after page load.
console.log('key-to-click extension: this script loads on every page')

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
    console.log('Received data from key-to-click popup', message.data);
  }
});

async function getConfig() {
  return getHostConfig(window.location.host)
}

function findElement(selector) {
  let element = document.querySelector(selector);

  if (document.querySelectorAll(selector).length > 1) {
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
    const visibleElements = Array.from(document.querySelectorAll(selector)).filter(el => {
      return isVisible(el)
    })
    if (visibleElements.length > 0) {
      if (visibleElements.length > 1) {
        console.log('More than one visible element found for selector:', selector);
        console.log('\t- picking first element', visibleElements)
      }
      element = visibleElements[0]
    } else if (element) {
      console.log('No visible element found for selector:', selector, '\n\t- falling back to first element found', element);
    }
  }

  return element || shadowSelectorAll(selector)?.[0] // fall back to searching through shadow DOM
}

// Thank you nathnolt: https://stackoverflow.com/a/71787772/4151489
function shadowSelectorAll(selector, rootNode = document.body) {
  const arr = []
  const traverser = node => {
      // 1. decline all nodes that are not elements
      if(node.nodeType !== Node.ELEMENT_NODE) return

      // 2. add the node to the array, if it matches the selector
      if(node.matches(selector)) arr.push(node)

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
          for(const shadowChild of shadowChildren) {
              traverser(shadowChild)
          }
      }
  }

  traverser(rootNode)

  return arr
}

async function keyListener(e) {
  // ignore keyboard events while typing in any of these elements
  // Enter (without shift) in a textarea overrides the input detection skip
  const enterWithoutShiftPressed = e.key === 'Enter' && !e.shiftKey
  // TODO: allow config to override this
  if (['SELECT', 'INPUT', 'TEXTAREA'].includes(e.target.tagName) && !enterWithoutShiftPressed) {
    console.log(`Ignoring key event because target element is an ignored type of '${e.target.tagName}' and 'Enter' key (without shift) is not pressed`)
    return
  }

  const currentConfig = await getConfig()
  if (currentConfig && Object.keys(currentConfig).length > 0) {
    console.log(e.key, 'pressed')
    let foundConfigKey = null
    Object.entries(currentConfig).forEach(([key, selector]) => {
      const { key: keyPressed } = e;
      if (keyPressed === key) {
        foundConfigKey = key
        const element = findElement(selector)
        if (element) {
          element.click()
          e.preventDefault()
        } else console.log(`Selector '${selector}' found no element`);
      }
    });
    if (foundConfigKey) {
      console.log('Element for key:', currentConfig[e.key])
      foundConfigKey = false
    } else {
      console.log('No configured element for key:', e.key)
    }
  } else {
    console.log(`No key-to-click config found for '${window.location.host}'`)
  }
}
document.addEventListener('keyup', keyListener);