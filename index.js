const puppeteer = require('puppeteer')

async function uploadOperaExtension (options) {
  const debugModeEnabled = Boolean(process.env.DEBUG_UPLOAD_OPERA_EXTENSION)

  const browser = await puppeteer.launch({ headless: !debugModeEnabled })
  const page = await browser.newPage()

  const url = `https://addons.opera.com/developer/package/${options.extensionId}/`;
  const cookie = [];

  if (process.env.OPERA_CSRF_TOKEN) {
    cookie.push({
      url,
      name: "csrftoken",
      value: process.env.OPERA_CSRF_TOKEN
    })
  }

  if (process.env.OPERA_SESSION_ID) {
    cookie.push({
      url,
      name: "sessionid",
      value: process.env.OPERA_SESSION_ID
    })
  }

  if (cookie.length) {
    await page.setCookie(...cookie)
  }

  try {
    // Directly go to the extension page - the browser will be redirected to the auth page and back once the login succeeded
    await page.goto(url)

    if (!cookie.length) {
      // Perform login
      await page.type('input[name=email]', options.email)
      await page.type('input[name=password]', options.password)
      await page.click('button[type=submit]')
    }

    // Wait for, and then click, "Versions"
    await page.waitForSelector('ul.nav .uib-tab:nth-child(2) a')
    await page.click('ul.nav .uib-tab:nth-child(2) a')

    // Wait for file uploader, and then select the zip file
    await page.waitForSelector('file-upload[on-upload*=upgradeAddon] input[type=file]')
    await page.$('file-upload[on-upload*=upgradeAddon] input[type=file]').then(i => i.uploadFile(options.zipPath))

    // Upload it
    await page.click('upload-label')
    await page.waitForSelector('ol.breadcrumb')

    // Wait for file to be uploaded, or for an error to appear
    try {
      await page.waitForSelector('[ng-click="submitForModeration()"]')
    } catch (_) {
      let errorText

      try {
        errorText = await page.evaluate(() => document.querySelector('flash-message div.alert span.ng-scope').innerText)
      } catch (_) {
        errorText = 'Unknown error occurred while uploading extension'
      }

      throw new Error(errorText)
    }

    // Submit for moderation
    await page.click('[ng-click="submitForModeration()"]')
  } finally {
    if (!debugModeEnabled) await browser.close()
  }
}

module.exports = uploadOperaExtension
