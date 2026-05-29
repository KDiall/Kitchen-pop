create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  served_on date not null unique,
  cutoff_at timestamptz not null
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menus(id) on delete cascade,
  name text not null,
  price_cents int not null,
  available boolean not null default true
);

-- status: pending → paid → delivered
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  reference text not null unique,
  phone text not null,
  total_cents int not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id),
  name text not null,
  price_cents int not null,
  qty int not null
);

insert into menus (served_on, cutoff_at)
values (current_date, (current_date::timestamptz + interval '17 hours'))
on conflict (served_on) do nothing;

insert into menu_items (menu_id, name, price_cents)
select m.id, x.name, x.price
from menus m,
  (values
    ('Jollof Rice with Chicken', 4500),
    ('Cassava Leaves with Fish', 5000),
    ('Groundnut Stew with Beef', 5500),
    ('Okra Soup with Rice', 4000),
    ('Pepper Soup', 3500),
    ('Plantain & Beans', 3000)
  ) as x(name, price)
where m.served_on = current_date
  and not exists (
    select 1 from menu_items mi where mi.menu_id = m.id and mi.name = x.name
  );
