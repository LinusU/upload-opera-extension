# Upload Opera Extension

Submit an update to a Opera Extension with one simple function call.

## Installation

```sh
npm install --save upload-opera-extension
```

## Usage

```js
const uploadOperaExtension = require('upload-opera-extension')

const options = {
  email: process.env.OPERA_EMAIL,
  password: process.env.OPERA_PASSWORD,
  extensionId: process.env.OPERA_EXT_ID,
  zipFile: 'my-extension.zip'
}

uploadOperaExtension(options).then(() => {
  console.log('Extension submitted for modernation 🙌')
})
```

## API

### `uploadOperaExtension(options) => Promise<void>`

Upload an extension to addons.opera.com.

- `options.email` (string) - Email used to log in
- `options.password` (string) - Password used to log in
- `options.extensionId` (string) - ID of the extension to submit a new version of
- `options.zipFile` (string) - Path to the zip file that will be submitted

The extension ID can be found by inspecting the URL of the extension in the developer dashboard.

Returns a Promise that will either reject with an error, or resolve to `undefined`.

## Debugging

If an environmental variable named `DEBUG_UPLOAD_OPERA_EXTENSION` is set to a non-empty value, a Chrome window will be visible during the execution and then stay open after the function is done.
