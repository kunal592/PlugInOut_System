import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

interface LogContext {
    context?: string;
    traceId?: string;
    userId?: string;
    toolSlug?: string;
    [key: string]: unknown;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements NestLoggerService {
    private context?: string;
    private logLevel: LogLevel;

    private readonly levelPriority: Record<LogLevel, number> = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        verbose: 4,
    };

    constructor(private readonly configService: ConfigService) {
        this.logLevel = this.configService.get<LogLevel>('LOG_LEVEL', 'info');
    }

    setContext(context: string) {
        this.context = context;
    }

    private shouldLog(level: LogLevel): boolean {
        return this.levelPriority[level] <= this.levelPriority[this.logLevel];
    }

    private formatMessage(
        level: LogLevel,
        message: string,
        context?: LogContext,
    ): string {
        const timestamp = new Date().toISOString();
        const ctx = context?.context || this.context || 'Application';

        const baseLog = {
            timestamp,
            level: level.toUpperCase(),
            context: ctx,
            message,
            ...context,
        };

        // In production, output structured JSON
        if (process.env.NODE_ENV === 'production') {
            return JSON.stringify(baseLog);
        }

        // In development, output human-readable format
        const colorMap: Record<LogLevel, string> = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[32m',  // Green
            debug: '\x1b[36m', // Cyan
            verbose: '\x1b[35m', // Magenta
        };
        const reset = '\x1b[0m';

        return `${colorMap[level]}[${level.toUpperCase()}]${reset} ${timestamp} [${ctx}] ${message}`;
    }

    log(message: string, context?: string | LogContext) {
        if (!this.shouldLog('info')) return;
        const ctx = typeof context === 'string' ? { context } : context;
        console.log(this.formatMessage('info', message, ctx));
    }

    error(message: string, trace?: string, context?: string | LogContext) {
        if (!this.shouldLog('error')) return;
        const ctx = typeof context === 'string' ? { context } : context;
        console.error(this.formatMessage('error', message, ctx));
        if (trace) {
            console.error(trace);
        }
    }

    warn(message: string, context?: string | LogContext) {
        if (!this.shouldLog('warn')) return;
        const ctx = typeof context === 'string' ? { context } : context;
        console.warn(this.formatMessage('warn', message, ctx));
    }

    debug(message: string, context?: string | LogContext) {
        if (!this.shouldLog('debug')) return;
        const ctx = typeof context === 'string' ? { context } : context;
        console.debug(this.formatMessage('debug', message, ctx));
    }

    verbose(message: string, context?: string | LogContext) {
        if (!this.shouldLog('verbose')) return;
        const ctx = typeof context === 'string' ? { context } : context;
        console.log(this.formatMessage('verbose', message, ctx));
    }

    /**
     * Create a child logger with additional context
     */
    child(additionalContext: LogContext): AppLogger {
        const childLogger = new AppLogger(this.configService);
        childLogger.context = additionalContext.context || this.context;
        return childLogger;
    }
}
