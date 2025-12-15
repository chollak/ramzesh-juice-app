# Быстрый деплой на AWS

Краткая инструкция для деплоя на AWS EC2 Free Tier.

## Предварительные требования

- [ ] Создан EC2 инстанс (Ubuntu 22.04, t2.micro)
- [ ] Открыты порты: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] Настроена база данных Supabase
- [ ] Получен Telegram Bot токен

## Шаги деплоя

### 1. Подключитесь к серверу

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 2. Клонируйте репозиторий

```bash
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git juice-telegram-bot
sudo chown -R ubuntu:ubuntu juice-telegram-bot
cd juice-telegram-bot
```

### 3. Настройте сервер (только первый раз)

```bash
chmod +x deploy/scripts/setup-server.sh
./deploy/scripts/setup-server.sh
```

### 4. Создайте .env файл

```bash
cp .env.example .env
nano .env
```

Заполните:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
TELEGRAM_BOT_TOKEN=your-bot-token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### 5. Задеплойте

```bash
chmod +x deploy/scripts/deploy.sh
./deploy/scripts/deploy.sh
```

### 6. Проверьте

```bash
pm2 status
pm2 logs juice-telegram-bot
```

Откройте: `http://YOUR_EC2_IP`

## Обновление

```bash
cd /opt/juice-telegram-bot
git pull
./deploy/scripts/deploy.sh
```

## Полезные команды

```bash
# Статус бота
pm2 status

# Логи бота
pm2 logs juice-telegram-bot

# Перезапуск бота
pm2 restart juice-telegram-bot

# Статус nginx
sudo systemctl status nginx

# Логи nginx
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

**Бот не работает?**
```bash
pm2 logs juice-telegram-bot
cat .env  # Проверьте переменные
```

**Сайт не открывается?**
```bash
sudo systemctl status nginx
ls -la /var/www/juice-app
sudo tail -f /var/log/nginx/error.log
```

**Мало памяти?**
```bash
free -h
# Добавьте swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## SSL (опционально)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

Подробная документация: [AWS_DEPLOYMENT.md](../AWS_DEPLOYMENT.md)
