/**
 * Debug logger utility for tracking Appwrite initialization and requests
 */

// Store logs in memory for access from debug UI
let memoryLogs: {timestamp: Date, level: string, message: string, data?: any}[] = [];

// Maximum number of logs to keep in memory
const MAX_LOGS = 1000;

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Check if debug mode is enabled via environment variable
const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === 'true';

/**
 * Add a log entry
 */
export function log(level: LogLevel, message: string, data?: any) {
  const entry = {
    timestamp: new Date(),
    level,
    message,
    data
  };
  
  // Store in memory
  memoryLogs.push(entry);
  
  // Trim old logs if needed
  if (memoryLogs.length > MAX_LOGS) {
    memoryLogs = memoryLogs.slice(memoryLogs.length - MAX_LOGS);
  }
  
  // Only log to console if debug is enabled
  if (DEBUG_ENABLED || level === 'error') {
    const formattedMessage = `[${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }
  }
}

/**
 * Debug level logging
 */
export function debug(message: string, data?: any) {
  log('debug', message, data);
}

/**
 * Info level logging
 */
export function info(message: string, data?: any) {
  log('info', message, data);
}

/**
 * Warning level logging
 */
export function warn(message: string, data?: any) {
  log('warn', message, data);
}

/**
 * Error level logging
 */
export function error(message: string, data?: any) {
  log('error', message, data);
}

/**
 * Get all logs stored in memory
 */
export function getLogs() {
  return [...memoryLogs];
}

/**
 * Clear all logs from memory
 */
export function clearLogs() {
  memoryLogs = [];
}

// Export a default object with all methods
export default {
  log,
  debug,
  info,
  warn,
  error,
  getLogs,
  clearLogs
};