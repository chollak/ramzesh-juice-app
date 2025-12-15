// Утилита для отладки в Telegram WebApp
// Логи можно просмотреть через Eruda или отправив их на сервер

class DebugLogger {
  constructor() {
    this.logs = []
    this.maxLogs = 100
  }

  log(message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'log',
      message,
      data
    }

    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    console.log(`[DEBUG] ${message}`, data || '')
  }

  error(message, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null
    }

    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    console.error(`[DEBUG ERROR] ${message}`, error || '')
  }

  getLogs() {
    return this.logs
  }

  getLogsAsText() {
    return this.logs.map(log =>
      `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`
    ).join('\n')
  }

  clear() {
    this.logs = []
  }

  // Показать логи в алерте (для быстрой отладки)
  showLogs() {
    const logsText = this.getLogsAsText()
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(logsText.slice(-500)) // Последние 500 символов
    } else {
      alert(logsText)
    }
  }
}

export const debugLogger = new DebugLogger()

// Инициализация Eruda для отладки в продакшене (опционально)
export const initEruda = () => {
  // Eruda - это консоль разработчика для мобильных браузеров
  // Можно включить через добавление ?debug=1 к URL
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('debug') === '1' || import.meta.env.DEV) {
    import('eruda').then(eruda => {
      eruda.default.init()
      console.log('Eruda DevTools initialized')
    }).catch(err => {
      console.warn('Failed to load Eruda:', err)
    })
  }
}
