pomelo-logger-es6
========

pomelo-logger-es6 is a [log4js](https://github.com/nomiddlename/log4js-node) wrapper for [pomelo](https://github.com/NetEase/pomelo) which provides some useful features.  

## 和pomelo-logger的关系

1. pomelo-logger-es6是pomelo-logger根据最新规范和模块所写

## Installation

```
npm install pomelo-logger-es6
```

## Features

### log prefix
besides category, you can output prefix as you like in your log  
prefix can be filename, serverId, serverType, host etc  
to use this feature, you just pass prefix params to getLogger function  
```
const logger = require('pomelo-logger-es6').getLogger(category, prefix1, prefix2, ...);
```
 log output msg will output with prefix ahead

### get line number in debug
when in debug environment, you may want to get the line number of the log  
to use this feature, add this code
```
process.env.LOGGER_LINE = true;
```

in pomelo, you just configure the log4js file and set **lineDebug** for true  
```
{
  "appenders": {
  },

  "category": {
  },

  "lineDebug": true
}
```

### log raw messages
in raw message mode, your log message will be simply your messages, no prefix and color format strings  
to use this feature, add this code  
```
process.env.RAW_MESSAGE = true;
```

in pomelo, you just configure the log4js file and set **rawMessage** for true  
```
{
  "appenders": {
  },

  "levels": {
  },

  "rawMessage": true
}
```

## Example

``` json
{
  "appenders": {
    "console": {
      "type": "console"
    },
    "rpc-log": {
      "type": "file",
      "filename": "./logs/rpc-log-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "backups": 5
    }
  },
  "categories": {
    "default": {
      "appenders": [
        "console"
      ],
      "level": "debug"
    },
    "rpc-log": {
      "appenders": [
        "rpc-log",
        "console"
      ],
      "level": "error"
    }
  },
  "rawMessage": false,
  "lineDebug": true
}
```

log.js
```
require('pomelo-logger-es6').configure(require('./log4js.json'), {serverId: 'dummy'});
const logger = require('pomelo-logger-es6').getLogger('rpc-log', __filename, process.pid);

process.env.LOGGER_LINE = true;
logger.info('test1');
logger.warn('test2');
logger.error('test3');
```

MIT License

Copyright (c) 2019 wangkunmeng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
