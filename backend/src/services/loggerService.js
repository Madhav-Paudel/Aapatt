/**
 * Aapatt Emergency Superapp - Logger Service
 * Winston-based logging with different levels and transports
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format
  })
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Ensure logs directory exists
  const fs = require('fs');
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  );

  // Emergency-specific log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'emergency.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf((info) => {
          // Only log emergency-related events
          if (info.message.includes('emergency') || 
              info.message.includes('request') || 
              info.message.includes('provider') ||
              info.tags?.includes('emergency')) {
            return JSON.stringify(info);
          }
          return false;
        })
      ),
      maxsize: 50 * 1024 * 1024, // 50MB for emergency logs
      maxFiles: 10
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format,
  transports,
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true
});

// Add custom methods for emergency logging
logger.emergency = (message, meta = {}) => {
  logger.error(message, { ...meta, tags: ['emergency'] });
};

logger.request = (message, meta = {}) => {
  logger.info(message, { ...meta, tags: ['request'] });
};

logger.provider = (message, meta = {}) => {
  logger.info(message, { ...meta, tags: ['provider'] });
};

logger.socket = (message, meta = {}) => {
  logger.debug(message, { ...meta, tags: ['socket'] });
};

logger.auth = (message, meta = {}) => {
  logger.info(message, { ...meta, tags: ['auth'] });
};

logger.api = (message, meta = {}) => {
  logger.http(message, { ...meta, tags: ['api'] });
};

// Performance logging
logger.performance = (operation, duration, meta = {}) => {
  logger.info(`Performance: ${operation} completed in ${duration}ms`, {
    ...meta,
    tags: ['performance'],
    operation,
    duration
  });
};

// Security logging
logger.security = (message, meta = {}) => {
  logger.warn(message, { ...meta, tags: ['security'] });
};

// Database logging
logger.database = (message, meta = {}) => {
  logger.debug(message, { ...meta, tags: ['database'] });
};

// AI service logging
logger.ai = (message, meta = {}) => {
  logger.info(message, { ...meta, tags: ['ai'] });
};

// Notification logging
logger.notification = (message, meta = {}) => {
  logger.info(message, { ...meta, tags: ['notification'] });
};

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Error handling for logger
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down logger...');
  logger.end();
});

process.on('SIGTERM', () => {
  logger.info('Shutting down logger...');
  logger.end();
});

// Export logger
module.exports = logger;