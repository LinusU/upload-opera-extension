const puppeteer = require('puppeteer')
const maxWaitTIme = process.env.UPLOAD_OPERA_EXTENSION_MAX_WAIT_TIME || 30000;

async function uploadOperaExtension (options) {
  const debugModeEnabled = Boolean(process.env.DEBUG_UPLOAD_OPERA_EXTENSION)

  const browser = await puppeteer.launch({ headless: !debugModeEnabled })
  const page = await browser.newPage()

  try {
    // Directly go to the extension page - the browser will be redirected to the auth page and back once the login succeeded
    await page.goto(`https://addons.opera.com/developer/package/${options.extensionId}/`, { timeout: maxWaitTIme })

    // Perform login
    await page.type('input[name=email]', options.email, { timeout: maxWaitTIme })
    await page.type('input[name=password]', options.password, { timeout: maxWaitTIme })
    await page.click('button[type=submit]', { timeout: maxWaitTIme })

    // Wait for, and then click, "Versions"
    await page.waitForSelector('ul.nav .uib-tab:nth-child(2) a', { timeout: maxWaitTIme })
    await page.click('ul.nav .uib-tab:nth-child(2) a', { timeout: maxWaitTIme })

    // Wait for file uploader, and then select the zip file
    await page.waitForSelector('file-upload[on-upload*=upgradeAddon] input[type=file]', { timeout: maxWaitTIme })
    await page.$('file-upload[on-upload*=upgradeAddon] input[type=file]', { timeout: maxWaitTIme }).then(i => i.uploadFile(options.zipPath))

    // Upload it
    await page.click('upload-label', { timeout: maxWaitTIme })
    await page.waitForSelector('ol.breadcrumb', { timeout: maxWaitTIme })

    // Wait for file to be uploaded, or for an error to appear
    try {
      await page.waitForSelector('[ng-click="submitForModeration()"]', { timeout: maxWaitTIme })
    } catch (_) {
      let errorText

      try {
        errorText = await page.evaluate(() => document.querySelector('flash-message div.alert span.ng-scope').innerText, { timeout: maxWaitTIme })
      } catch (_) {
        errorText = 'Unknown error occurred while uploading extension'
      }

      throw new Error(errorText)
    }

    // Submit for moderation
    await page.click('[ng-click="submitForModeration()"]', { timeout: maxWaitTIme })
  } finally {
    if (!debugModeEnabled) await browser.close()
  }
}

module.exports = uploadOperaExtension
