// Утилиты для работы с Telegram Mini Apps API

export const tg = window.Telegram?.WebApp

export const initTelegramApp = () => {
  console.log('Initializing Telegram WebApp...')
  console.log('window.Telegram:', window.Telegram)
  console.log('window.Telegram.WebApp:', tg)

  if (!tg) {
    console.warn('Telegram WebApp is not available')
    console.log('Running in browser mode (not in Telegram)')
    return null
  }

  // Логируем информацию о Telegram WebApp
  console.log('Telegram WebApp version:', tg.version)
  console.log('Telegram WebApp platform:', tg.platform)
  console.log('Telegram initData:', tg.initData)
  console.log('Telegram initDataUnsafe:', tg.initDataUnsafe)

  // Инициализируем приложение
  tg.ready()
  console.log('Telegram WebApp ready')

  // Разворачиваем на весь экран
  tg.expand()

  // Включаем главную кнопку
  tg.MainButton.setText('Оформить заказ')
  tg.MainButton.hide()

  // Применяем цвета темы Telegram
  applyTelegramTheme()

  console.log('Telegram WebApp initialized successfully')
  return tg
}

// Применить тему Telegram к приложению
export const applyTelegramTheme = () => {
  if (!tg?.themeParams) return

  const root = document.documentElement
  const theme = tg.themeParams

  // Применяем цвета темы
  if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color)
  if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color)
  if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color)
  if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color)
  if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color)
  if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color)
  if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color)

  // Устанавливаем фон body
  document.body.style.backgroundColor = theme.bg_color || '#ffffff'
}

export const getUserData = () => {
  // Режим разработки: если Telegram WebApp недоступен, используем тестовые данные
  const isDevelopment = import.meta.env.DEV

  if (!tg) {
    console.warn('Telegram WebApp is not available')

    // В режиме разработки возвращаем тестового пользователя
    if (isDevelopment) {
      console.log('Using development mode test user')
      return {
        id: 999999999,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru',
        phone_number: null,
      }
    }

    return null
  }

  // Логируем данные для отладки
  console.log('Telegram initDataUnsafe:', tg.initDataUnsafe)

  const userData = {
    id: tg.initDataUnsafe?.user?.id,
    first_name: tg.initDataUnsafe?.user?.first_name,
    last_name: tg.initDataUnsafe?.user?.last_name,
    username: tg.initDataUnsafe?.user?.username,
    language_code: tg.initDataUnsafe?.user?.language_code,
    phone_number: tg.initDataUnsafe?.user?.phone_number,
  }

  // Если ID пользователя отсутствует, но мы в режиме разработки
  if (!userData.id && isDevelopment) {
    console.warn('User ID not found in Telegram data, using test user')
    return {
      id: 999999999,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'ru',
      phone_number: null,
    }
  }

  return userData
}

// Запросить номер телефона пользователя
export const requestContact = () => {
  return new Promise((resolve, reject) => {
    if (!tg) {
      console.warn('Telegram WebApp not available for contact request')
      reject(new Error('Telegram WebApp недоступен'))
      return
    }

    console.log('Requesting contact from user...')

    tg.requestContact((success, event) => {
      console.log('Contact request result:', { success, event })

      if (success && event?.responseUnsafe?.contact) {
        const contact = event.responseUnsafe.contact
        console.log('Contact received:', contact)
        resolve({
          phone_number: contact.phone_number,
          first_name: contact.first_name,
          last_name: contact.last_name,
          user_id: contact.user_id
        })
      } else {
        console.warn('Contact request was cancelled or failed')
        reject(new Error('Запрос контакта был отменен'))
      }
    })
  })
}

export const setMainButton = (text, onClick, show = true) => {
  if (!tg) return
  
  tg.MainButton.setText(text)
  tg.MainButton.onClick(onClick)
  
  if (show) {
    tg.MainButton.show()
  } else {
    tg.MainButton.hide()
  }
}

export const showMainButton = (text, onClick) => {
  setMainButton(text, onClick, true)
}

export const hideMainButton = () => {
  if (!tg) return
  tg.MainButton.hide()
}

export const showBackButton = (onClick) => {
  if (!tg) return
  
  tg.BackButton.onClick(onClick)
  tg.BackButton.show()
}

export const hideBackButton = () => {
  if (!tg) return
  tg.BackButton.hide()
}

export const showAlert = (message) => {
  if (!tg) {
    alert(message)
    return
  }
  
  tg.showAlert(message)
}

export const showConfirm = (message, callback) => {
  if (!tg) {
    callback(confirm(message))
    return
  }
  
  tg.showConfirm(message, callback)
}

export const hapticFeedback = (type = 'medium') => {
  if (!tg?.HapticFeedback) return
  
  switch (type) {
    case 'light':
      tg.HapticFeedback.impactOccurred('light')
      break
    case 'medium':
      tg.HapticFeedback.impactOccurred('medium')
      break
    case 'heavy':
      tg.HapticFeedback.impactOccurred('heavy')
      break
    case 'success':
      tg.HapticFeedback.notificationOccurred('success')
      break
    case 'error':
      tg.HapticFeedback.notificationOccurred('error')
      break
    case 'warning':
      tg.HapticFeedback.notificationOccurred('warning')
      break
    default:
      tg.HapticFeedback.impactOccurred('medium')
  }
}

export const closeApp = () => {
  if (!tg) return
  tg.close()
}

export const openLink = (url) => {
  if (!tg) {
    window.open(url, '_blank')
    return
  }
  
  tg.openLink(url)
}

export const openTelegramLink = (url) => {
  if (!tg) {
    window.open(url, '_blank')
    return
  }
  
  tg.openTelegramLink(url)
}

// Получить цвета темы Telegram
export const getThemeParams = () => {
  if (!tg) return null
  
  return tg.themeParams
}

// Проверка, запущено ли приложение в Telegram
export const isTelegramApp = () => {
  return !!tg
}

// Форматирование цены
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
  }).format(price)
}

// Форматирование даты
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Форматирование даты для заказа
export const formatOrderDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
