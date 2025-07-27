const { formatDate } = require("./helpers");

/**
 * Logger simples com cores e timestamps
 */
class Logger {
  constructor() {
    this.colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      dim: "\x1b[2m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
    };
  }

  _formatMessage(level, message, ...args) {
    const timestamp = formatDate();
    const formattedArgs =
      args.length > 0
        ? " " +
          args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ")
        : "";

    return `[${timestamp}] ${level} ${message}${formattedArgs}`;
  }

  _colorize(text, color) {
    if (process.env.NO_COLOR) {
      return text;
    }
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  info(message, ...args) {
    const formatted = this._formatMessage("INFO", message, ...args);
    console.log(this._colorize(formatted, "blue"));
  }

  success(message, ...args) {
    const formatted = this._formatMessage("SUCCESS", message, ...args);
    console.log(this._colorize(formatted, "green"));
  }

  warn(message, ...args) {
    const formatted = this._formatMessage("WARN", message, ...args);
    console.warn(this._colorize(formatted, "yellow"));
  }

  error(message, ...args) {
    const formatted = this._formatMessage("ERROR", message, ...args);
    console.error(this._colorize(formatted, "red"));
  }

  debug(message, ...args) {
    if (process.env.DEBUG) {
      const formatted = this._formatMessage("DEBUG", message, ...args);
      console.log(this._colorize(formatted, "dim"));
    }
  }

  // Métodos especiais para logs do bot
  star(message, ...args) {
    const formatted = this._formatMessage("⭐", message, ...args);
    console.log(this._colorize(formatted, "yellow"));
  }

  unstar(message, ...args) {
    const formatted = this._formatMessage("🔄", message, ...args);
    console.log(this._colorize(formatted, "cyan"));
  }

  check(message, ...args) {
    const formatted = this._formatMessage("🔍", message, ...args);
    console.log(this._colorize(formatted, "magenta"));
  }
}

// Exportar instância singleton
module.exports = new Logger();
