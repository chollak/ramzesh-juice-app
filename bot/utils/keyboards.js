import { Markup } from 'telegraf'

/**
 * Создает inline клавиатуру для запуска mini app
 */
export const createMiniAppKeyboard = (appUrl) => {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🍹 Открыть меню', appUrl)]
  ])
}

/**
 * Создает обычную клавиатуру для основных команд
 */
export const createMainKeyboard = () => {
  return Markup.keyboard([
    ['📋 Мои заказы', '📞 Контакты'],
    ['ℹ️ О нас', '⭐ Оставить отзыв']
  ]).resize()
}

/**
 * Создает клавиатуру для админа
 */
export const createAdminKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Статистика', 'admin_stats')],
    [Markup.button.callback('📦 Новые заказы', 'admin_orders')],
    [Markup.button.callback('🍹 Управление меню', 'admin_menu')],
    [Markup.button.callback('👥 Пользователи', 'admin_users')]
  ])
}

/**
 * Создает клавиатуру для управления заказом
 */
export const createOrderManagementKeyboard = (orderId) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Подтвердить', `order_confirm_${orderId}`),
      Markup.button.callback('❌ Отменить', `order_cancel_${orderId}`)
    ],
    [
      Markup.button.callback('👨‍🍳 Готовится', `order_preparing_${orderId}`),
      Markup.button.callback('🚚 В доставке', `order_delivering_${orderId}`)
    ],
    [Markup.button.callback('✨ Выполнен', `order_completed_${orderId}`)]
  ])
}

/**
 * Создает клавиатуру навигации
 */
export const createNavigationKeyboard = (currentPage, totalPages, prefix) => {
  const buttons = []
  
  if (currentPage > 1) {
    buttons.push(Markup.button.callback('⬅️ Назад', `${prefix}_prev_${currentPage - 1}`))
  }
  
  buttons.push(Markup.button.callback(`${currentPage}/${totalPages}`, 'noop'))
  
  if (currentPage < totalPages) {
    buttons.push(Markup.button.callback('➡️ Далее', `${prefix}_next_${currentPage + 1}`))
  }

  return Markup.inlineKeyboard([buttons])
}

/**
 * Удаляет клавиатуру
 */
export const removeKeyboard = () => {
  return Markup.removeKeyboard()
}