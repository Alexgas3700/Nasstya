# 📧 Система рассылок на базе n8n

Автоматизированная система управления email-кампаниями с использованием платформы n8n.

## 🚀 Возможности

- ✉️ **Массовые рассылки** с персонализацией для каждого получателя
- 📋 **Управление списками** получателей через CSV-файлы
- 🎨 **HTML-шаблоны** с современным дизайном
- ⏰ **Планирование** отправки по расписанию
- 📊 **Мониторинг** статуса доставки и ошибок
- 🔄 **Автоматические повторы** при ошибках
- 🔌 **Интеграция** с SMTP, SendGrid, Mailgun, Amazon SES
- 📱 **Адаптивный дизайн** писем для мобильных устройств

## 📁 Структура проекта

```
/workspace/
├── workflows/
│   └── email_campaign.json          # Workflow n8n для управления рассылками
├── templates/
│   ├── template_example.html        # Основной шаблон с градиентным дизайном
│   ├── template_welcome.html        # Приветственное письмо
│   └── template_newsletter.html     # Новостная рассылка
├── documentation/
│   └── user_guide.md                # Полное руководство пользователя
├── configs/
│   ├── email_service_config.json    # Конфигурация почтовых сервисов
│   └── mailing_list_example.csv     # Пример списка рассылки
└── README.md                         # Этот файл
```

## 🛠️ Установка

### Требования

- **n8n** версии 1.0.0+
- **Node.js** версии 18.x+
- Доступ к почтовому сервису (SMTP/SendGrid/Mailgun/Amazon SES)

### Вариант 1: Установка через npm

```bash
# Установка n8n глобально
npm install -g n8n

# Запуск n8n
n8n start
```

### Вариант 2: Установка через Docker

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -v $(pwd)/workflows:/workflows \
  -v $(pwd)/templates:/templates \
  n8nio/n8n
```

### Вариант 3: Docker Compose

```bash
# Запуск через docker-compose
docker-compose up -d
```

## ⚙️ Быстрый старт

### Шаг 1: Импорт workflow

1. Откройте n8n в браузере: `http://localhost:5678`
2. Перейдите в раздел "Workflows"
3. Нажмите "Import from File"
4. Выберите файл `workflows/email_campaign.json`

### Шаг 2: Настройка credentials

1. Откройте Settings → Credentials
2. Добавьте SMTP credentials:
   - Host: `smtp.gmail.com` (или ваш SMTP-сервер)
   - Port: `587`
   - User: `your-email@gmail.com`
   - Password: `your-app-password`

### Шаг 3: Подготовка списка рассылки

Создайте CSV-файл с получателями:

```csv
email,firstName,lastName,customField1,customField2
john@example.com,John,Doe,Premium,Active
jane@example.com,Jane,Smith,Standard,Active
```

### Шаг 4: Запуск кампании

1. Откройте импортированный workflow
2. Настройте путь к CSV-файлу в узле "Get Mailing List"
3. Выберите шаблон в узле "Load Email Template"
4. Нажмите "Execute Workflow"

## 📧 Настройка почтовых сервисов

### SMTP (Gmail, Yandex, Mail.ru)

```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "your-email@gmail.com",
    "pass": "your-app-password"
  }
}
```

### SendGrid

```json
{
  "apiKey": "YOUR_SENDGRID_API_KEY",
  "fromEmail": "noreply@yourdomain.com"
}
```

### Mailgun

```json
{
  "apiKey": "YOUR_MAILGUN_API_KEY",
  "domain": "yourdomain.com"
}
```

### Amazon SES

```json
{
  "region": "us-east-1",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY",
  "secretAccessKey": "YOUR_AWS_SECRET_KEY"
}
```

Подробная инструкция по настройке: [documentation/user_guide.md](documentation/user_guide.md)

## 🎨 Работа с шаблонами

### Доступные шаблоны

1. **template_example.html** — основной шаблон с градиентным дизайном
2. **template_welcome.html** — приветственное письмо для новых пользователей
3. **template_newsletter.html** — шаблон для новостных рассылок

### Переменные шаблона

Используйте следующие переменные в HTML-шаблонах:

- `{{firstName}}` — имя получателя
- `{{lastName}}` — фамилия получателя
- `{{email}}` — email получателя
- `{{customField1}}` — кастомное поле 1
- `{{customField2}}` — кастомное поле 2
- `{{unsubscribeLink}}` — ссылка для отписки

### Пример использования

```html
<h1>Здравствуйте, {{firstName}} {{lastName}}!</h1>
<p>Ваш email: {{email}}</p>
<p>Статус: {{customField1}}</p>
<a href="{{unsubscribeLink}}">Отписаться</a>
```

## ⏰ Планирование рассылок

Workflow поддерживает три способа запуска:

### 1. Ручной запуск
Нажмите "Execute Workflow" в интерфейсе n8n

### 2. По расписанию (Cron)
Настройте Schedule Trigger:

```
0 9 * * 1        # Каждый понедельник в 9:00
0 10 * * 1-5     # Будни в 10:00
0 14 1 * *       # 1-е число месяца в 14:00
```

### 3. Через Webhook
Отправьте POST-запрос:

```bash
curl -X POST https://your-n8n.com/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_name": "Summer Sale",
    "template_name": "template_example",
    "sender_email": "marketing@example.com"
  }'
```

## 📊 Мониторинг и логирование

Система автоматически ведет логи:

- **Успешные отправки**: `/data/logs/success_YYYY-MM-DD.json`
- **Ошибки**: `/data/logs/errors_YYYY-MM-DD.json`

Просмотр статистики:
1. Откройте workflow в n8n
2. Перейдите в "Executions"
3. Выберите нужное выполнение

## 🔧 Настройка параметров

Все настройки находятся в файле `configs/email_service_config.json`:

- Лимиты отправки (rate limits)
- Параметры кампаний по умолчанию
- Настройки логирования
- Политики повторных попыток
- Параметры безопасности и соответствия GDPR

## 🛡️ Безопасность и соответствие

### GDPR
- ✅ Ссылка отписки в каждом письме
- ✅ Хранение согласия на обработку данных
- ✅ Удаление данных по запросу

### CAN-SPAM Act
- ✅ Физический адрес компании
- ✅ Честные заголовки
- ✅ Обработка отписок

## 📖 Документация

Полное руководство пользователя: [documentation/user_guide.md](documentation/user_guide.md)

## 🐛 Устранение неполадок

### Письма не отправляются
1. Проверьте credentials в n8n
2. Убедитесь в доступности SMTP-сервера
3. Проверьте логи: `~/.n8n/logs/`

### Письма попадают в спам
1. Настройте SPF, DKIM, DMARC
2. Используйте верифицированный домен
3. Избегайте спам-слов
4. Включите ссылку отписки

### Низкая скорость отправки
1. Увеличьте `batchSize`
2. Уменьшите задержку между батчами
3. Используйте SendGrid или Amazon SES

## 🤝 Поддержка

- **n8n документация**: https://docs.n8n.io
- **n8n community**: https://community.n8n.io
- **GitHub Issues**: Создайте issue в этом репозитории

## 📝 Лицензия

Этот проект создан для демонстрации возможностей n8n в области email-маркетинга.

## 🎯 Roadmap

- [ ] Интеграция с Google Sheets для управления списками
- [ ] A/B тестирование шаблонов
- [ ] Дашборд с аналитикой
- [ ] Автоматическая сегментация получателей
- [ ] Интеграция с CRM-системами
- [ ] Триггерные письма на основе событий

---

**Версия**: 1.0.0  
**Дата**: 21 января 2026  
**Автор**: Email Campaign System Team

🚀 **Удачных рассылок!**
