# Parts Catalog 

Каталог автозапчастей с автосинхронизацией карточек из Ozon Seller API (read-only) и админ-панелью для ручного редактирования контента.

## Архитектура

```
[Ozon Seller API] -> sync_worker (APScheduler) -> PostgreSQL -> FastAPI -> nginx -> React/MUI
                                                                   ^
                                                        Admin API (Bearer token)
```

## Ключевая логика: manual_override

- Синхронизатор (`app/sync_ozon.py`) обновляет **все** поля товара из Ozon при каждом запуске.
- Как только администратор редактирует карточку через `/admin/*` API, у неё выставляется `manual_override = true`.
- После этого синхронизатор **перестаёт трогать** `name`, `description`, `brand`, `category_name` и фотографии этой карточки.
- Цена, остатки и статус модерации продолжают обновляться из Ozon всегда, независимо от `manual_override` — это коммерчески значимые данные.
- Кнопка «Вернуть автосинхронизацию» в админке сбрасывает флаг.

## Быстрый старт на сервере

```bash
git clone https://github.com/aixunibp-byte/parts-catalog.git
cd parts-catalog
cp .env.example .env
nano .env   # заполнить DB_PASSWORD, OZON_CLIENT_ID, OZON_API_KEY, ADMIN_TOKEN
chmod 600 .env

# Генерация секретов:
#   openssl rand -hex 32   -> ADMIN_TOKEN, APP_SECRET_KEY
#   openssl rand -base64 24 -> DB_PASSWORD

cd frontend
npm install
npm run build
cd ..

docker compose up -d --build
docker compose logs -f
```

## Проверка

```bash
curl http://localhost/api/health
curl http://localhost/api/parts
```

Админка: `http://your-domain/admin/login` — вход по токену из `ADMIN_TOKEN`.

## Структура

- `app/` — FastAPI backend, модели SQLAlchemy, синхронизатор Ozon, admin API
- `frontend/` — React + MUI, витрина каталога и админ-панель
- `nginx/` — reverse proxy конфиг
- `docker-compose.yml` — оркестрация: db, api, sync_worker, nginx
