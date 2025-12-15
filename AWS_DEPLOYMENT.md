# Деплой на AWS EC2 Free Tier

Это руководство поможет развернуть Juice Telegram App на бесплатном сервере AWS EC2 (t2.micro).

## Требования

- Аккаунт AWS (с доступом к Free Tier)
- SSH клиент
- Готовая база данных Supabase (см. SUPABASE_SETUP.md)
- Telegram Bot токен (см. TELEGRAM_SETUP.md)

## Шаг 1: Создание EC2 инстанса

### 1.1 Запуск инстанса

1. Войдите в AWS Console
2. Перейдите в EC2 Dashboard
3. Нажмите **Launch Instance**
4. Выберите настройки:
   - **Name**: juice-telegram-app
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: t2.micro (Free tier eligible)
   - **Key pair**: Создайте новую или используйте существующую
   - **Network settings**:
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere

### 1.2 Настройка Security Group

Убедитесь, что в Security Group открыты порты:
- **22** (SSH) - только с вашего IP
- **80** (HTTP) - 0.0.0.0/0
- **443** (HTTPS) - 0.0.0.0/0

## Шаг 2: Подключение к серверу

```bash
# Установите права на ключ
chmod 400 your-key.pem

# Подключитесь к серверу
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## Шаг 3: Первоначальная настройка сервера

### 3.1 Клонируйте репозиторий

```bash
# Установите git если нужно
sudo apt update
sudo apt install -y git

# Клонируйте проект
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git juice-telegram-bot
sudo chown -R ubuntu:ubuntu juice-telegram-bot
cd juice-telegram-bot
```

### 3.2 Запустите скрипт настройки

```bash
# Сделайте скрипт исполняемым (если еще не сделано)
chmod +x deploy/scripts/setup-server.sh

# Запустите установку
./deploy/scripts/setup-server.sh
```

Этот скрипт автоматически установит:
- Node.js 20.x
- nginx
- PM2 (менеджер процессов)
- Настроит firewall (ufw)
- Создаст необходимые директории

## Шаг 4: Настройка приложения

### 4.1 Создайте .env файл

```bash
cp .env.example .env
nano .env
```

Заполните все переменные окружения:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token

# Supabase for Bot (backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Шаг 5: Деплой приложения

```bash
# Запустите скрипт деплоя
./deploy/scripts/deploy.sh
```

Этот скрипт:
- Установит зависимости
- Соберет фронтенд
- Развернет статические файлы в nginx
- Запустит Telegram бота через PM2

## Шаг 6: Проверка

### 6.1 Проверьте статус бота

```bash
pm2 status
pm2 logs juice-telegram-bot
```

### 6.2 Проверьте nginx

```bash
sudo systemctl status nginx
```

### 6.3 Откройте приложение

Откройте в браузере: `http://YOUR_EC2_PUBLIC_IP`

## Обновление приложения

Для обновления после изменений в коде:

```bash
cd /opt/juice-telegram-bot
./deploy/scripts/update.sh
```

## Полезные команды

### PM2 (управление ботом)

```bash
# Статус
pm2 status

# Логи
pm2 logs juice-telegram-bot

# Перезапуск
pm2 restart juice-telegram-bot

# Остановка
pm2 stop juice-telegram-bot
```

### nginx

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Мониторинг системы

```bash
# Использование памяти
free -h

# Использование диска
df -h

# Процессы
htop
```

## Настройка домена (опционально)

Если у вас есть домен:

1. **Создайте A-запись** в DNS провайдере, указывающую на IP вашего EC2

2. **Обновите nginx конфигурацию**:
```bash
nano /opt/juice-telegram-bot/deploy/nginx.conf
```

Измените `server_name _;` на `server_name yourdomain.com;`

3. **Установите SSL с Let's Encrypt**:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

4. **Перезапустите nginx**:
```bash
sudo systemctl restart nginx
```

## Оптимизация для Free Tier

EC2 t2.micro имеет ограничения:
- 1 vCPU
- 1 GB RAM
- 8 GB SSD (можно расширить до 30 GB бесплатно)

### Рекомендации:

1. **Настройте swap** (для дополнительной памяти):
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

2. **Ограничьте память PM2**:
   - Уже настроено в `ecosystem.config.cjs` (max 200MB)

3. **Мониторинг ресурсов**:
```bash
# Установите htop для мониторинга
sudo apt install -y htop

# Мониторинг в реальном времени
htop
```

## Резервное копирование

### Создание снимка (snapshot)

1. AWS Console → EC2 → Volumes
2. Выберите volume вашего инстанса
3. Actions → Create Snapshot

### Автоматическое резервное копирование

```bash
# Создайте скрипт бэкапа .env
mkdir -p ~/backups
cp /opt/juice-telegram-bot/.env ~/backups/.env.backup
```

## Troubleshooting

### Бот не запускается

```bash
# Проверьте логи
pm2 logs juice-telegram-bot

# Проверьте .env файл
cat .env

# Перезапустите
pm2 restart juice-telegram-bot
```

### Сайт не открывается

```bash
# Проверьте nginx
sudo systemctl status nginx
sudo nginx -t

# Проверьте файлы
ls -la /var/www/juice-app

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

### Мало памяти

```bash
# Проверьте использование
free -h
pm2 monit

# Добавьте swap (см. раздел "Оптимизация")
```

## Безопасность

1. **Регулярно обновляйте систему**:
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Настройте автоматические обновления безопасности**:
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

3. **Не храните секреты в git**:
   - .env файл уже в .gitignore
   - Никогда не коммитьте токены и ключи

4. **Ограничьте SSH доступ**:
   - Используйте только SSH ключи
   - Закройте SSH для всех кроме вашего IP

## Мониторинг и логи

### Настройка CloudWatch (опционально)

AWS предлагает бесплатный мониторинг CloudWatch:
- CPU utilization
- Network in/out
- Disk read/write

### Централизованные логи

```bash
# Все логи в одном месте
mkdir -p /opt/juice-telegram-bot/logs

# PM2 логи уже настроены в ecosystem.config.cjs
# Nginx логи в /var/log/nginx/
```

## Стоимость

При использовании AWS Free Tier:
- **EC2 t2.micro**: 750 часов/месяц бесплатно (достаточно для 1 инстанса 24/7)
- **EBS Storage**: 30 GB бесплатно
- **Data Transfer**: 15 GB исходящего трафика бесплатно

**Важно**: Следите за использованием в AWS Console, чтобы не превысить лимиты!

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `pm2 logs` и `sudo tail -f /var/log/nginx/error.log`
2. Убедитесь, что .env файл заполнен правильно
3. Проверьте Security Group в AWS
4. Проверьте доступность Supabase

---

**Готово!** Ваше приложение теперь работает на AWS EC2 Free Tier.
