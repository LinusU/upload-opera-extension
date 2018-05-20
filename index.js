const puppeteer = require('puppeteer')

async function uploadOperaExtension (options) {
  const debugModeEnabled = Boolean(process.env.DEBUG_UPLOAD_OPERA_EXTENSION)

  const browser = await puppeteer.launch({ headless: !debugModeEnabled, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  try {
    // Go to main page
    await page.goto('https://addons.opera.com')

    // Go to login page
    await page.click('a#login')

    // Perform login
    await page.type('input[name=email]', options.email)
    await page.type('input[name=password]', options.password)
    await page.click('button[type=submit]')
    await page.waitForSelector('div#account')

    // Go to extensions page
    await page.goto(`https://addons.opera.com/developer/package/${options.extensionId}/`)

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
        errorText = 'Unknown error occurde while uploading extension'
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
