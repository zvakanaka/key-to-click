document.getElementById('myHeading').style.color = 'blue'
const textarea = document.getElementById('config')

let tabHost = null
const getInitialConfig = async (tabs) => {
  const currentTab = tabs[0] // the tab that opened this popup
  tabHost = new URL(currentTab.url).host
  const hostConfig = await getHostConfig()
  console.log(`hostConfig for ${tabHost}: ${JSON.stringify(hostConfig, null, 2)}`)
  
  textarea.value = JSON.stringify(hostConfig, null, 2)
}
try {
  browser.tabs.query({ active: true, currentWindow: true }, getInitialConfig);
} catch (error) {
  browser.tabs.query({ active: true, currentWindow: true }).then(getInitialConfig);
}

async function setData(value, cb = () => {}) {
  console.log(`setting data for ${tabHost}`)
  await browser.storage.local.set({ [tabHost]: value });
  cb();
}

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

textarea.addEventListener('input', async e => {
  console.log('sending data', textarea.value)
  try {
    const textareaData = JSON.parse(textarea.value)
    setData(textareaData)
    sendData(textarea.value)
  } catch (error) {
    console.log(`error parsing json: ${error}`)
  }
})

const sendDataToTab = (queryTabs) => {
  queryTabs.forEach(tab => {
    if (tab.url.startsWith('about:')) {
      return;
    }
    browser.tabs.sendMessage(tab.id, {
      command: 'send-data',
      data
    });
  });
}
function tabToSendDataTo(_tabs, data) {
  // https://developer.chrome.com/extensions/tabs#method-query
  try {
    browser.tabs.query({}, sendDataToTab)
  } catch (error) {
    browser.tabs.query({}).then(sendDataToTab)
  }
}
function reportError(err) {
  console.error(`Failed to send data to tab: ${err}`);
}
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_second_WebExtension
function sendData(data) {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => tabToSendDataTo(tabs, data))
    .catch(reportError);
}