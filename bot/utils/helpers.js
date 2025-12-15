/**
 * Вспомогательные функции для бота
 */

/**
 * Проверяет, является ли пользователь администратором
 */
export const isAdmin = (userId, adminIds) => {
  return adminIds.includes(userId)
}

/**
 * Логирует действия пользователей
 */
export const logUserAction = (ctx, action, data = {}) => {
  const user = ctx.from
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] USER_ACTION:`, {
    userId: user.id,
    username: user.username,
    firstName: user.first_name,
    action,
    ...data
  })
}

/**
 * Обрабатывает ошибки безопасно
 */
export const handleError = async (ctx, error, customMessage = null) => {
  console.error('Bot error:', error)
  
  try {
    const message = customMessage || 'Произошла ошибка. Попробуйте позже.'
    await ctx.reply(message)
  } catch (replyError) {
    console.error('Failed to send error message:', replyError)
  }
}

/**
 * Создает задержку
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Валидирует номер телефона
 */
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+998[0-9]{9}$/
  return phoneRegex.test(phone)
}

/**
 * Форматирует цену
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
  }).format(price)
}

/**
 * Пагинация для массивов
 */
export const paginate = (array, page, limit = 5) => {
  const offset = (page - 1) * limit
  return {
    data: array.slice(offset, offset + limit),
    totalPages: Math.ceil(array.length / limit),
    currentPage: page,
    hasNext: offset + limit < array.length,
    hasPrev: page > 1
  }
}

/**
 * Безопасная отправка сообщений
 */
export const safeSendMessage = async (bot, userId, text, options = {}) => {
  try {
    await bot.telegram.sendMessage(userId, text, {
      parse_mode: 'Markdown',
      ...options
    })
    return true
  } catch (error) {
    console.error(`Failed to send message to user ${userId}:`, error)
    return false
  }
}

/**
 * Массовая рассылка
 */
export const broadcast = async (bot, userIds, text, options = {}) => {
  const results = []
  
  for (const userId of userIds) {
    const success = await safeSendMessage(bot, userId, text, options)
    results.push({ userId, success })
    
    // Задержка между сообщениями для избежания лимитов
    await delay(100)
  }
  
  return results
}

/**
 * Генерирует уникальный ID для заказа
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${timestamp}${randomStr}`.toUpperCase()
}

/**
 * Парсит callback data
 */
export const parseCallbackData = (data) => {
  const parts = data.split('_')
  return {
    action: parts[0],
    subAction: parts[1],
    id: parts[2],
    extra: parts.slice(3)
  }
}

/**
 * Создает callback data
 */
export const createCallbackData = (action, subAction, id, extra = []) => {
  return [action, subAction, id, ...extra].join('_')
}

/**
 * Ограничивает длину текста
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Проверяет рабочие часы
 */
export const isBusinessHours = () => {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 9 && hours < 21 // 9:00 - 21:00
}

/**
 * Получает приветствие в зависимости от времени
 */
export const getTimeBasedGreeting = () => {
  const hours = new Date().getHours()
  
  if (hours >= 6 && hours < 12) return 'Доброе утро'
  if (hours >= 12 && hours < 17) return 'Добрый день'
  if (hours >= 17 && hours < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}