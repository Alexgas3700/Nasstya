# Руководство по установке и настройке

## 🎯 Цель документа

Это пошаговое руководство поможет вам развернуть и настроить систему email-рассылок на базе n8n с нуля.

## ⏱️ Время установки

- **Базовая установка**: 15-20 минут
- **Полная настройка с БД**: 30-40 минут

## 📋 Системные требования

### Минимальные требования

- **ОС**: Linux, macOS, Windows (с WSL2)
- **RAM**: 512 MB (рекомендуется 1 GB+)
- **Диск**: 500 MB свободного места
- **Node.js**: версия 14.x или выше (для npm установки)
- **Docker**: версия 20.x или выше (для Docker установки)

### Рекомендуемые требования

- **RAM**: 2 GB+
- **CPU**: 2+ ядра
- **Диск**: 2 GB+ (для логов и данных)

## 🚀 Установка n8n

### Вариант 1: Установка через npm (рекомендуется для разработки)

```bash
# Установка Node.js (если не установлен)
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (через Homebrew)
brew install node

# Установка n8n глобально
npm install n8n -g

# Запуск n8n
n8n start

# n8n будет доступен по адресу http://localhost:5678
```

### Вариант 2: Установка через Docker (рекомендуется для продакшена)

```bash
# Создание директории для данных
mkdir -p ~/.n8n

# Запуск n8n в Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Для постоянного запуска (в фоне)
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Вариант 3: Docker Compose (рекомендуется для продакшена с БД)

Создайте файл `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    restart: unless-stopped
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U n8n']
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n
    restart: unless-stopped
    ports:
      - '5678:5678'
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_password
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin_password
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  n8n_data:
```

Запуск:

```bash
docker-compose up -d
```

## 🔐 Первоначальная настройка n8n

### 1. Первый запуск

1. Откройте браузер и перейдите на `http://localhost:5678`
2. Создайте учетную запись администратора:
   - Email
   - Пароль (минимум 8 символов)
3. Подтвердите создание аккаунта

### 2. Настройка безопасности (для продакшена)

Отредактируйте переменные окружения:

```bash
# Для npm установки - создайте ~/.n8n/.env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password

# Для HTTPS
N8N_PROTOCOL=https
N8N_HOST=your-domain.com
N8N_PORT=443

# Webhook URL
WEBHOOK_URL=https://your-domain.com/
```

## 📧 Настройка Email-провайдера

### Вариант 1: Gmail (для тестирования)

#### Шаг 1: Включите двухфакторную аутентификацию

1. Перейдите в настройки Google Account
2. Безопасность → Двухэтапная аутентификация
3. Включите 2FA

#### Шаг 2: Создайте App Password

1. Google Account → Безопасность → App Passwords
2. Выберите "Почта" и "Другое устройство"
3. Скопируйте сгенерированный пароль (16 символов)

#### Шаг 3: Настройте credentials в n8n

1. В n8n: Settings → Credentials → New
2. Выберите "SMTP"
3. Заполните:
   ```
   Name: Gmail SMTP
   Host: smtp.gmail.com
   Port: 587
   Secure: false (TLS)
   User: your-email@gmail.com
   Password: [App Password из шага 2]
   ```
4. Нажмите "Save"

**Лимиты Gmail:**
- 500 писем в день (бесплатный аккаунт)
- 2000 писем в день (Google Workspace)

### Вариант 2: SendGrid (рекомендуется для продакшена)

#### Шаг 1: Регистрация

1. Зарегистрируйтесь на [SendGrid](https://sendgrid.com/)
2. Подтвердите email
3. Заполните профиль компании

#### Шаг 2: Создайте API Key

1. Settings → API Keys → Create API Key
2. Выберите "Full Access" или "Restricted Access"
3. Для Restricted Access дайте права:
   - Mail Send: Full Access
4. Скопируйте API Key (показывается только один раз!)

#### Шаг 3: Верифицируйте домен или email

**Single Sender Verification** (для тестирования):
1. Settings → Sender Authentication → Single Sender Verification
2. Добавьте email отправителя
3. Подтвердите через письмо

**Domain Authentication** (для продакшена):
1. Settings → Sender Authentication → Authenticate Your Domain
2. Следуйте инструкциям для добавления DNS записей
3. Дождитесь верификации (до 48 часов)

#### Шаг 4: Настройте в n8n

В workflow замените ноду "Send Email (SMTP)" на "SendGrid":

1. Добавьте ноду "SendGrid"
2. Credentials → New → SendGrid API
3. Вставьте API Key
4. Настройте параметры ноды:
   ```
   From Email: verified@yourdomain.com
   To Email: {{$json.email}}
   Subject: {{$json.emailSubject}}
   Text/HTML: {{$json.emailBody}}
   ```

**Лимиты SendGrid:**
- 100 писем/день (бесплатно)
- От $19.95/мес за 40,000 писем

### Вариант 3: Mailgun

#### Шаг 1: Регистрация

1. Зарегистрируйтесь на [Mailgun](https://www.mailgun.com/)
2. Подтвердите email

#### Шаг 2: Получите API credentials

1. Settings → API Keys
2. Скопируйте Private API Key
3. Скопируйте Domain (sandbox или ваш домен)

#### Шаг 3: Верифицируйте домен

1. Sending → Domains → Add New Domain
2. Добавьте DNS записи (SPF, DKIM, MX)
3. Дождитесь верификации

#### Шаг 4: Настройте в n8n

1. Добавьте credentials "Mailgun API"
2. Заполните:
   ```
   API Key: [ваш Private API Key]
   Domain: [ваш домен или sandbox]
   ```

**Лимиты Mailgun:**
- 5,000 писем/месяц (бесплатно, первые 3 месяца)
- От $35/мес за 50,000 писем

## 🗄️ Настройка базы данных (опционально)

### PostgreSQL

#### Установка

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=n8n_campaigns \
  -p 5432:5432 \
  postgres:14
```

#### Создание базы и таблицы

```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE n8n_campaigns;

# Подключение к базе
\c n8n_campaigns

# Создание таблицы для логов
CREATE TABLE email_campaign_log (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP,
    campaign_id VARCHAR(100),
    subject TEXT,
    error TEXT,
    recipient_first_name VARCHAR(100),
    recipient_last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_campaign_id ON email_campaign_log(campaign_id);
CREATE INDEX idx_email ON email_campaign_log(email);
CREATE INDEX idx_status ON email_campaign_log(status);
CREATE INDEX idx_created_at ON email_campaign_log(created_at);

-- Создание пользователя для n8n
CREATE USER n8n_user WITH PASSWORD 'n8n_password';
GRANT ALL PRIVILEGES ON DATABASE n8n_campaigns TO n8n_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
```

#### Настройка credentials в n8n

1. Settings → Credentials → New
2. Выберите "PostgreSQL"
3. Заполните:
   ```
   Name: Campaign Database
   Host: localhost
   Database: n8n_campaigns
   User: n8n_user
   Password: n8n_password
   Port: 5432
   SSL: false (для локальной разработки)
   ```

### MySQL (альтернатива)

```sql
-- Создание базы данных
CREATE DATABASE n8n_campaigns CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE n8n_campaigns;

-- Создание таблицы
CREATE TABLE email_campaign_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP NULL,
    campaign_id VARCHAR(100),
    subject TEXT,
    error TEXT,
    recipient_first_name VARCHAR(100),
    recipient_last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📥 Импорт workflow

### Шаг 1: Скачайте workflow

Файл находится в `workflows/email_campaign_workflow.json`

### Шаг 2: Импортируйте в n8n

1. Откройте n8n в браузере
2. Нажмите "Workflows" в левом меню
3. Нажмите "Import from File"
4. Выберите `email_campaign_workflow.json`
5. Нажмите "Import"

### Шаг 3: Настройте ноды

После импорта настройте следующие ноды:

#### 1. Send Email (SMTP)
- Выберите SMTP credentials
- Укажите email отправителя по умолчанию

#### 2. Save to Database (если используете)
- Выберите database credentials
- Проверьте название таблицы

#### 3. Load Email Template
- Укажите шаблон по умолчанию
- Или настройте загрузку из файла/API

#### 4. Schedule Trigger (если нужен автозапуск)
- Настройте расписание
- Или отключите ноду, если не нужна

#### 5. Webhook Trigger (если нужен API)
- Скопируйте URL webhook
- Или отключите ноду, если не нужна

### Шаг 4: Активируйте workflow

1. Нажмите переключатель "Active" в правом верхнем углу
2. Workflow теперь готов к использованию

## ✅ Тестирование установки

### Тест 1: Отправка тестового письма

1. Создайте файл `test_recipients.csv`:
   ```csv
   email,first_name,last_name
   your-test-email@example.com,Test,User
   ```

2. Откройте workflow в n8n
3. Нажмите "Execute Workflow"
4. Загрузите CSV файл
5. Проверьте, что письмо пришло

### Тест 2: Проверка базы данных

```sql
-- Проверка записей в БД
SELECT * FROM email_campaign_log ORDER BY created_at DESC LIMIT 10;
```

### Тест 3: Проверка webhook

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "testMode": true,
    "testEmails": "your-email@example.com",
    "emailSubject": "Test Email",
    "emailTemplate": "Hello {{firstName}}!",
    "senderEmail": "noreply@example.com"
  }'
```

## 🔧 Решение проблем при установке

### n8n не запускается

**Проблема**: Порт 5678 уже занят

```bash
# Проверка занятости порта
lsof -i :5678

# Запуск на другом порту
n8n start --port 5679

# Или в Docker
docker run -p 5679:5678 n8nio/n8n
```

**Проблема**: Недостаточно прав

```bash
# Для npm установки
sudo npm install n8n -g

# Или без sudo (рекомендуется)
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install n8n -g
```

### База данных не подключается

**Проблема**: Connection refused

```bash
# Проверка запущена ли PostgreSQL
sudo systemctl status postgresql

# Запуск PostgreSQL
sudo systemctl start postgresql

# Проверка подключения
psql -U postgres -h localhost -p 5432
```

**Проблема**: Authentication failed

- Проверьте пароль в credentials
- Проверьте права пользователя в БД
- Проверьте `pg_hba.conf` для PostgreSQL

### Email не отправляются

**Проблема**: SMTP Authentication failed

- Для Gmail: используйте App Password, не обычный пароль
- Проверьте правильность host и port
- Проверьте настройку SSL/TLS

**Проблема**: Connection timeout

```bash
# Проверка доступности SMTP сервера
telnet smtp.gmail.com 587

# Проверка firewall
sudo ufw status
sudo ufw allow 587/tcp
```

## 🚀 Продакшен-деплой

### Использование HTTPS

1. Получите SSL сертификат (Let's Encrypt):

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

2. Настройте Nginx как reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Перезапустите Nginx:

```bash
sudo systemctl restart nginx
```

### Настройка автозапуска

#### Systemd service (для npm установки)

Создайте `/etc/systemd/system/n8n.service`:

```ini
[Unit]
Description=n8n - Workflow Automation
After=network.target

[Service]
Type=simple
User=n8n
WorkingDirectory=/home/n8n
ExecStart=/usr/local/bin/n8n start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Активируйте:

```bash
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n
```

### Мониторинг и логирование

```bash
# Просмотр логов n8n (npm)
tail -f ~/.n8n/logs/n8n.log

# Просмотр логов Docker
docker logs -f n8n

# Настройка ротации логов
sudo nano /etc/logrotate.d/n8n
```

## 📚 Следующие шаги

После успешной установки:

1. ✅ Прочитайте основную документацию в `docs/README.md`
2. ✅ Изучите примеры шаблонов в `templates/`
3. ✅ Настройте мониторинг и алерты
4. ✅ Создайте резервные копии workflow и БД
5. ✅ Протестируйте на небольшой группе получателей

---

**Нужна помощь?** Проверьте раздел "Решение проблем" или обратитесь к документации n8n.
