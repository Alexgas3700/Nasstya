# API Reference - n8n Email Campaign System

## Содержание

1. [Webhook API](#webhook-api)
2. [Параметры запроса](#параметры-запроса)
3. [Примеры запросов](#примеры-запросов)
4. [Коды ответов](#коды-ответов)
5. [Интеграция с внешними системами](#интеграция-с-внешними-системами)

---

## Webhook API

Система поддерживает запуск кампаний через HTTP Webhook.

### Базовый URL

```
http://your-n8n-instance:5678/webhook/email-campaign
```

### Метод

```
POST
```

### Headers

```http
Content-Type: application/json
Authorization: Bearer YOUR_WEBHOOK_TOKEN (опционально)
```

---

## Параметры запроса

### Основные параметры

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `campaign_name` | string | Да | Название кампании |
| `template_name` | string | Да | Имя шаблона (без расширения) |
| `sender_email` | string | Да | Email отправителя |
| `sender_name` | string | Нет | Имя отправителя |
| `subject` | string | Нет | Тема письма |
| `recipients` | array | Да* | Массив получателей |
| `mailing_list_url` | string | Да* | URL CSV-файла со списком |

*Обязателен либо `recipients`, либо `mailing_list_url`

### Структура получателя

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "customField1": "Value 1",
  "customField2": "Value 2"
}
```

### Дополнительные параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `schedule_time` | string | ISO 8601 дата/время для отложенной отправки |
| `batch_size` | number | Размер батча (по умолчанию: 10) |
| `delay_between_batches` | number | Задержка между батчами в мс |
| `test_mode` | boolean | Тестовый режим (не отправляет реальные письма) |
| `track_opens` | boolean | Отслеживание открытий |
| `track_clicks` | boolean | Отслеживание кликов |

---

## Примеры запросов

### Пример 1: Базовая рассылка

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_name": "Welcome Campaign",
    "template_name": "template_welcome",
    "sender_email": "welcome@example.com",
    "sender_name": "Welcome Team",
    "subject": "Welcome to our service!",
    "recipients": [
      {
        "email": "user1@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      {
        "email": "user2@example.com",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    ]
  }'
```

### Пример 2: Рассылка из CSV

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_name": "Monthly Newsletter",
    "template_name": "template_newsletter",
    "sender_email": "newsletter@example.com",
    "sender_name": "Newsletter Team",
    "mailing_list_url": "https://example.com/lists/subscribers.csv"
  }'
```

### Пример 3: Отложенная отправка

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_name": "Scheduled Campaign",
    "template_name": "template_example",
    "sender_email": "marketing@example.com",
    "schedule_time": "2026-01-22T09:00:00Z",
    "recipients": [
      {
        "email": "user@example.com",
        "firstName": "User",
        "lastName": "Name"
      }
    ]
  }'
```

### Пример 4: Тестовый режим

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_name": "Test Campaign",
    "template_name": "template_example",
    "sender_email": "test@example.com",
    "test_mode": true,
    "recipients": [
      {
        "email": "test@example.com",
        "firstName": "Test",
        "lastName": "User"
      }
    ]
  }'
```

### Пример 5: С кастомными настройками

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_name": "Custom Campaign",
    "template_name": "template_example",
    "sender_email": "custom@example.com",
    "sender_name": "Custom Sender",
    "batch_size": 50,
    "delay_between_batches": 500,
    "track_opens": true,
    "track_clicks": true,
    "recipients": [
      {
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "customField1": "Premium",
        "customField2": "Active"
      }
    ]
  }'
```

---

## Коды ответов

### Успешные ответы

#### 200 OK - Кампания запущена

```json
{
  "status": "success",
  "message": "Campaign started successfully",
  "campaign_id": "abc123",
  "campaign_name": "Welcome Campaign",
  "recipients_count": 150,
  "estimated_duration": "15 minutes"
}
```

#### 202 Accepted - Кампания запланирована

```json
{
  "status": "scheduled",
  "message": "Campaign scheduled successfully",
  "campaign_id": "abc123",
  "scheduled_time": "2026-01-22T09:00:00Z"
}
```

### Ошибки

#### 400 Bad Request - Неверные параметры

```json
{
  "status": "error",
  "message": "Invalid parameters",
  "errors": [
    {
      "field": "sender_email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 401 Unauthorized - Неверная авторизация

```json
{
  "status": "error",
  "message": "Unauthorized access"
}
```

#### 404 Not Found - Шаблон не найден

```json
{
  "status": "error",
  "message": "Template not found",
  "template_name": "template_nonexistent"
}
```

#### 429 Too Many Requests - Превышен лимит

```json
{
  "status": "error",
  "message": "Rate limit exceeded",
  "retry_after": 60
}
```

#### 500 Internal Server Error - Внутренняя ошибка

```json
{
  "status": "error",
  "message": "Internal server error",
  "error_id": "err_xyz789"
}
```

---

## Интеграция с внешними системами

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function sendEmailCampaign(campaignData) {
  try {
    const response = await axios.post(
      'http://localhost:5678/webhook/email-campaign',
      campaignData,
      {
        headers: {
          'Content-Type': 'application/json'
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
sendEmailCampaign({
  campaign_name: 'Welcome Campaign',
  template_name: 'template_welcome',
  sender_email: 'welcome@example.com',
  recipients: [
    {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    }
  ]
});
```

### Python

```python
import requests
import json

def send_email_campaign(campaign_data):
    url = 'http://localhost:5678/webhook/email-campaign'
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=campaign_data, headers=headers)
        response.raise_for_status()
        print('Campaign started:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        raise

# Использование
campaign_data = {
    'campaign_name': 'Welcome Campaign',
    'template_name': 'template_welcome',
    'sender_email': 'welcome@example.com',
    'recipients': [
        {
            'email': 'user@example.com',
            'firstName': 'John',
            'lastName': 'Doe'
        }
    ]
}

send_email_campaign(campaign_data)
```

### PHP

```php
<?php

function sendEmailCampaign($campaignData) {
    $url = 'http://localhost:5678/webhook/email-campaign';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($campaignData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        echo "Campaign started: " . $response . "\n";
        return json_decode($response, true);
    } else {
        throw new Exception("Error: " . $response);
    }
}

// Использование
$campaignData = [
    'campaign_name' => 'Welcome Campaign',
    'template_name' => 'template_welcome',
    'sender_email' => 'welcome@example.com',
    'recipients' => [
        [
            'email' => 'user@example.com',
            'firstName' => 'John',
            'lastName' => 'Doe'
        ]
    ]
];

sendEmailCampaign($campaignData);
?>
```

### Ruby

```ruby
require 'net/http'
require 'json'

def send_email_campaign(campaign_data)
  uri = URI('http://localhost:5678/webhook/email-campaign')
  
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
  request.body = campaign_data.to_json
  
  response = http.request(request)
  
  if response.code == '200'
    puts "Campaign started: #{response.body}"
    JSON.parse(response.body)
  else
    raise "Error: #{response.body}"
  end
end

# Использование
campaign_data = {
  campaign_name: 'Welcome Campaign',
  template_name: 'template_welcome',
  sender_email: 'welcome@example.com',
  recipients: [
    {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    }
  ]
}

send_email_campaign(campaign_data)
```

---

## Webhooks для уведомлений

Система может отправлять уведомления о статусе кампании на ваш webhook.

### Настройка

В конфигурации workflow добавьте URL для уведомлений:

```json
{
  "notification_webhook": "https://your-app.com/webhook/campaign-status"
}
```

### События

#### Campaign Started

```json
{
  "event": "campaign.started",
  "campaign_id": "abc123",
  "campaign_name": "Welcome Campaign",
  "timestamp": "2026-01-21T10:00:00Z",
  "recipients_count": 150
}
```

#### Campaign Completed

```json
{
  "event": "campaign.completed",
  "campaign_id": "abc123",
  "campaign_name": "Welcome Campaign",
  "timestamp": "2026-01-21T10:15:00Z",
  "statistics": {
    "total": 150,
    "sent": 148,
    "failed": 2,
    "duration_seconds": 900
  }
}
```

#### Campaign Failed

```json
{
  "event": "campaign.failed",
  "campaign_id": "abc123",
  "campaign_name": "Welcome Campaign",
  "timestamp": "2026-01-21T10:05:00Z",
  "error": "SMTP connection failed"
}
```

---

## Rate Limits

### Лимиты по умолчанию

- **Requests per minute**: 60
- **Campaigns per hour**: 10
- **Recipients per campaign**: 10,000

### Заголовки ответа

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642766400
```

---

## Безопасность

### Аутентификация

#### Bearer Token

```bash
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}'
```

#### API Key

```bash
curl -X POST http://localhost:5678/webhook/email-campaign?api_key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Whitelist IP

Настройте whitelist IP-адресов в конфигурации n8n:

```json
{
  "security": {
    "allowedIPs": [
      "192.168.1.100",
      "10.0.0.0/8"
    ]
  }
}
```

---

## Мониторинг

### Health Check

```bash
curl http://localhost:5678/healthz
```

Ответ:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Metrics

```bash
curl http://localhost:5678/metrics
```

Ответ:
```json
{
  "campaigns": {
    "total": 150,
    "active": 2,
    "completed": 148
  },
  "emails": {
    "sent_today": 5420,
    "failed_today": 12
  },
  "system": {
    "cpu_usage": 15.5,
    "memory_usage": 256
  }
}
```

---

**Версия API**: 1.0  
**Последнее обновление**: 21 января 2026
