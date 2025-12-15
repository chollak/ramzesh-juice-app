-- ============================================
-- SQL Schema для приложения заказа соков
-- Supabase Version
-- ============================================

-- Таблица категорий
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица соков
create table juices (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  price decimal(10, 2) not null,
  volume_ml integer default 500,
  is_available boolean default true,
  available_date date default current_date,
  ingredients text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица пользователей
create table users (
  id uuid default gen_random_uuid() primary key,
  telegram_id bigint unique not null,
  username text,
  first_name text,
  last_name text,
  phone_number text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица адресов доставки
create table delivery_addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  address text not null,
  apartment text,
  entrance text,
  floor text,
  comment text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица заказов
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  order_number text unique not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled')),
  total_amount decimal(10, 2) not null,
  delivery_address_id uuid references delivery_addresses(id),
  delivery_address_text text,
  phone_number text not null,
  comment text,
  payment_method text default 'cash' check (payment_method in ('cash', 'card')),
  delivery_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица позиций заказа
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  juice_id uuid references juices(id),
  juice_name text not null,
  quantity integer not null check (quantity > 0),
  price decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаём индексы для улучшения производительности
create index idx_juices_category_id on juices(category_id);
create index idx_juices_available on juices(is_available, available_date);
create index idx_orders_user_id on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at desc);
create index idx_order_items_order_id on order_items(order_id);
create index idx_users_telegram_id on users(telegram_id);

-- Функция для автоматического обновления updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Триггеры для автоматического обновления updated_at
create trigger update_categories_updated_at before update on categories
  for each row execute procedure update_updated_at_column();

create trigger update_juices_updated_at before update on juices
  for each row execute procedure update_updated_at_column();

create trigger update_users_updated_at before update on users
  for each row execute procedure update_updated_at_column();

create trigger update_orders_updated_at before update on orders
  for each row execute procedure update_updated_at_column();

-- Функция для генерации номера заказа
create or replace function generate_order_number()
returns trigger as $$
begin
  new.order_number = 'ORD-' || to_char(new.created_at, 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

-- Последовательность для номеров заказов
create sequence order_number_seq;

-- Триггер для автоматической генерации номера заказа
create trigger set_order_number before insert on orders
  for each row execute procedure generate_order_number();

-- ============================================
-- Row Level Security (RLS) - Упрощённая версия
-- ============================================

-- Категории - доступны всем для чтения
alter table categories enable row level security;

create policy "Anyone can view active categories" 
  on categories for select 
  using (is_active = true);

create policy "Service role can manage categories" 
  on categories for all 
  using (true);

-- Соки - доступны всем для чтения
alter table juices enable row level security;

create policy "Anyone can view available juices" 
  on juices for select 
  using (is_available = true);

create policy "Service role can manage juices" 
  on juices for all 
  using (true);

-- Пользователи - упрощённый доступ
alter table users enable row level security;

create policy "Anyone can insert users" 
  on users for insert 
  with check (true);

create policy "Users can view all users" 
  on users for select 
  using (true);

create policy "Service role can manage users" 
  on users for all 
  using (true);

-- Адреса доставки - упрощённый доступ
alter table delivery_addresses enable row level security;

create policy "Anyone can manage addresses" 
  on delivery_addresses for all 
  using (true);

-- Заказы - упрощённый доступ
alter table orders enable row level security;

create policy "Anyone can view orders" 
  on orders for select 
  using (true);

create policy "Anyone can create orders" 
  on orders for insert 
  with check (true);

create policy "Anyone can update orders" 
  on orders for update 
  using (true);

-- Позиции заказа - упрощённый доступ
alter table order_items enable row level security;

create policy "Anyone can view order items" 
  on order_items for select 
  using (true);

create policy "Anyone can create order items" 
  on order_items for insert 
  with check (true);

-- ============================================
-- Тестовые данные
-- ============================================

-- Категории
insert into categories (name, description, display_order) values
  ('Цитрусовые', 'Свежие соки из цитрусовых фруктов', 1),
  ('Ягодные', 'Соки из спелых ягод', 2),
  ('Овощные', 'Полезные овощные соки', 3),
  ('Миксы', 'Авторские комбинации', 4);

-- Соки (примеры)
insert into juices (category_id, name, description, price, volume_ml, ingredients, image_url) 
select 
  c.id,
  'Апельсиновый фреш',
  'Свежевыжатый сок из сладких апельсинов',
  350.00,
  500,
  array['Апельсины'],
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'
from categories c where c.name = 'Цитрусовые';

insert into juices (category_id, name, description, price, volume_ml, ingredients, image_url)
select 
  c.id,
  'Грейпфрутовый',
  'Бодрящий сок из розового грейпфрута',
  380.00,
  500,
  array['Грейпфрут розовый'],
  'https://images.unsplash.com/photo-1609401662589-cdbb6ea0d484?w=400'
from categories c where c.name = 'Цитрусовые';

insert into juices (category_id, name, description, price, volume_ml, ingredients, image_url)
select 
  c.id,
  'Клубничный смузи',
  'Густой смузи из свежей клубники',
  420.00,
  500,
  array['Клубника', 'Банан', 'Йогурт'],
  'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400'
from categories c where c.name = 'Ягодные';

insert into juices (category_id, name, description, price, volume_ml, ingredients, image_url)
select 
  c.id,
  'Морковный детокс',
  'Очищающий морковный сок с имбирем',
  320.00,
  500,
  array['Морковь', 'Имбирь', 'Лимон'],
  'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400'
from categories c where c.name = 'Овощные';

insert into juices (category_id, name, description, price, volume_ml, ingredients, image_url)
select 
  c.id,
  'Зелёный энергия',
  'Микс зелени и фруктов',
  450.00,
  500,
  array['Шпинат', 'Огурец', 'Яблоко', 'Сельдерей', 'Лимон'],
  'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400'
from categories c where c.name = 'Миксы';

-- ============================================
-- Готово!
-- ============================================

-- После выполнения этого скрипта:
-- 1. Проверьте данные в Table Editor
-- 2. Добавьте себя как администратора (is_admin = true)
-- 3. Начните использовать приложение!
