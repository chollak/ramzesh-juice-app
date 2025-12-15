-- ============================================
-- Миграция для упрощения заказов с Telegram
-- ============================================

-- Добавляем новые поля для хранения Telegram данных напрямую в заказах
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT,
  ADD COLUMN IF NOT EXISTS user_first_name TEXT,
  ADD COLUMN IF NOT EXISTS user_last_name TEXT;

-- Делаем user_id опциональным (nullable)
ALTER TABLE orders
  ALTER COLUMN user_id DROP NOT NULL;

-- Делаем phone_number опциональным (nullable)
ALTER TABLE orders
  ALTER COLUMN phone_number DROP NOT NULL;

-- Удаляем поля адреса (они больше не нужны)
ALTER TABLE orders
  DROP COLUMN IF EXISTS delivery_address_id,
  DROP COLUMN IF EXISTS delivery_address_text;

-- Добавляем индекс для telegram_user_id для быстрого поиска заказов пользователя
CREATE INDEX IF NOT EXISTS idx_orders_telegram_user_id ON orders(telegram_user_id);

-- Комментарии для документации
COMMENT ON COLUMN orders.telegram_user_id IS 'ID пользователя в Telegram';
COMMENT ON COLUMN orders.telegram_username IS 'Username пользователя в Telegram';
COMMENT ON COLUMN orders.user_first_name IS 'Имя пользователя из Telegram';
COMMENT ON COLUMN orders.user_last_name IS 'Фамилия пользователя из Telegram';
COMMENT ON COLUMN orders.phone_number IS 'Номер телефона из Telegram (если доступен)';
COMMENT ON COLUMN orders.comment IS 'Комментарий к заказу от пользователя';

-- ============================================
-- Готово!
-- ============================================
