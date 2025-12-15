# Деплой с существующими проектами на сервере

Это руководство для деплоя Juice App на сервер, где уже работают другие проекты (например, в Docker) и настроен домен.

## Ситуация

У вас на AWS EC2 уже:
- ✅ Работает проект в Docker
- ✅ Настроен nginx
- ✅ Прикреплен домен (например, `yourdomain.com`)
- ✅ Возможно настроен SSL

Нужно запустить Juice App параллельно, не нарушая работу существующего проекта.

## Варианты деплоя

### Вариант 1: Поддомен (рекомендуется)

**Результат**: `juice.yourdomain.com`

#### Преимущества:
- ✅ Полная изоляция от основного проекта
- ✅ Отдельный SSL сертификат
- ✅ Простая настройка
- ✅ Чистые URL без префиксов

#### Шаги:

1. **Добавьте A-запись в DNS**
   ```
   Тип: A
   Имя: juice
   Значение: <IP вашего EC2>
   TTL: 3600
   ```

2. **Клонируйте проект**
   ```bash
   cd /opt
   sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git juice-telegram-bot
   sudo chown -R ubuntu:ubuntu juice-telegram-bot
   cd juice-telegram-bot
   ```

3. **Установите PM2 (если еще не установлен)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Создайте .env файл**
   ```bash
   cp .env.example .env
   nano .env
   ```

5. **Соберите и разверните приложение**
   ```bash
   npm install
   npm run build

   # Разверните фронтенд
   sudo mkdir -p /var/www/juice-app
   sudo cp -r dist/* /var/www/juice-app/
   sudo chown -R www-data:www-data /var/www/juice-app
   ```

6. **Настройте nginx**
   ```bash
   # Скопируйте конфиг
   sudo cp deploy/nginx-subdomain.conf /etc/nginx/sites-available/juice-app

   # Отредактируйте server_name
   sudo nano /etc/nginx/sites-available/juice-app
   # Замените: server_name juice.yourdomain.com;

   # Активируйте конфиг
   sudo ln -sf /etc/nginx/sites-available/juice-app /etc/nginx/sites-enabled/

   # Проверьте и перезагрузите
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **Получите SSL сертификат**
   ```bash
   sudo certbot --nginx -d juice.yourdomain.com
   ```

8. **Запустите бота**
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```

### Вариант 2: Путь на существующем домене

**Результат**: `yourdomain.com/juice-app`

#### Преимущества:
- ✅ Не нужна настройка DNS
- ✅ Использует существующий SSL
- ✅ Один домен для всех проектов

#### Недостатки:
- ⚠️ Нужно настроить base path в приложении
- ⚠️ URL будут с префиксом

#### Шаги:

1. **Клонируйте и настройте проект** (шаги 2-4 из Варианта 1)

2. **Настройте base path в Vite**

   Отредактируйте `vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'

   export default defineConfig({
     plugins: [vue()],
     base: '/juice-app/',  // Добавьте эту строку
   })
   ```

3. **Соберите с новым base path**
   ```bash
   npm run build

   # Разверните фронтенд
   sudo mkdir -p /var/www/juice-app
   sudo cp -r dist/* /var/www/juice-app/
   sudo chown -R www-data:www-data /var/www/juice-app
   ```

4. **Добавьте location блоки в существующий nginx конфиг**
   ```bash
   # Найдите конфиг вашего основного сайта
   ls /etc/nginx/sites-enabled/

   # Отредактируйте его
   sudo nano /etc/nginx/sites-enabled/your-main-site
   ```

   Добавьте в существующий `server { }` блок:
   ```nginx
   # Juice App
   location /juice-app {
       alias /var/www/juice-app;
       try_files $uri $uri/ /juice-app/index.html;
   }

   location ~* ^/juice-app/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
       alias /var/www/juice-app;
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

5. **Перезагрузите nginx**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Запустите бота** (шаг 8 из Варианта 1)

### Вариант 3: Альтернативный порт

**Результат**: `yourdomain.com:8080` или `<IP>:8080`

#### Преимущества:
- ✅ Не трогаем существующий nginx конфиг
- ✅ Максимально простая настройка
- ✅ Полная изоляция

#### Недостатки:
- ⚠️ Нужно указывать порт в URL
- ⚠️ Нужно открыть порт в Security Group

#### Шаги:

1. **Откройте порт 8080 в AWS Security Group**
   - AWS Console → EC2 → Security Groups
   - Выберите вашу Security Group
   - Inbound rules → Edit → Add rule
   - Type: Custom TCP, Port: 8080, Source: 0.0.0.0/0

2. **Клонируйте и настройте проект** (шаги 2-5 из Варианта 1)

3. **Настройте nginx**
   ```bash
   sudo cp deploy/nginx-port.conf /etc/nginx/sites-available/juice-app-8080
   sudo ln -sf /etc/nginx/sites-available/juice-app-8080 /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Запустите бота** (шаг 8 из Варианта 1)

5. **Откройте**: `http://yourdomain.com:8080`

## Автоматический деплой

Для всех вариантов можно использовать упрощенный скрипт:

```bash
# Используйте этот скрипт вместо deploy.sh
./deploy/scripts/deploy-with-existing-nginx.sh
```

Скрипт:
- ✅ Соберет и развернет фронтенд
- ✅ Запустит/перезапустит бота
- ✅ Покажет инструкции по настройке nginx

## Telegram Bot и WebApp URL

В настройках бота в BotFather укажите правильный URL:

- **Вариант 1**: `https://juice.yourdomain.com`
- **Вариант 2**: `https://yourdomain.com/juice-app`
- **Вариант 3**: `http://yourdomain.com:8080`

Команды:
```
/mybots
→ Выберите бота
→ Bot Settings
→ Menu Button
→ Edit menu button URL
→ Введите URL
```

## Проверка и тестирование

### Проверьте фронтенд:
```bash
# Файлы на месте?
ls -la /var/www/juice-app

# nginx слушает нужные порты?
sudo netstat -tlnp | grep nginx

# Конфиг правильный?
sudo nginx -t
```

### Проверьте бота:
```bash
# Бот запущен?
pm2 status

# Логи без ошибок?
pm2 logs juice-telegram-bot --lines 50

# .env файл заполнен?
cat .env
```

### Откройте в браузере:
- Вариант 1: `https://juice.yourdomain.com`
- Вариант 2: `https://yourdomain.com/juice-app`
- Вариант 3: `http://yourdomain.com:8080`

## Управление ресурсами

Если ваш t2.micro испытывает нагрузку:

### Проверьте использование:
```bash
# Память
free -h

# CPU
top

# PM2 мониторинг
pm2 monit
```

### Оптимизация:

1. **Добавьте swap** (если еще нет):
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Ограничения уже настроены**:
   - PM2 ограничен 200MB (в ecosystem.config.cjs)
   - nginx настроен эффективно

3. **Мониторинг Docker**:
   ```bash
   docker stats
   ```

## Обновление приложения

```bash
cd /opt/juice-telegram-bot
git pull
npm install
npm run build

# Обновите фронтенд
sudo cp -r dist/* /var/www/juice-app/

# Перезапустите бота
pm2 restart juice-telegram-bot
```

Или используйте:
```bash
./deploy/scripts/update.sh
```

## Troubleshooting

### Конфликт портов
```bash
# Кто использует порт 80?
sudo netstat -tlnp | grep :80

# Docker использует порты?
docker ps
```

### nginx не стартует
```bash
# Проверьте логи
sudo tail -f /var/log/nginx/error.log

# Проверьте конфигурацию
sudo nginx -t

# Возможно конфликт конфигов
ls -la /etc/nginx/sites-enabled/
```

### Приложение не загружается
```bash
# Проверьте файлы
ls -la /var/www/juice-app

# Проверьте права
sudo chown -R www-data:www-data /var/www/juice-app

# Проверьте nginx access log
sudo tail -f /var/log/nginx/access.log
```

### Бот не отвечает
```bash
# Логи PM2
pm2 logs juice-telegram-bot

# Переменные окружения
pm2 env juice-telegram-bot

# Перезапустите
pm2 restart juice-telegram-bot
```

## Сравнение вариантов

| Критерий | Поддомен | Путь | Порт |
|----------|----------|------|------|
| Простота настройки | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Нужен DNS | ✅ Да | ❌ Нет | ❌ Нет |
| Чистые URL | ✅ Да | ❌ Нет | ⚠️ С портом |
| SSL | ✅ Отдельный | ✅ Общий | ⚠️ Сложнее |
| Изоляция | ✅ Полная | ⚠️ Средняя | ✅ Полная |
| **Рекомендация** | **ЛУЧШИЙ** | Приемлемый | Для теста |

## Резюме

### Рекомендуемый вариант: Поддомен
1. Добавьте A-запись: `juice.yourdomain.com → IP`
2. Клонируйте проект в `/opt/juice-telegram-bot`
3. Используйте `deploy/nginx-subdomain.conf`
4. Получите SSL: `sudo certbot --nginx -d juice.yourdomain.com`
5. Запустите бота: `pm2 start ecosystem.config.cjs`

Ваш существующий проект продолжит работать на `yourdomain.com`, а Juice App будет на `juice.yourdomain.com`.

---

**Важно**: Все варианты не затрагивают ваш существующий Docker проект и nginx конфигурацию!
