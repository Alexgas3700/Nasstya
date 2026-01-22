# API Reference - Email Campaign Workflow

## 📡 Webhook API

Workflow поддерживает запуск через HTTP webhook для интеграции с внешними системами.

### Base URL

```
http://your-n8n-instance:5678/webhook/email-campaign
```

Для продакшена с HTTPS:
```
https://your-domain.com/webhook/email-campaign
```

## 🔐 Аутентификация

### Basic Authentication (опционально)

Если в n8n включена базовая аутентификация:

```bash
curl -X POST https://your-domain.com/webhook/email-campaign \
  -u username:password \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Header Authentication (рекомендуется)

Добавьте ноду "HTTP Request" в начало workflow для проверки API ключа:

```javascript
// В ноде Code перед обработкой
const apiKey = $request.headers['x-api-key'];
const validKey = 'your-secret-api-key';

if (apiKey !== validKey) {
  throw new Error('Invalid API key');
}

return [{ json: $json }];
```

Использование:

```bash
curl -X POST https://your-domain.com/webhook/email-campaign \
  -H "X-API-Key: your-secret-api-key" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## 📨 Endpoints

### POST /webhook/email-campaign

Запускает email-кампанию с указанными параметрами.

#### Request Body

```json
{
  "campaignName": "string (optional)",
  "emailSubject": "string (required)",
  "emailTemplate": "string (required)",
  "senderEmail": "string (required)",
  "senderName": "string (optional)",
  "recipients": [
    {
      "email": "string (required)",
      "firstName": "string (optional)",
      "lastName": "string (optional)",
      "customFields": {
        "key": "value"
      }
    }
  ],
  "csvData": "string (optional, alternative to recipients)",
  "testMode": "boolean (optional, default: false)",
  "testEmails": "string (optional, comma-separated)",
  "webhookUrl": "string (optional)",
  "scheduleTime": "string (optional, ISO 8601 format)"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignName` | string | No | Название кампании для идентификации |
| `emailSubject` | string | Yes | Тема письма |
| `emailTemplate` | string | Yes | HTML или текст письма с переменными |
| `senderEmail` | string | Yes | Email отправителя |
| `senderName` | string | No | Имя отправителя |
| `recipients` | array | Yes* | Массив получателей |
| `csvData` | string | Yes* | CSV данные в виде строки |
| `testMode` | boolean | No | Режим тестирования (default: false) |
| `testEmails` | string | No | Список тестовых email через запятую |
| `webhookUrl` | string | No | URL для отправки статистики |
| `scheduleTime` | string | No | Время запуска (ISO 8601) |

\* Требуется либо `recipients`, либо `csvData`

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "campaignId": "workflow-12345",
  "status": "processing",
  "totalRecipients": 100,
  "message": "Campaign started successfully"
}
```

**Error (400 Bad Request)**

```json
{
  "success": false,
  "error": "Missing required parameter: emailSubject",
  "code": "MISSING_PARAMETER"
}
```

**Error (500 Internal Server Error)**

```json
{
  "success": false,
  "error": "Failed to send emails",
  "code": "SEND_ERROR",
  "details": "SMTP connection failed"
}
```

## 📝 Examples

### Example 1: Simple Campaign

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "emailSubject": "Welcome to Our Service",
    "emailTemplate": "<h1>Hello {{firstName}}!</h1><p>Welcome to our platform.</p>",
    "senderEmail": "noreply@example.com",
    "recipients": [
      {
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      {
        "email": "jane@example.com",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    ]
  }'
```

### Example 2: Campaign with CSV Data

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "emailSubject": "Newsletter",
    "emailTemplate": "Hello {{firstName}},\n\nCheck out our latest updates!",
    "senderEmail": "newsletter@example.com",
    "csvData": "email,first_name,last_name\njohn@example.com,John,Doe\njane@example.com,Jane,Smith"
  }'
```

### Example 3: Test Mode

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "emailSubject": "Test Campaign",
    "emailTemplate": "Hello {{firstName}}!",
    "senderEmail": "test@example.com",
    "testMode": true,
    "testEmails": "tester1@example.com,tester2@example.com",
    "recipients": [
      {
        "email": "tester1@example.com",
        "firstName": "Tester1"
      },
      {
        "email": "tester2@example.com",
        "firstName": "Tester2"
      },
      {
        "email": "ignored@example.com",
        "firstName": "Ignored"
      }
    ]
  }'
```

### Example 4: With Callback Webhook

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Monthly Newsletter",
    "emailSubject": "Newsletter - January 2026",
    "emailTemplate": "...",
    "senderEmail": "newsletter@example.com",
    "webhookUrl": "https://your-api.com/campaign-callback",
    "recipients": [...]
  }'
```

Callback будет вызван после завершения кампании:

```json
{
  "campaignId": "workflow-12345",
  "campaignName": "Monthly Newsletter",
  "total": 100,
  "sent": 98,
  "errors": 2,
  "completedAt": "2026-01-22T10:30:00Z"
}
```

### Example 5: Scheduled Campaign

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "emailSubject": "Scheduled Newsletter",
    "emailTemplate": "...",
    "senderEmail": "newsletter@example.com",
    "scheduleTime": "2026-01-23T09:00:00Z",
    "recipients": [...]
  }'
```

## 🔄 Template Variables

### Supported Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{firstName}}` | Имя получателя | John |
| `{{lastName}}` | Фамилия получателя | Doe |
| `{{fullName}}` | Полное имя | John Doe |
| `{{email}}` | Email получателя | john@example.com |
| `{{customField}}` | Пользовательское поле | Any value |

### Custom Fields

Вы можете использовать любые дополнительные поля:

```json
{
  "recipients": [
    {
      "email": "john@example.com",
      "firstName": "John",
      "company": "Acme Corp",
      "position": "Manager"
    }
  ],
  "emailTemplate": "Hello {{firstName}} from {{company}}! As a {{position}}, you might be interested..."
}
```

## 📊 Status Tracking API

### GET /webhook/campaign-status/:campaignId

Получить статус кампании (требует дополнительной настройки).

#### Response

```json
{
  "campaignId": "workflow-12345",
  "status": "completed",
  "stats": {
    "total": 100,
    "sent": 98,
    "errors": 2,
    "pending": 0
  },
  "startedAt": "2026-01-22T10:00:00Z",
  "completedAt": "2026-01-22T10:30:00Z"
}
```

### Implementation

Добавьте новую ноду "Webhook" в workflow:

1. Создайте ноду "Webhook" с методом GET
2. Path: `campaign-status/:campaignId`
3. Добавьте ноду "Code" для запроса к БД:

```javascript
const campaignId = $request.params.campaignId;

// Запрос к БД через ноду PostgreSQL
const query = `
  SELECT 
    campaign_id,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
    MIN(created_at) as started_at,
    MAX(created_at) as completed_at
  FROM email_campaign_log
  WHERE campaign_id = $1
  GROUP BY campaign_id
`;

return [{ json: { campaignId, query } }];
```

## 🔔 Webhook Callbacks

### Campaign Completion Callback

После завершения кампании workflow может отправить callback на указанный URL.

#### Callback Request

```http
POST /your-callback-endpoint
Content-Type: application/json

{
  "event": "campaign.completed",
  "campaignId": "workflow-12345",
  "campaignName": "Monthly Newsletter",
  "timestamp": "2026-01-22T10:30:00Z",
  "stats": {
    "total": 100,
    "sent": 98,
    "errors": 2
  },
  "errors": [
    {
      "email": "invalid@example.com",
      "error": "Invalid email address"
    },
    {
      "email": "bounced@example.com",
      "error": "Mailbox not found"
    }
  ]
}
```

### Email Delivery Callback

Для отслеживания каждого отправленного письма:

```http
POST /your-callback-endpoint
Content-Type: application/json

{
  "event": "email.sent",
  "campaignId": "workflow-12345",
  "email": "john@example.com",
  "status": "sent",
  "timestamp": "2026-01-22T10:15:00Z"
}
```

## 🛠️ Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function sendEmailCampaign(recipients, subject, template) {
  try {
    const response = await axios.post(
      'http://localhost:5678/webhook/email-campaign',
      {
        emailSubject: subject,
        emailTemplate: template,
        senderEmail: 'noreply@example.com',
        recipients: recipients,
        webhookUrl: 'https://your-api.com/callback'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key'
        }
      }
    );
    
    console.log('Campaign started:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Использование
const recipients = [
  { email: 'john@example.com', firstName: 'John' },
  { email: 'jane@example.com', firstName: 'Jane' }
];

sendEmailCampaign(
  recipients,
  'Welcome!',
  '<h1>Hello {{firstName}}!</h1>'
);
```

### Python

```python
import requests
import json

def send_email_campaign(recipients, subject, template):
    url = 'http://localhost:5678/webhook/email-campaign'
    
    payload = {
        'emailSubject': subject,
        'emailTemplate': template,
        'senderEmail': 'noreply@example.com',
        'recipients': recipients,
        'webhookUrl': 'https://your-api.com/callback'
    }
    
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key'
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print('Campaign started:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        raise

# Использование
recipients = [
    {'email': 'john@example.com', 'firstName': 'John'},
    {'email': 'jane@example.com', 'firstName': 'Jane'}
]

send_email_campaign(
    recipients,
    'Welcome!',
    '<h1>Hello {{firstName}}!</h1>'
)
```

### PHP

```php
<?php

function sendEmailCampaign($recipients, $subject, $template) {
    $url = 'http://localhost:5678/webhook/email-campaign';
    
    $data = [
        'emailSubject' => $subject,
        'emailTemplate' => $template,
        'senderEmail' => 'noreply@example.com',
        'recipients' => $recipients,
        'webhookUrl' => 'https://your-api.com/callback'
    ];
    
    $options = [
        'http' => [
            'header'  => [
                'Content-Type: application/json',
                'X-API-Key: your-api-key'
            ],
            'method'  => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        throw new Exception('Error sending campaign');
    }
    
    return json_decode($result, true);
}

// Использование
$recipients = [
    ['email' => 'john@example.com', 'firstName' => 'John'],
    ['email' => 'jane@example.com', 'firstName' => 'Jane']
];

$response = sendEmailCampaign(
    $recipients,
    'Welcome!',
    '<h1>Hello {{firstName}}!</h1>'
);

print_r($response);
?>
```

### cURL

```bash
#!/bin/bash

WEBHOOK_URL="http://localhost:5678/webhook/email-campaign"
API_KEY="your-api-key"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "emailSubject": "Welcome!",
    "emailTemplate": "<h1>Hello {{firstName}}!</h1>",
    "senderEmail": "noreply@example.com",
    "recipients": [
      {
        "email": "john@example.com",
        "firstName": "John"
      },
      {
        "email": "jane@example.com",
        "firstName": "Jane"
      }
    ],
    "webhookUrl": "https://your-api.com/callback"
  }'
```

## 🔒 Security Best Practices

### 1. API Key Authentication

Всегда используйте API ключи для защиты webhook:

```javascript
// В начале workflow добавьте ноду Code
const apiKey = $request.headers['x-api-key'];
const validKeys = ['key1', 'key2', 'key3'];

if (!validKeys.includes(apiKey)) {
  $response.status(401).json({
    success: false,
    error: 'Unauthorized'
  });
  return [];
}
```

### 2. Rate Limiting

Ограничьте количество запросов:

```javascript
// Используйте Redis для rate limiting
const email = $json.senderEmail;
const key = `rate_limit:${email}`;
const limit = 100; // 100 запросов в час

// Проверка лимита через Redis ноду
// Если превышен - вернуть ошибку 429
```

### 3. Input Validation

Валидируйте входные данные:

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

for (const recipient of $json.recipients) {
  if (!emailRegex.test(recipient.email)) {
    throw new Error(`Invalid email: ${recipient.email}`);
  }
}
```

### 4. HTTPS Only

В продакшене используйте только HTTPS:

```nginx
# Nginx config
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📈 Rate Limits

### Рекомендуемые лимиты

| Tier | Requests/Hour | Emails/Day | Concurrent Campaigns |
|------|---------------|------------|---------------------|
| Free | 10 | 500 | 1 |
| Basic | 100 | 5,000 | 5 |
| Pro | 1,000 | 50,000 | 20 |
| Enterprise | Unlimited | Unlimited | Unlimited |

### Implementing Rate Limits

Используйте ноду Redis или базу данных для отслеживания:

```javascript
// Пример с Redis
const userId = $json.userId;
const key = `rate_limit:${userId}:${new Date().getHours()}`;

// Increment counter
// If counter > limit, return 429 error
```

## 🐛 Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `MISSING_PARAMETER` | Отсутствует обязательный параметр | 400 |
| `INVALID_EMAIL` | Неверный формат email | 400 |
| `INVALID_TEMPLATE` | Ошибка в шаблоне | 400 |
| `RATE_LIMIT_EXCEEDED` | Превышен лимит запросов | 429 |
| `UNAUTHORIZED` | Неверный API ключ | 401 |
| `SMTP_ERROR` | Ошибка SMTP сервера | 500 |
| `DATABASE_ERROR` | Ошибка базы данных | 500 |
| `INTERNAL_ERROR` | Внутренняя ошибка | 500 |

## 📚 Additional Resources

- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [n8n API Documentation](https://docs.n8n.io/api/)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)

---

**API Version:** 1.0.0  
**Last Updated:** January 22, 2026
