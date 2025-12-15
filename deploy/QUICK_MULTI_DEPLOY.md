# Быстрый деплой на сервер с существующими проектами

Краткая инструкция если на сервере уже есть другие проекты.

## Выберите вариант

### 1. Поддомен (рекомендуется) - `juice.yourdomain.com`

```bash
# 1. Добавьте A-запись в DNS: juice → ваш IP

# 2. На сервере
cd /opt
sudo git clone https://github.com/YOUR_USER/YOUR_REPO.git juice-telegram-bot
sudo chown -R $USER:$USER juice-telegram-bot
cd juice-telegram-bot

# 3. Установите зависимости
sudo npm install -g pm2
npm install

# 4. Создайте .env
cp .env.example .env
nano .env  # Заполните

# 5. Соберите и разверните
npm run build
sudo mkdir -p /var/www/juice-app
sudo cp -r dist/* /var/www/juice-app/
sudo chown -R www-data:www-data /var/www/juice-app

# 6. Настройте nginx
sudo cp deploy/nginx-subdomain.conf /etc/nginx/sites-available/juice-app
sudo nano /etc/nginx/sites-available/juice-app  # Измените server_name
sudo ln -sf /etc/nginx/sites-available/juice-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. SSL
sudo certbot --nginx -d juice.yourdomain.com

# 8. Запустите бота
pm2 start ecosystem.config.cjs
pm2 save
```

### 2. Путь - `yourdomain.com/juice-app`

```bash
# 1-4. Те же шаги что и выше

# 5. Добавьте base path в vite.config.js
echo "base: '/juice-app/'," >> vite.config.js  # Добавьте в defineConfig

# 6. Соберите
npm run build
sudo mkdir -p /var/www/juice-app
sudo cp -r dist/* /var/www/juice-app/
sudo chown -R www-data:www-data /var/www/juice-app

# 7. Добавьте в существующий nginx конфиг
sudo nano /etc/nginx/sites-enabled/your-existing-site
# Добавьте содержимое из deploy/nginx-path.conf

sudo nginx -t && sudo systemctl reload nginx

# 8. Запустите бота (как в варианте 1, шаг 8)
```

### 3. Порт 8080 - `yourdomain.com:8080`

```bash
# 1. Откройте порт 8080 в AWS Security Group

# 2-5. Те же шаги что и в варианте 1

# 6. Настройте nginx
sudo cp deploy/nginx-port.conf /etc/nginx/sites-available/juice-app-8080
sudo ln -sf /etc/nginx/sites-available/juice-app-8080 /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. Запустите бота (как в варианте 1, шаг 8)
```

## Автоматический деплой

```bash
./deploy/scripts/deploy-with-existing-nginx.sh
```

## Проверка

```bash
# Фронтенд
curl http://localhost  # или :8080
ls -la /var/www/juice-app

# Бот
pm2 status
pm2 logs juice-telegram-bot

# nginx
sudo nginx -t
sudo systemctl status nginx
```

## Обновление

```bash
cd /opt/juice-telegram-bot
git pull
npm run build
sudo cp -r dist/* /var/www/juice-app/
pm2 restart juice-telegram-bot
```

---

Подробная документация: [MULTI_PROJECT_DEPLOY.md](../MULTI_PROJECT_DEPLOY.md)
