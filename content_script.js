// Put all the javascript code here, that you want to execute after page load.
console.log('key-to-click extension: this script loads on every page')

async function getHostConfig(host = tabHost) {
  console.log(`getting config for ${host}`)
  // https://github.com/mdn/webextensions-examples/blob/master/stored-credentials/storage.js
  const storedObj = await browser.storage.local.get();
  if (storedObj === null || typeof storedObj === 'undefined') {
    return {}
  }
  if (storedObj.hasOwnProperty(host)) {
    console.log('hostConfig', storedObj[host])
    return storedObj[host];
  } else {
    return {}
  }
}

// Listen for messages from the background script (popup.js)
browser.runtime.onMessage.addListener((message) => {
  if (message.command === 'send-data') {
    console.log('received data from popup', message.data);
  }
});

async function getConfig() {
  return getHostConfig(window.location.host)
}

document.addEventListener('keyup', async e => {
  const currentConfig = await getConfig()
  if (currentConfig && Object.keys(currentConfig).length > 0) {
    console.log(e.key, 'pressed')
    let foundConfigKey = null
    Object.entries(currentConfig).forEach(([key, selector]) => {
      const { key: keyPressed } = e;
      foundConfigKey = key
      if (keyPressed === key) {
        const element = document.querySelector(selector);
        if (element) {
          if (document.querySelectorAll(selector).length > 1) {
            console.log('More than one element found for selector:', selector);
          }
          element.click()
        }
        else console.log(`selector '${selector}' found no element`);
      }
    });
    if (foundConfigKey) {
      console.log('element for key:', currentConfig[e.key])
      foundConfigKey = false
    } else {
      console.log('no configured element for key:', e.key)
    }
  } else {
    console.log(`no key-to-click config found for '${window.location.host}'`)
  }
});