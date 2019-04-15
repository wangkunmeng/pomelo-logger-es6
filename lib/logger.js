const fs = require('fs');
const util = require('util');
const log4js = require('log4js');

const funcs = {
  'env': function(name) {
    return process.env[name];
  },
  'args': function(name) {
    return process.argv[name];
  },
  'opts': function(name, opts) {
    return opts ? opts[name] : undefined;
  }
};

const Log = {
  config: null,

  async configure(config, opts) {
    if (this.config) {
      await util.promisify(log4js.shutdown)();
    }
    config = config || process.env.LOG4JS_CONFIG;
    opts = opts || {};
    if (typeof config === 'string') {
      config = JSON.parse(fs.readFileSync(config, 'utf8'));
    }
    if (config && config.appenders) {
      config.appenders = replaceProperties(config.appenders, opts);
    }
    if (config && config.lineDebug) {
      process.env.LOGGER_LINE = true;
    }
    if (config && config.rawMessage) {
      process.env.RAW_MESSAGE = true;
    }
    this.config = config;
    log4js.configure(this.config, opts);
  },

  getLogger(categoryName) {
    let args = arguments;
    let prefix = '';
    for (let i = 1; i < args.length; i++) {
      if (i !== args.length - 1) {
        prefix = prefix + args[i] + '] [';
      } else {
        prefix = prefix + args[i];
      }
    }
    if (typeof categoryName === 'string') {
      categoryName = categoryName.replace(process.cwd(), '');
    }
    let logger = log4js.getLogger(categoryName);
    let pLogger = {};
    for (let key in logger) {
      pLogger[key] = logger[key];
    }

    ['log', 'debug', 'info', 'warn', 'error', 'trace', 'fatal'].forEach(function(item) {
      pLogger[item] = function() {
        let p = '';
        if (process.env.RAW_MESSAGE === 'false') {
          if (args.length && process.env.LOGGER_LINE === 'true') {
            p += '[' + getLine() + '] ';
          }
          if (args.length > 1) {
            p += '[' + prefix + '] ';
          }
        }
        if (args.length) {
          arguments[0] = p + arguments[0];
        }
        logger[item].apply(logger, arguments);
      };
    });
    return pLogger;
  },

  level(categoryName = 'default') {
    return log4js.getLogger(categoryName).level.levelStr;
  },

  async reload(config) {
    await new Promise(res => {
      log4js.shutdown(() => {
        log4js.configure(Log.configure(config));
        res();
      });
    });
  },

  get debug() {
    return this.getLogger('default').debug;
  },

  get info() {
    return this.getLogger('default').info;
  },

  get warn() {
    return this.getLogger('default').warn;
  },

  get error() {
    return this.getLogger('error').error;
  }
};

function getLine() {
  let str = new Error().stack.split('\n')[3];
  if (process.platform === 'win32') {
    return str.match(/\\(\S*):/)[1];
  } else {
    return '/' + str.match(/\/(\S*):/)[1];
  }
}

function replaceProperties(configObj, opts) {
  if (typeof configObj !== 'object') {
    return configObj;
  }
  for (let f in configObj) {
    let field = configObj[f];
    if (typeof field === 'string') {
      configObj[f] = doReplace(field, opts);
    } else if (typeof field === 'object') {
      configObj[f] = replaceProperties(field, opts);
    }
  }
  return configObj;
}

function doReplace(src, opts) {
  if (!src) {
    return src;
  }

  let ptn = /\$\{(.*?)\}/g;
  let m, pro, ts, scope, name, defaultValue, func, res = '',
    lastIndex = 0;
  while ((m = ptn.exec(src))) {
    pro = m[1];
    ts = pro.split(':');
    if (ts.length !== 2 && ts.length !== 3) {
      res += pro;
      continue;
    }

    scope = ts[0];
    name = ts[1];
    if (ts.length === 3) {
      defaultValue = ts[2];
    }

    func = funcs[scope];
    if (!func && typeof func !== 'function') {
      res += pro;
      continue;
    }

    res += src.substring(lastIndex, m.index);
    lastIndex = ptn.lastIndex;
    res += (func(name, opts) || defaultValue);
  }

  if (lastIndex < src.length) {
    res += src.substring(lastIndex);
  }

  return res;
}

module.exports = Log;