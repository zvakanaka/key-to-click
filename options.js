const textarea = document.getElementById('config')

const getInitialConfig = async () => {
  const config = await getConfig()
  
  textarea.value = JSON.stringify(config, null, 2)
}
getInitialConfig()

async function getConfig() {
  // https://github.com/mdn/webextensions-examples/blob/master/stored-credentials/storage.js
  const storedObj = await browser.storage.local.get();
  if (storedObj === null || typeof storedObj === 'undefined') {
    return {}
  }
  return storedObj;
}

async function setData(value, cb = () => {}) {
  await browser.storage.local.clear();
  await browser.storage.local.set(value);
  cb();
}

textarea.addEventListener('input', async () => {
  console.log('setting config', textarea.value)
  try {
    const textareaData = JSON.parse(textarea.value)
    setData(textareaData)
    textarea.style.outline = '1px solid blue'
  } catch (error) {
    console.log(`error parsing json: ${error}`)
    textarea.style.outline = '1px solid red'
  }
})