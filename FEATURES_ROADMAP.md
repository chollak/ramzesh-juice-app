# 🚀 Идеи для расширения функционала

## Готовые фичи ✅

- [x] Каталог соков с фильтрацией
- [x] Корзина покупок
- [x] Оформление заказов
- [x] История заказов
- [x] Telegram Bot интеграция
- [x] Админ панель (базовая)

## Приоритетные улучшения 🔥

### 1. Админ-панель для управления меню

**Функционал:**
- Добавление новых соков
- Редактирование соков
- Загрузка изображений
- Управление категориями
- Включение/выключение доступности на день

**Реализация:**
```vue
// src/views/admin/JuicesManagement.vue
<template>
  <div class="admin-panel">
    <h2>Управление соками</h2>
    
    <button @click="showAddJuiceModal = true">
      Добавить новый сок
    </button>
    
    <div class="juices-list">
      <div v-for="juice in juices" :key="juice.id" class="juice-item">
        <img :src="juice.image_url" />
        <h3>{{ juice.name }}</h3>
        <p>{{ juice.price }} сум</p>
        <div class="actions">
          <button @click="editJuice(juice)">Редактировать</button>
          <button @click="toggleAvailability(juice)">
            {{ juice.is_available ? 'Скрыть' : 'Показать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. Система уведомлений

**Push-уведомления через бота:**
- Заказ подтвержден ✅
- Заказ готовится 👨‍🍳
- Курьер выехал 🚚
- Заказ доставлен ✨

**Реализация:**
```javascript
// Функция для отправки уведомления
async function notifyUser(userId, message) {
  const { data: user } = await supabase
    .from('users')
    .select('telegram_id')
    .eq('id', userId)
    .single()
    
  if (user) {
    await bot.telegram.sendMessage(user.telegram_id, message)
  }
}

// При изменении статуса заказа
await notifyUser(order.user_id, 
  `🎉 Ваш заказ №${order.order_number} готов!\n` +
  `Курьер выехал к вам!`
)
```

### 3. Программа лояльности

**Бонусная система:**
- За каждый заказ начисляются баллы
- 1 балл = 1 сум скидки
- Реферальная программа

**Схема БД:**
```sql
CREATE TABLE loyalty_points (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  points integer DEFAULT 0,
  total_earned integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE loyalty_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  order_id uuid REFERENCES orders(id),
  points_earned integer,
  points_spent integer,
  created_at timestamptz DEFAULT now()
);
```

### 4. Расписание работы и слоты доставки

**Выбор времени доставки:**
```vue
<template>
  <div class="delivery-time-picker">
    <h3>Выберите время доставки</h3>
    
    <div class="time-slots">
      <button
        v-for="slot in availableSlots"
        :key="slot.time"
        :disabled="!slot.available"
        @click="selectSlot(slot)"
      >
        {{ slot.time }}
        <span v-if="!slot.available">(занято)</span>
      </button>
    </div>
  </div>
</template>
```

**Таблица для слотов:**
```sql
CREATE TABLE delivery_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  time_start time NOT NULL,
  time_end time NOT NULL,
  max_orders integer DEFAULT 5,
  current_orders integer DEFAULT 0,
  is_available boolean DEFAULT true
);
```

### 5. Отзывы и рейтинги

**После выполнения заказа:**
```vue
<template>
  <div class="order-rating">
    <h3>Как вам заказ?</h3>
    
    <div class="stars">
      <button 
        v-for="i in 5" 
        :key="i"
        @click="rating = i"
      >
        {{ i <= rating ? '⭐' : '☆' }}
      </button>
    </div>
    
    <textarea 
      v-model="comment"
      placeholder="Оставьте отзыв..."
    ></textarea>
    
    <button @click="submitReview">Отправить</button>
  </div>
</template>
```

### 6. Аналитика для владельца

**Дашборд с метриками:**
- Выручка за день/неделю/месяц 📊
- Популярные соки 🔥
- Пиковые часы заказов ⏰
- Средний чек 💰
- Конверсия в заказ 📈

**Графики с Chart.js:**
```vue
<script setup>
import { Line } from 'vue-chartjs'

const chartData = {
  labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  datasets: [{
    label: 'Заказы',
    data: [12, 19, 8, 15, 22, 18, 25],
    borderColor: '#2481cc'
  }]
}
</script>
```

### 7. Промокоды и акции

**Система промокодов:**
```sql
CREATE TABLE promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_percent integer,
  discount_amount decimal(10, 2),
  min_order_amount decimal(10, 2),
  max_uses integer,
  current_uses integer DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean DEFAULT true
);
```

**Использование:**
```vue
<template>
  <div class="promo-code-input">
    <input 
      v-model="promoCode"
      placeholder="Введите промокод"
    />
    <button @click="applyPromoCode">Применить</button>
    
    <div v-if="discount > 0" class="discount-applied">
      ✅ Промокод применен! Скидка: {{ discount }} сум
    </div>
  </div>
</template>
```

### 8. Избранное

**Сохранение любимых соков:**
```vue
<template>
  <button @click="toggleFavorite(juice)">
    {{ isFavorite(juice) ? '❤️' : '🤍' }}
  </button>
</template>

<script setup>
const favoritesStore = useFavoritesStore()

const toggleFavorite = (juice) => {
  if (isFavorite(juice)) {
    favoritesStore.removeFromFavorites(juice.id)
  } else {
    favoritesStore.addToFavorites(juice)
  }
}
</script>
```

### 9. Подписка на регулярную доставку

**Автоматические заказы:**
- Каждый день в 9:00
- Каждый понедельник и четверг
- По индивидуальному расписанию

**Таблица:**
```sql
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  frequency text, -- 'daily', 'weekly', 'custom'
  delivery_time time,
  delivery_days integer[], -- [1,3,5] для пн, ср, пт
  is_active boolean DEFAULT true,
  next_delivery_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE subscription_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid REFERENCES subscriptions(id),
  juice_id uuid REFERENCES juices(id),
  quantity integer DEFAULT 1
);
```

### 10. Геолокация и карта

**Выбор адреса на карте:**
```vue
<template>
  <div class="map-picker">
    <div id="map" style="height: 400px;"></div>
    <button @click="confirmLocation">
      Подтвердить адрес
    </button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Интеграция с Yandex Maps или 2GIS
  const map = new ymaps.Map('map', {
    center: [41.3111, 69.2797], // Ташкент
    zoom: 12
  })
  
  // Добавление метки
  map.events.add('click', (e) => {
    const coords = e.get('coords')
    // Сохраняем координаты
  })
})
</script>
```

## Улучшения UX/UI 🎨

### 1. Скелетоны загрузки
```vue
<div v-if="loading" class="skeleton">
  <div class="skeleton-card"></div>
  <div class="skeleton-card"></div>
</div>
```

### 2. Анимации
```css
.juice-card {
  transition: transform 0.2s;
}

.juice-card:hover {
  transform: translateY(-4px);
}
```

### 3. Темная тема
```javascript
// Автоматическая темная тема из Telegram
const themeParams = tg.themeParams
document.documentElement.style.setProperty('--bg-color', themeParams.bg_color)
```

### 4. Поиск по соках
```vue
<input 
  v-model="searchQuery"
  placeholder="🔍 Поиск соков..."
/>

<div v-for="juice in filteredJuices" :key="juice.id">
  {{ juice.name }}
</div>
```

## Интеграции 🔌

### 1. Платежные системы
- **Payme** (популярно в Узбекистане)
- **Click**
- **Telegram Stars**

### 2. Доставка
- **Яндекс.Доставка**
- **Caravan**
- Собственная служба доставки

### 3. CRM системы
- **Bitrix24**
- **AmoCRM**
- **HubSpot**

### 4. Email рассылки
- **Mailchimp**
- **SendGrid**
- Собственная система на Supabase Edge Functions

## Маркетинг 📢

### 1. Реферальная программа
```
Пригласите друга и получите 10% от его первого заказа!

Ваша реферальная ссылка:
https://t.me/your_bot?start=ref_USER_ID
```

### 2. Сезонные акции
```sql
CREATE TABLE promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  discount_percent integer,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true
);
```

### 3. Push-кампании
Массовая рассылка через бота о новинках и акциях

## Безопасность 🔒

### 1. Rate Limiting
```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
```

### 2. Валидация данных
```javascript
import Joi from 'joi'

const orderSchema = Joi.object({
  phone: Joi.string().pattern(/^\+998[0-9]{9}$/),
  address: Joi.string().min(10).required()
})
```

### 3. Логирование
```javascript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

## Производительность ⚡

### 1. Кеширование
```javascript
// Redis для кеширования меню
import Redis from 'ioredis'
const redis = new Redis()

async function getJuices() {
  const cached = await redis.get('juices')
  if (cached) return JSON.parse(cached)
  
  const juices = await api.getJuices()
  await redis.set('juices', JSON.stringify(juices), 'EX', 3600)
  return juices
}
```

### 2. Ленивая загрузка изображений
```vue
<img 
  :src="juice.image_url" 
  loading="lazy"
  :alt="juice.name"
/>
```

### 3. PWA (Progressive Web App)
```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Натуральные Соки',
        short_name: 'Соки',
        theme_color: '#2481cc'
      }
    })
  ]
}
```

## Тестирование 🧪

### 1. Unit тесты
```javascript
import { describe, it, expect } from 'vitest'
import { useCartStore } from '@/stores/cart'

describe('Cart Store', () => {
  it('adds item to cart', () => {
    const cart = useCartStore()
    cart.addToCart({ id: 1, name: 'Сок', price: 100 })
    expect(cart.items.length).toBe(1)
  })
})
```

### 2. E2E тесты
```javascript
import { test, expect } from '@playwright/test'

test('user can order juice', async ({ page }) => {
  await page.goto('/')
  await page.click('.juice-card:first-child')
  await page.click('text=В корзину')
  await page.click('text=Оформить заказ')
  await expect(page).toHaveURL('/checkout')
})
```

## Приоритеты внедрения

**Фаза 1 (Первые 2 недели):**
1. ✅ Админ-панель для управления меню
2. ✅ Система уведомлений

**Фаза 2 (1 месяц):**
3. ✅ Программа лояльности
4. ✅ Отзывы и рейтинги
5. ✅ Промокоды

**Фаза 3 (2-3 месяца):**
6. ✅ Аналитика
7. ✅ Подписки
8. ✅ Платежные системы

**Фаза 4 (долгосрочно):**
9. ✅ Геолокация
10. ✅ Интеграции с доставкой

---

Это живой документ, который можно дополнять по мере роста бизнеса! 🚀
