const log = require('../lib/logger');
log.configure(require('./log4js.json'), {serverId: 12});
let logger = log.getLogger('rpc-log', __filename, process.pid);

process.env.LOGGER_LINE = true;
process.env.RAW_MESSAGE = true;

logger.info('test1');
logger.warn('test2');
logger.error('test3');