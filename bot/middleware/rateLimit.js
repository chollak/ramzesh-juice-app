import { handleError } from '../utils/helpers.js'

/**
 * Middleware для ограничения частоты запросов
 */
export const rateLimitMiddleware = (options = {}) => {
  const {
    windowMs = 60000, // 1 минута
    max = 20, // максимум 20 сообщений в минуту
    message = 'Слишком много запросов. Попробуйте позже.'
  } = options

  const requests = new Map()

  // Очистка старых записей каждые 5 минут
  setInterval(() => {
    const now = Date.now()
    for (const [userId, userRequests] of requests.entries()) {
      const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs)
      if (validRequests.length === 0) {
        requests.delete(userId)
      } else {
        requests.set(userId, validRequests)
      }
    }
  }, 300000) // 5 минут

  return async (ctx, next) => {
    try {
      const userId = ctx.from?.id
      if (!userId) {
        return next()
      }

      const now = Date.now()
      const userRequests = requests.get(userId) || []

      // Фильтруем запросы в пределах временного окна
      const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs)

      if (recentRequests.length >= max) {
        console.log(`Rate limit exceeded for user ${userId}`)
        await ctx.reply(message)
        return
      }

      // Добавляем текущий запрос
      recentRequests.push(now)
      requests.set(userId, recentRequests)

      await next()
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Middleware для ограничения частоты callback запросов
 */
export const callbackRateLimitMiddleware = (options = {}) => {
  const {
    windowMs = 10000, // 10 секунд
    max = 5, // максимум 5 callback в 10 секунд
    message = 'Слишком быстро! Подождите немного.'
  } = options

  const callbacks = new Map()

  return async (ctx, next) => {
    try {
      if (!ctx.callbackQuery) {
        return next()
      }

      const userId = ctx.from?.id
      if (!userId) {
        return next()
      }

      const now = Date.now()
      const userCallbacks = callbacks.get(userId) || []

      // Фильтруем callback в пределах временного окна
      const recentCallbacks = userCallbacks.filter(timestamp => now - timestamp < windowMs)

      if (recentCallbacks.length >= max) {
        console.log(`Callback rate limit exceeded for user ${userId}`)
        await ctx.answerCbQuery(message, { show_alert: true })
        return
      }

      // Добавляем текущий callback
      recentCallbacks.push(now)
      callbacks.set(userId, recentCallbacks)

      await next()
    } catch (error) {
      console.error('Callback rate limit middleware error:', error)
      await handleError(ctx, error)
    }
  }
}