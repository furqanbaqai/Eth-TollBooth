# Step 2: Readme

## Issues and Remedial Action

### Issue#1: Error while installing node.js prerequisite modules
Following error occurred while installing node.js modules:
```
npm ERR! path /home/vagrant/DAPPS/furqanbaqai-code/node_modules/block-stream
npm ERR! code EPERM
npm ERR! errno -1
npm ERR! syscall rename
npm ERR! Error: EPERM: operation not permitted, rename '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/block-stream' -> '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/.block-stream.DELETE'
npm ERR!  { Error: EPERM: operation not permitted, rename '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/block-stream' -> '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/.block-stream.DELETE'
npm ERR!   cause:
npm ERR!    { Error: EPERM: operation not permitted, rename '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/block-stream' -> '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/.block-stream.DELETE'
npm ERR!      errno: -1,
npm ERR!      code: 'EPERM',
npm ERR!      syscall: 'rename',
npm ERR!      path: '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/block-stream',
npm ERR!      dest: '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/.block-stream.DELETE' },
npm ERR!   stack: 'Error: EPERM: operation not permitted, rename \'/home/vagrant/DAPPS/furqanbaqai-code/node_modules/block-stream\' -> \'/home/vagrant/DAPPS/furqanbaqai-code/node_modules/.block-stream.DELETE\'',
npm ERR!   errno: -1,
npm ERR!   code: 'EPERM',
npm ERR!   syscall: 'rename',
npm ERR!   path: '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/block-stream',
npm ERR!   dest: '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/.block-stream.DELETE',
npm ERR!   parent: 'truffle-init-webpack' }
npm ERR!
npm ERR! Please try running this command again as root/Administrator.

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/vagrant/.npm/_logs/2018-09-21T07_33_26_684Z-debug.log
```
#### Solution
Ran installation command using root access: `$ sudo npm install`. 
Following was the output log:
```
npm WARN deprecated babel-preset-es2015@6.24.1: 🙌  Thanks for using Babel: we recommend using babel-preset-env now: please read babeljs.io/env to update!
npm WARN deprecated browserslist@1.7.7: Browserslist 2 could fail on reading Browserslist >3.0 config used in other tools.
[            ......] / extract:core-js: sill pacote core-js@https://registry.npmjs.org/core-js/-/core-js-2.5.7.tgz extracted to /
npm WARN rollback Rolling back webpack@4.19.1 failed (this is probably harmless): ETXTBSY: text file is busy, rmdir '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/webpack/node_modules'
npm WARN babel-loader@6.4.1 requires a peer of webpack@1 || 2 || ^2.1.0-beta || ^2.2.0-rc but none is installed. You must install peer dependencies yourself.
npm WARN html-webpack-plugin@2.30.1 requires a peer of webpack@1 || ^2 || ^2.1.0-beta || ^2.2.0-rc || ^3 but none is installed. You must install peer dependencies yourself.
npm WARN ajv-errors@1.0.0 requires a peer of ajv@>=5.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN truffle-init-webpack@0.0.2 No repository field.
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.4 (node_modules/webpack/node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.4: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.4 (node_modules/webpack-dev-server/node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.4: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.1.2 (node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.1.2: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

npm ERR! path ../atob/bin/atob.js
npm ERR! code EPROTO
npm ERR! errno -71
npm ERR! syscall symlink
npm ERR! EPROTO: protocol error, symlink '../atob/bin/atob.js' -> '/home/vagrant/DAPPS/furqanbaqai-code/node_modules/.bin/atob'

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/vagrant/.npm/_logs/2018-09-21T08_01_08_006Z-debug.log
```

### Issue#2: Error while running `truffle test`
Following error was coming when running `truffle test`:
```
/usr/lib/node_modules/truffle/build/webpack:/packages/truffle-contract/contract.js:437
                return reject(new Error("Cannot create instance of " + self.contractName + "; no code at address " + address));
^
Error: Cannot create instance of TollBoothOperator; no code at address 0x0000000000000000000000000000000000000000
    at Object.callback (/usr/lib/node_modules/truffle/build/webpack:/packages/truffle-contract/contract.js:437:1)
    at /usr/lib/node_modules/truffle/build/webpack:/~/web3/lib/web3/method.js:142:1
    at /usr/lib/node_modules/truffle/build/webpack:/~/web3/lib/web3/requestmanager.js:89:1
    at /usr/lib/node_modules/truffle/build/webpack:/packages/truffle-provider/wrapper.js:134:1
    at XMLHttpRequest.request.onreadystatechange (/usr/lib/node_modules/truffle/build/webpack:/~/web3/lib/web3/httpprovider.js:128:1)
    at XMLHttpRequestEventTarget.dispatchEvent (/usr/lib/node_modules/truffle/build/webpack:/~/xhr2/lib/xhr2.js:64:1)
    at XMLHttpRequest._setReadyState (/usr/lib/node_modules/truffle/build/webpack:/~/xhr2/lib/xhr2.js:354:1)
    at XMLHttpRequest._onHttpResponseEnd (/usr/lib/node_modules/truffle/build/webpack:/~/xhr2/lib/xhr2.js:509:1)
    at IncomingMessage.<anonymous> (/usr/lib/node_modules/truffle/build/webpack:/~/xhr2/lib/xhr2.js:469:1)
    at IncomingMessage.emit (events.js:187:15)
    at endReadableNT (_stream_readable.js:1086:12)
    at process._tickCallback (internal/process/next_tick.js:63:19)
```

### Issue#3: Error while compiling webpages using `webpack-cli` 
Following issue was coming while compiling web application:
```
baqai@ubuntu:~/Documents/b9labs/final/furqanbaqai-code$ ./node_modules/.bin/webpack-cli 
Hash: d917ba83910b66eafa85
Version: webpack 4.20.2
Time: 7131ms
Built at: 10/08/2018 7:29:18 AM
 2 assets
Entrypoint main = app.js app.js.map
[0] ./app/scripts/index.js 272 bytes {0} [built] [failed] [1 error]

ERROR in ./app/scripts/index.js
Module build failed (from ./node_modules/babel-loader/lib/index.js):
TypeError: Cannot read property 'babel' of undefined
    at Object.module.exports (/home/baqai/Documents/b9labs/final/furqanbaqai-code/node_modules/babel-loader/lib/index.js:103:36)
```
#### Solution
Babel library was installed using command: `npm install babel-loader@7 babel-core`

### Issue#4: Error while compiling webpages using `webpack-cli` (Post Issue#3)

```
baqai@ubuntu:~/Documents/b9labs/final/furqanbaqai-code$ ./node_modules/.bin/webpack-cli 
Hash: 6d00ca02d42c3eb836ca
Version: webpack 4.20.2
Time: 6805ms
Built at: 10/08/2018 7:42:28 AM
 2 assets
Entrypoint main = app.js app.js.map
[23] (webpack)/buildin/global.js 509 bytes {0} [built]
[36] (webpack)/buildin/module.js 519 bytes {0} [built]
[53] ./app/scripts/index.js 3.91 KiB {0} [built]
    + 157 hidden modules

ERROR in ./app/scripts/index.js
Module not found: Error: Can't resolve '../../build/contracts/MetaCoin.json' in '/home/baqai/Documents/b9labs/final/furqanbaqai-code/app/scripts'
 @ ./app/scripts/index.js 13:16-62

ERROR in ./app/scripts/index.js
Module not found: Error: Can't resolve '../stylesheets/app.css' in '/home/baqai/Documents/b9labs/final/furqanbaqai-code/app/scripts'
 @ ./app/scripts/index.js 3:0-33

```
#### Solution
Path to stylesheet was changed to `import "../styles/app.css";` 

### Issue#5: Unhandled exception coming while calling getBalance Promise
```
Unhandled rejection u@http://localhost:8000/app.js:1:21353
i.prototype.formatInput/<@http://localhost:8000/app.js:1:31850
i.prototype.formatInput@http://localhost:8000/app.js:1:31803
i.prototype.toPayload@http://localhost:8000/app.js:1:32047
t@http://localhost:8000/app.js:1:32356
y@http://localhost:8000/app.js:25:102152
getAccounts/<@http://localhost:8000/app.js:8:84394
c@http://localhost:8000/app.js:25:120494
e.exports</<[22]</f.exports/E.prototype._settlePromiseFromHandler@http://localhost:8000/app.js:25:93722
e.exports</<[22]</f.exports/E.prototype._settlePromise@http://localhost:8000/app.js:25:94522
e.exports</<[22]</f.exports/E.prototype._settlePromise0@http://localhost:8000/app.js:25:95221
e.exports</<[22]</f.exports/E.prototype._settlePromises@http://localhost:8000/app.js:25:96573
e.exports</<[22]</f.exports/E.prototype._fulfill@http://localhost:8000/app.js:25:95591
e.exports</<[20]</t.exports/<@http://localhost:8000/app.js:25:84353
t/<@http://localhost:8000/app.js:1:38262
a.prototype.sendAsync/<@http://localhost:8000/app.js:8:91474
i.prototype.sendAsync/f.onreadystatechange@http://localhost:8000/app.js:25:44686 
```
### Pre-requisites for webap building and execution
1. Install babel libraries:`npm install babel-loader@7 babel-core`
2. Install create-html library: `npm install create-html --save-dev`
3. Install file loader libraries:`npm install file-loader --save-dev`
4. Install jquery library: `npm install jquery --save-dev` 