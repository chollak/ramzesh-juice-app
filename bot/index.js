import { Telegraf, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const MINI_APP_URL = process.env.TELEGRAM_MINI_APP_URL
const ADMIN_IDS = process.env.ADMIN_TELEGRAM_IDS?.split(',').map(id => parseInt(id)) || []

// Команда /start
bot.command('start', async (ctx) => {
  const userId = ctx.from.id
  const username = ctx.from.username
  const firstName = ctx.from.first_name
  const lastName = ctx.from.last_name

  try {
    // Создаем или обновляем пользователя в базе
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userId)
      .single()

    if (!existingUser) {
      await supabase
        .from('users')
        .insert([
          {
            telegram_id: userId,
            username,
            first_name: firstName,
            last_name: lastName,
            is_admin: ADMIN_IDS.includes(userId)
          }
        ])
    }

    // Inline кнопка для WebApp (правильный способ с передачей initData)
    const inlineKeyboard = Markup.inlineKeyboard([
      [Markup.button.webApp('🍹 Открыть меню', MINI_APP_URL)]
    ])

    // Обычная клавиатура для других команд
    const replyKeyboard = Markup.keyboard([
      ['📋 Мои заказы', '📞 Контакты']
    ]).resize()

    // Отправляем сообщение с inline кнопкой WebApp
    await ctx.reply(
      `Привет, ${firstName}! 👋\n\n` +
      `Добро пожаловать в магазин натуральных соков!\n\n` +
      `🍊 Свежие соки из натуральных фруктов и овощей\n` +
      `🚀 Быстрая доставка\n` +
      `💚 100% натуральные ингредиенты\n\n` +
      `Нажмите кнопку ниже, чтобы открыть меню:`,
      inlineKeyboard
    )

    // Устанавливаем обычную клавиатуру отдельным сообщением
    await ctx.reply(
      `Также вы можете использовать кнопки ниже:`,
      replyKeyboard
    )
  } catch (error) {
    console.error('Error in /start command:', error)
    await ctx.reply('Произошла ошибка. Попробуйте позже.')
  }
})

// Команда для просмотра заказов
bot.hears('📋 Мои заказы', async (ctx) => {
  try {
    const userId = ctx.from.id

    // Получаем user_id из базы
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', userId)
      .single()

    if (!user) {
      await ctx.reply('Пользователь не найден. Используйте /start')
      return
    }

    // Получаем последние заказы
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          juice_name,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    if (!orders || orders.length === 0) {
      await ctx.reply('У вас пока нет заказов.')
      return
    }

    let message = '📋 *Ваши последние заказы:*\n\n'

    orders.forEach((order, index) => {
      const statusEmoji = {
        pending: '⏳',
        confirmed: '✅',
        preparing: '👨‍🍳',
        delivering: '🚚',
        completed: '✨',
        cancelled: '❌'
      }[order.status] || '📦'

      const statusText = {
        pending: 'Ожидает подтверждения',
        confirmed: 'Подтвержден',
        preparing: 'Готовится',
        delivering: 'В доставке',
        completed: 'Выполнен',
        cancelled: 'Отменен'
      }[order.status] || 'Неизвестно'

      const date = new Date(order.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })

      message += `${statusEmoji} *Заказ №${order.order_number}*\n`
      message += `📅 ${date}\n`
      message += `💰 ${order.total_amount} сум\n`
      message += `📍 ${statusText}\n`
      message += `\n`
    })

    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error fetching orders:', error)
    await ctx.reply('Ошибка при загрузке заказов.')
  }
})

// Команда для контактов
bot.hears('📞 Контакты', async (ctx) => {
  await ctx.reply(
    '📞 *Контакты*\n\n' +
    '📱 Телефон: +998 90 123 45 67\n' +
    '🕐 Режим работы: 9:00 - 21:00\n' +
    '📍 Адрес: г. Ташкент, ул. Примерная, 1\n\n' +
    '💬 Пишите нам в любое время!',
    { parse_mode: 'Markdown' }
  )
})

// Админ команды
bot.command('admin', async (ctx) => {
  const userId = ctx.from.id

  if (!ADMIN_IDS.includes(userId)) {
    await ctx.reply('У вас нет доступа к административной панели.')
    return
  }

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📊 Статистика', 'admin_stats')],
    [Markup.button.callback('📦 Новые заказы', 'admin_new_orders')],
    [Markup.button.callback('🍹 Управление меню', 'admin_menu')]
  ])

  await ctx.reply('🔐 *Панель администратора*\n\nВыберите действие:', {
    parse_mode: 'Markdown',
    ...keyboard
  })
})

// Обработка callback для админки
bot.action('admin_stats', async (ctx) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Статистика за сегодня
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('total_amount, status')
      .gte('created_at', today.toISOString())

    if (todayError) throw todayError

    const todayRevenue = todayOrders?.reduce((sum, order) => 
      sum + parseFloat(order.total_amount), 0
    ) || 0

    const todayCount = todayOrders?.length || 0

    // Общая статистика
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    await ctx.editMessageText(
      '📊 *Статистика*\n\n' +
      `*Сегодня:*\n` +
      `📦 Заказов: ${todayCount}\n` +
      `💰 Выручка: ${todayRevenue.toFixed(2)} сум\n\n` +
      `*Всего:*\n` +
      `📦 Всего заказов: ${totalOrders || 0}`,
      { parse_mode: 'Markdown' }
    )
  } catch (error) {
    console.error('Error fetching stats:', error)
    await ctx.reply('Ошибка при загрузке статистики.')
  }
})

bot.action('admin_new_orders', async (ctx) => {
  try {
    const { data: pendingOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          juice_name,
          price
        ),
        users (
          first_name,
          username
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    if (!pendingOrders || pendingOrders.length === 0) {
      await ctx.editMessageText('📦 Нет новых заказов')
      return
    }

    let message = '📦 *Новые заказы:*\n\n'

    pendingOrders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleString('ru-RU')
      const userName = order.users?.first_name || order.users?.username || 'Неизвестно'

      message += `*Заказ №${order.order_number}*\n`
      message += `👤 ${userName}\n`
      message += `📅 ${date}\n`
      message += `📞 ${order.phone_number}\n`
      message += `📍 ${order.delivery_address_text}\n`
      message += `💰 ${order.total_amount} сум\n`
      
      if (order.order_items && order.order_items.length > 0) {
        message += `\n🍹 Состав:\n`
        order.order_items.forEach((item) => {
          message += `  • ${item.juice_name} x${item.quantity}\n`
        })
      }
      
      message += `\n───────────────\n\n`
    })

    await ctx.editMessageText(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error fetching new orders:', error)
    await ctx.reply('Ошибка при загрузке заказов.')
  }
})

bot.action('admin_menu', async (ctx) => {
  await ctx.editMessageText(
    '🍹 *Управление меню*\n\n' +
    'Для управления меню перейдите в панель администратора:\n' +
    `${MINI_APP_URL}/admin`,
    { parse_mode: 'Markdown' }
  )
})

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err)
  ctx.reply('Произошла ошибка. Попробуйте позже.')
})

// Запуск бота
const startBot = () => {
  bot.launch()
    .then(() => {
      console.log('🤖 Bot started successfully')
    })
    .catch((error) => {
      console.error('Failed to start bot:', error)
    })

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

startBot()
