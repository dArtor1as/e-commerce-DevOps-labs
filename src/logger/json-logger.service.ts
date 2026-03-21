import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLoggerService implements LoggerService {
  log(message: unknown) {
    this.printLog('INFO', message);
  }
  error(message: unknown) {
    this.printLog('ERROR', message);
  }
  warn(message: unknown) {
    this.printLog('WARN', message);
  }
  debug(message: unknown) {
    this.printLog('DEBUG', message);
  }
  verbose(message: unknown) {
    this.printLog('VERBOSE', message);
  }

  private printLog(level: string, message: unknown) {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    // Виводимо чіткий JSON у STDOUT без зайвих кольорів чи тексту
    process.stdout.write(JSON.stringify(logObject) + '\n');
  }
}
