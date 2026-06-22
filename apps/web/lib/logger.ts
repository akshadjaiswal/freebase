type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = { level, message, ...context };
  if (process.env.NODE_ENV === "production") {
    // Structured JSON for log aggregators
    console[level](JSON.stringify(entry));
  } else {
    const ctx = context ? ` ${JSON.stringify(context)}` : "";
    console[level](`[${level.toUpperCase()}] ${message}${ctx}`);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
};
