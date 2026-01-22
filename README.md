# N8N Email Campaign Integration

Комплексное решение для автоматизации email-рассылок на базе платформы n8n.

## 🚀 Быстрый старт

```bash
# 1. Установите n8n
npm install n8n -g

# 2. Запустите n8n
n8n start

# 3. Импортируйте workflow
# Откройте http://localhost:5678
# Workflows → Import from File → выберите workflows/email_campaign_workflow.json

# 4. Настройте SMTP credentials и запустите!
```

## ✨ Возможности

- ✅ **Импорт получателей из CSV** - загрузка списков email-адресов
- ✅ **Персонализация писем** - шаблоны с переменными {{firstName}}, {{email}} и др.
- ✅ **Тестовый режим** - отправка на тестовые адреса перед полной рассылкой
- ✅ **Отслеживание статуса** - мониторинг доставки и ошибок
- ✅ **Планирование** - автоматический запуск по расписанию
- ✅ **Webhook API** - интеграция через HTTP API
- ✅ **Статистика** - агрегация результатов кампаний

## 📁 Структура проекта

```
/workspace/
├── workflows/
│   └── email_campaign_workflow.json    # Основной workflow n8n
├── templates/
│   ├── welcome_template.html           # Приветственное письмо
│   ├── newsletter_template.html        # Новостная рассылка
│   ├── promotional_template.html       # Рекламное письмо
│   ├── simple_text_template.txt        # Текстовый шаблон
│   └── example_recipients.csv          # Пример CSV-файла
└── docs/
    ├── README.md                        # Полная документация
    ├── SETUP_GUIDE.md                   # Руководство по установке
    └── API_REFERENCE.md                 # API документация
```

## 📖 Документация

- **[Полная документация](docs/README.md)** - подробное описание всех возможностей
- **[Руководство по установке](docs/SETUP_GUIDE.md)** - пошаговая инструкция
- **[API Reference](docs/API_REFERENCE.md)** - документация по Webhook API

## 🎯 Основные сценарии использования

### 1. Приветственные письма
Автоматическая отправка welcome-писем новым пользователям.

### 2. Новостные рассылки
Регулярная отправка обновлений и новостей подписчикам.

### 3. Рекламные кампании
Таргетированные рекламные рассылки с персонализацией.

### 4. Транзакционные письма
Уведомления о заказах, подтверждения и т.д.

## 🛠️ Технологии

- **n8n** - платформа для автоматизации workflow
- **SMTP/SendGrid/Mailgun** - отправка email
- **PostgreSQL/MySQL** - хранение логов (опционально)
- **CSV** - формат импорта получателей
- **HTML/CSS** - шаблоны писем

## 📧 Пример использования

### Через интерфейс n8n

1. Откройте workflow в n8n
2. Загрузите CSV с получателями
3. Выберите шаблон
4. Нажмите "Execute Workflow"

### Через API

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "emailSubject": "Welcome!",
    "emailTemplate": "Hello {{firstName}}!",
    "senderEmail": "noreply@example.com",
    "recipients": [
      {"email": "john@example.com", "firstName": "John"}
    ]
  }'
```

## 🔧 Требования

- **n8n** v1.0+
- **Node.js** 14+ (для npm установки)
- **Docker** 20+ (для Docker установки)
- **SMTP сервер** или API ключ email-сервиса
- **База данных** (опционально, для логирования)

## 📊 Поддерживаемые email-провайдеры

- ✅ Gmail (SMTP)
- ✅ SendGrid (API)
- ✅ Mailgun (API)
- ✅ Amazon SES
- ✅ Postmark
- ✅ Любой SMTP сервер

## 🔒 Безопасность

- API ключи для webhook
- HTTPS для продакшена
- Валидация входных данных
- Rate limiting
- GDPR compliance

## 📈 Производительность

- Обработка до 10,000 писем/час
- Поддержка батчинга
- Асинхронная обработка
- Масштабируемость через Docker

## 🤝 Поддержка

Если возникли вопросы:

1. Проверьте [документацию](docs/README.md)
2. Изучите [руководство по установке](docs/SETUP_GUIDE.md)
3. Посмотрите логи n8n
4. Обратитесь к [документации n8n](https://docs.n8n.io/)

## 📝 Лицензия

Проект предоставляется "как есть" для использования и модификации.

## 🎉 Начните прямо сейчас!

```bash
# Установите n8n
npm install n8n -g

# Запустите
n8n start

# Откройте в браузере
open http://localhost:5678
```

---

**Версия:** 1.0.0  
**Дата:** 22 января 2026  
**Совместимость:** n8n v1.0+
