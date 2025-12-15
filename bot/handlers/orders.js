import { OrderService } from '../services/orderService.js'
import { MESSAGES, formatOrder } from '../utils/messages.js'
import { createNavigationKeyboard } from '../utils/keyboards.js'
import { logUserAction, handleError, paginate } from '../utils/helpers.js'

/**
 * Обработчик команды "Мои заказы"
 */
export const handleMyOrders = (supabase) => {
  const orderService = new OrderService(supabase)

  return async (ctx) => {
    try {
      const userId = ctx.from.id
      logUserAction(ctx, 'MY_ORDERS')

      await ctx.reply('⏳ Загружаю ваши заказы...')

      const orders = await orderService.getUserOrders(userId, 10)

      if (!orders || orders.length === 0) {
        await ctx.reply(
          '📦 У вас пока нет заказов.\n\n' +
          'Нажмите кнопку "🍹 Открыть меню" чтобы сделать первый заказ!'
        )
        return
      }

      let message = '📋 *Ваши заказы:*\n\n'

      orders.slice(0, 5).forEach((order) => {
        message += formatOrder(order) + '\n───────────────\n\n'
      })

      if (orders.length > 5) {
        message += `📊 Показано 5 из ${orders.length} заказов`
      }

      await ctx.reply(message, { parse_mode: 'Markdown' })

      // Показываем последний заказ отдельно, если он есть
      if (orders.length > 0) {
        const lastOrder = orders[0]
        if (lastOrder.status === 'pending') {
          setTimeout(async () => {
            await ctx.reply(
              `⏳ Ваш последний заказ №${lastOrder.order_number} ожидает подтверждения.\n` +
              'Мы свяжемся с вами в ближайшее время!'
            )
          }, 1000)
        }
      }

    } catch (error) {
      console.error('Error in my orders handler:', error)
      await handleError(ctx, error, 'Не удалось загрузить заказы. Попробуйте позже.')
    }
  }
}

/**
 * Обработчик команды "Контакты"
 */
export const handleContacts = () => {
  return async (ctx) => {
    try {
      logUserAction(ctx, 'CONTACTS')

      await ctx.reply(
        MESSAGES.CONTACTS,
        { parse_mode: 'Markdown' }
      )
    } catch (error) {
      console.error('Error in contacts handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик команды "О нас"
 */
export const handleAbout = () => {
  return async (ctx) => {
    try {
      logUserAction(ctx, 'ABOUT')

      await ctx.reply(
        MESSAGES.ABOUT,
        { parse_mode: 'Markdown' }
      )
    } catch (error) {
      console.error('Error in about handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик команды "Оставить отзыв"
 */
export const handleReview = () => {
  return async (ctx) => {
    try {
      logUserAction(ctx, 'REVIEW_REQUEST')

      await ctx.reply(
        '⭐ *Оставить отзыв*\n\n' +
        'Мы будем рады узнать ваше мнение о нашей продукции и сервисе!\n\n' +
        'Напишите ваш отзыв в ответном сообщении, и мы обязательно его прочитаем.\n\n' +
        '📝 Также вы можете оценить нас на:\n' +
        '• Google Maps\n' +
        '• 2GIS\n' +
        '• Telegram каналах\n\n' +
        'Спасибо за ваше время! 💚',
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            force_reply: true,
            input_field_placeholder: 'Напишите ваш отзыв...'
          }
        }
      )
    } catch (error) {
      console.error('Error in review handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик текстовых отзывов
 */
export const handleReviewText = () => {
  return async (ctx) => {
    try {
      if (!ctx.message?.reply_to_message?.text?.includes('Напишите ваш отзыв')) {
        return // Не отзыв
      }

      const reviewText = ctx.message.text
      const user = ctx.from

      logUserAction(ctx, 'REVIEW_SUBMITTED', { 
        review: reviewText.substring(0, 100) + '...',
        reviewLength: reviewText.length
      })

      // Здесь можно сохранить отзыв в базу данных
      console.log(`Review from ${user.first_name} (${user.id}): ${reviewText}`)

      await ctx.reply(
        '🙏 Спасибо за ваш отзыв!\n\n' +
        'Мы внимательно изучим ваше мнение и будем работать над улучшением нашего сервиса.\n\n' +
        'Ваше мнение очень важно для нас! 💚',
        { reply_markup: { remove_keyboard: true } }
      )

    } catch (error) {
      console.error('Error in review text handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик поиска заказов
 */
export const handleOrderSearch = (supabase) => {
  const orderService = new OrderService(supabase)

  return async (ctx) => {
    try {
      const query = ctx.message.text

      // Проверяем, похоже ли на номер заказа
      if (!/^[A-Z0-9]{8,12}$/i.test(query)) {
        return // Не номер заказа
      }

      logUserAction(ctx, 'ORDER_SEARCH', { query })

      const order = await orderService.getOrderByNumber(query.toUpperCase())

      if (!order) {
        await ctx.reply(`❌ Заказ с номером ${query.toUpperCase()} не найден.`)
        return
      }

      // Проверяем, принадлежит ли заказ пользователю
      if (order.users?.telegram_id !== ctx.from.id) {
        await ctx.reply('❌ Заказ не найден.')
        return
      }

      const message = '🔍 *Найденный заказ:*\n\n' + formatOrder(order)
      await ctx.reply(message, { parse_mode: 'Markdown' })

    } catch (error) {
      console.error('Error in order search handler:', error)
      await handleError(ctx, error)
    }
  }
}