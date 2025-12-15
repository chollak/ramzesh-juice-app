import { OrderService } from '../services/orderService.js'
import { UserService } from '../services/userService.js'
import { MESSAGES, formatOrder, formatStats } from '../utils/messages.js'
import { createAdminKeyboard, createOrderManagementKeyboard, createNavigationKeyboard } from '../utils/keyboards.js'
import { logUserAction, handleError, paginate, broadcast } from '../utils/helpers.js'

/**
 * Обработчик команды /admin
 */
export const handleAdmin = () => {
  return async (ctx) => {
    try {
      logUserAction(ctx, 'ADMIN_COMMAND')

      await ctx.reply(
        '🔐 *Панель администратора*\n\nВыберите действие:',
        {
          parse_mode: 'Markdown',
          ...createAdminKeyboard()
        }
      )
    } catch (error) {
      console.error('Error in admin handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик статистики
 */
export const handleAdminStats = (supabase) => {
  const orderService = new OrderService(supabase)
  const userService = new UserService(supabase)

  return async (ctx) => {
    try {
      logUserAction(ctx, 'ADMIN_STATS')

      await ctx.answerCbQuery()
      await ctx.reply('📊 Загружаю статистику...')

      const [orderStats, userStats] = await Promise.all([
        orderService.getOrderStats(),
        userService.getUserStats()
      ])

      const stats = {
        ...orderStats,
        total: {
          ...orderStats.total,
          users: userStats.total
        },
        users: userStats
      }

      let message = formatStats(stats)
      
      message += `\n👥 *Пользователи:*\n`
      message += `📊 Всего: ${userStats.total}\n`
      message += `🆕 Новых сегодня: ${userStats.newToday}\n`
      message += `📈 Новых за неделю: ${userStats.newThisWeek}\n`
      message += `⚡ Активных: ${userStats.active}\n`

      await ctx.reply(message, { parse_mode: 'Markdown' })

    } catch (error) {
      console.error('Error in admin stats handler:', error)
      await handleError(ctx, error, 'Не удалось загрузить статистику.')
    }
  }
}

/**
 * Обработчик новых заказов
 */
export const handleAdminOrders = (supabase) => {
  const orderService = new OrderService(supabase)

  return async (ctx) => {
    try {
      logUserAction(ctx, 'ADMIN_NEW_ORDERS')

      await ctx.answerCbQuery()
      await ctx.reply('📦 Загружаю новые заказы...')

      const pendingOrders = await orderService.getNewOrders(10)

      if (!pendingOrders || pendingOrders.length === 0) {
        await ctx.reply(MESSAGES.ADMIN.NO_ORDERS)
        return
      }

      let message = '📦 *Новые заказы:*\n\n'

      for (const order of pendingOrders.slice(0, 5)) {
        const userName = order.users?.first_name || order.users?.username || 'Неизвестно'
        const date = new Date(order.created_at).toLocaleString('ru-RU')

        message += `*Заказ №${order.order_number}*\n`
        message += `👤 ${userName}\n`
        message += `📅 ${date}\n`
        message += `📞 ${order.phone_number || 'Не указан'}\n`
        message += `💰 ${order.total_amount} сум\n`
        
        if (order.order_items && order.order_items.length > 0) {
          message += `\n🍹 Состав:\n`
          order.order_items.forEach((item) => {
            message += `  • ${item.juice_name} x${item.quantity}\n`
          })
        }
        
        if (order.comment) {
          message += `💬 ${order.comment}\n`
        }
        
        message += `\n───────────────\n\n`
      }

      if (pendingOrders.length > 5) {
        message += `📊 Показано 5 из ${pendingOrders.length} заказов\n\n`
      }

      await ctx.reply(message, { parse_mode: 'Markdown' })

      // Показываем кнопки управления для первого заказа
      if (pendingOrders.length > 0) {
        const firstOrder = pendingOrders[0]
        await ctx.reply(
          `⚡ *Быстрые действия для заказа №${firstOrder.order_number}:*`,
          {
            parse_mode: 'Markdown',
            ...createOrderManagementKeyboard(firstOrder.id)
          }
        )
      }

    } catch (error) {
      console.error('Error in admin orders handler:', error)
      await handleError(ctx, error, 'Не удалось загрузить заказы.')
    }
  }
}

/**
 * Обработчик управления заказом
 */
export const handleOrderManagement = (supabase, bot) => {
  const orderService = new OrderService(supabase)

  return async (ctx) => {
    try {
      const callbackData = ctx.callbackQuery.data
      const [action, status, orderId] = callbackData.split('_')

      if (action !== 'order') return

      logUserAction(ctx, 'ORDER_MANAGEMENT', { status, orderId })

      await ctx.answerCbQuery('⏳ Обновляю статус заказа...')

      const updatedOrder = await orderService.updateOrderStatus(orderId, status)
      
      if (!updatedOrder) {
        await ctx.reply('❌ Заказ не найден.')
        return
      }

      const statusMessages = {
        confirm: MESSAGES.ORDER.CONFIRMED,
        preparing: MESSAGES.ORDER.PREPARING,
        delivering: MESSAGES.ORDER.DELIVERING,
        completed: MESSAGES.ORDER.COMPLETED,
        cancel: MESSAGES.ORDER.CANCELLED
      }

      const statusText = {
        confirm: 'подтвержден',
        preparing: 'переведен в статус "Готовится"',
        delivering: 'переведен в статус "В доставке"',
        completed: 'помечен как выполненный',
        cancel: 'отменен'
      }

      // Уведомляем администратора
      await ctx.reply(
        `✅ Заказ №${updatedOrder.order_number} ${statusText[status]}.`
      )

      // Уведомляем клиента
      if (updatedOrder.users?.telegram_id && statusMessages[status]) {
        const clientMessage = statusMessages[status](updatedOrder.order_number)
        
        const success = await new Promise(resolve => {
          bot.telegram.sendMessage(
            updatedOrder.users.telegram_id,
            clientMessage
          ).then(() => resolve(true))
           .catch(() => resolve(false))
        })

        if (success) {
          await ctx.reply('📱 Клиент уведомлен.')
        } else {
          await ctx.reply('⚠️ Не удалось уведомить клиента.')
        }
      }

    } catch (error) {
      console.error('Error in order management handler:', error)
      await handleError(ctx, error, 'Не удалось обновить статус заказа.')
    }
  }
}

/**
 * Обработчик управления меню
 */
export const handleAdminMenu = (miniAppUrl) => {
  return async (ctx) => {
    try {
      logUserAction(ctx, 'ADMIN_MENU')

      await ctx.answerCbQuery()
      await ctx.reply(
        '🍹 *Управление меню*\n\n' +
        'Для управления каталогом соков перейдите в панель администратора:\n' +
        `${miniAppUrl}/admin\n\n` +
        '⚡ *Доступные функции:*\n' +
        '• Добавление новых соков\n' +
        '• Редактирование существующих\n' +
        '• Управление категориями\n' +
        '• Загрузка изображений\n' +
        '• Настройка доступности',
        { parse_mode: 'Markdown' }
      )
    } catch (error) {
      console.error('Error in admin menu handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик управления пользователями
 */
export const handleAdminUsers = (supabase) => {
  const userService = new UserService(supabase)

  return async (ctx) => {
    try {
      logUserAction(ctx, 'ADMIN_USERS')

      await ctx.answerCbQuery()
      await ctx.reply('👥 Загружаю список пользователей...')

      const usersData = await userService.getAllUsers(1, 10)

      if (!usersData.users || usersData.users.length === 0) {
        await ctx.reply('👥 Пользователей пока нет.')
        return
      }

      let message = `👥 *Пользователи (${usersData.currentPage}/${usersData.totalPages}):*\n\n`

      usersData.users.forEach((user, index) => {
        const number = (usersData.currentPage - 1) * 10 + index + 1
        const isAdmin = user.is_admin ? '👑' : '👤'
        const isBlocked = user.is_blocked ? '🚫' : ''
        const date = new Date(user.created_at).toLocaleDateString('ru-RU')

        message += `${number}. ${isAdmin} ${user.first_name || 'Без имени'} ${isBlocked}\n`
        message += `   @${user.username || 'no_username'} (ID: ${user.telegram_id})\n`
        message += `   📅 ${date}\n\n`
      })

      message += `📊 Всего пользователей: ${usersData.totalCount}`

      await ctx.reply(message, { parse_mode: 'Markdown' })

      // Кнопки навигации если нужно
      if (usersData.totalPages > 1) {
        await ctx.reply(
          'Навигация:',
          createNavigationKeyboard(usersData.currentPage, usersData.totalPages, 'users')
        )
      }

    } catch (error) {
      console.error('Error in admin users handler:', error)
      await handleError(ctx, error, 'Не удалось загрузить пользователей.')
    }
  }
}

/**
 * Обработчик массовой рассылки
 */
export const handleBroadcast = (supabase, bot) => {
  const userService = new UserService(supabase)

  return async (ctx) => {
    try {
      logUserAction(ctx, 'BROADCAST_REQUEST')

      await ctx.reply(
        '📢 *Массовая рассылка*\n\n' +
        'Отправьте сообщение, которое хотите разослать всем пользователям.\n\n' +
        '⚠️ *Внимание:* Рассылка будет отправлена всем пользователям бота!',
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            force_reply: true,
            input_field_placeholder: 'Текст для рассылки...'
          }
        }
      )
    } catch (error) {
      console.error('Error in broadcast handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик текста для рассылки
 */
export const handleBroadcastText = (supabase, bot) => {
  const userService = new UserService(supabase)

  return async (ctx) => {
    try {
      if (!ctx.message?.reply_to_message?.text?.includes('Массовая рассылка')) {
        return // Не рассылка
      }

      const broadcastText = ctx.message.text

      logUserAction(ctx, 'BROADCAST_SEND', { 
        textLength: broadcastText.length 
      })

      await ctx.reply('📤 Начинаю рассылку...')

      const userIds = await userService.getUsersForBroadcast()
      
      if (userIds.length === 0) {
        await ctx.reply('❌ Нет пользователей для рассылки.')
        return
      }

      const results = await broadcast(bot, userIds, broadcastText)
      
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      await ctx.reply(
        `✅ *Рассылка завершена!*\n\n` +
        `📊 Статистика:\n` +
        `• Отправлено: ${successful}\n` +
        `• Не доставлено: ${failed}\n` +
        `• Всего пользователей: ${userIds.length}`,
        { 
          parse_mode: 'Markdown',
          reply_markup: { remove_keyboard: true } 
        }
      )

    } catch (error) {
      console.error('Error in broadcast text handler:', error)
      await handleError(ctx, error)
    }
  }
}