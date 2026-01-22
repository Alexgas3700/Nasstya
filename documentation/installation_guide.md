# Руководство по установке системы рассылок n8n

## Содержание

1. [Системные требования](#системные-требования)
2. [Установка n8n](#установка-n8n)
3. [Настройка проекта](#настройка-проекта)
4. [Импорт workflow](#импорт-workflow)
5. [Настройка почтовых сервисов](#настройка-почтовых-сервисов)
6. [Проверка установки](#проверка-установки)

---

## Системные требования

### Минимальные требования

- **Операционная система**: Linux, macOS, Windows
- **Node.js**: версия 18.x или выше
- **RAM**: минимум 512 MB, рекомендуется 2 GB
- **Дисковое пространство**: минимум 500 MB
- **Сеть**: доступ к интернету для отправки писем

### Рекомендуемые требования

- **RAM**: 4 GB или больше
- **CPU**: 2 ядра или больше
- **Дисковое пространство**: 2 GB или больше

---

## Установка n8n

### Вариант 1: Установка через npm (рекомендуется для разработки)

#### Шаг 1: Установка Node.js

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node@18
```

**Windows:**
Скачайте установщик с https://nodejs.org

#### Шаг 2: Установка n8n

```bash
# Установка n8n глобально
npm install -g n8n

# Проверка установки
n8n --version
```

#### Шаг 3: Запуск n8n

```bash
# Запуск с настройками по умолчанию
n8n start

# Или с пользовательскими настройками
n8n start --tunnel
```

n8n будет доступен по адресу: `http://localhost:5678`

---

### Вариант 2: Установка через Docker (рекомендуется для продакшена)

#### Шаг 1: Установка Docker

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS:**
Установите Docker Desktop с https://www.docker.com/products/docker-desktop

**Windows:**
Установите Docker Desktop с https://www.docker.com/products/docker-desktop

#### Шаг 2: Запуск n8n через Docker

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Шаг 3: Запуск в фоновом режиме

```bash
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=changeme123 \
  n8nio/n8n
```

---

### Вариант 3: Установка через Docker Compose (рекомендуется)

#### Шаг 1: Клонирование проекта

```bash
git clone <repository-url>
cd workspace
```

#### Шаг 2: Настройка переменных окружения

```bash
cp .env.example .env
nano .env  # или используйте любой текстовый редактор
```

Измените следующие параметры:
```env
N8N_BASIC_AUTH_USER=your-username
N8N_BASIC_AUTH_PASSWORD=your-secure-password
DEFAULT_SENDER_EMAIL=your-email@example.com
```

#### Шаг 3: Создание необходимых директорий

```bash
mkdir -p data/logs data/mailing_lists
```

#### Шаг 4: Запуск через Docker Compose

```bash
docker-compose up -d
```

#### Шаг 5: Проверка статуса

```bash
docker-compose ps
docker-compose logs -f n8n
```

#### Управление контейнером

```bash
# Остановка
docker-compose stop

# Запуск
docker-compose start

# Перезапуск
docker-compose restart

# Остановка и удаление
docker-compose down

# Просмотр логов
docker-compose logs -f
```

---

## Настройка проекта

### Шаг 1: Структура директорий

Убедитесь, что у вас есть следующая структура:

```
/workspace/
├── workflows/
├── templates/
├── documentation/
├── configs/
├── data/
│   ├── logs/
│   └── mailing_lists/
├── docker-compose.yml
├── .env
└── README.md
```

### Шаг 2: Создание директорий для данных

```bash
mkdir -p data/logs
mkdir -p data/mailing_lists
touch data/mailing_lists/.gitkeep
```

### Шаг 3: Копирование примера списка рассылки

```bash
cp configs/mailing_list_example.csv data/mailing_lists/my_list.csv
```

Отредактируйте файл `data/mailing_lists/my_list.csv` и добавьте реальные email-адреса.

---

## Импорт workflow

### Через веб-интерфейс

1. Откройте n8n в браузере: `http://localhost:5678`
2. Создайте учетную запись (при первом запуске)
3. Перейдите в раздел "Workflows"
4. Нажмите "Add workflow" → "Import from File"
5. Выберите файл `workflows/email_campaign.json`
6. Нажмите "Import"

### Через командную строку (Docker)

```bash
docker cp workflows/email_campaign.json n8n:/home/node/.n8n/workflows/
docker restart n8n
```

---

## Настройка почтовых сервисов

### Gmail (SMTP)

#### Шаг 1: Включение двухфакторной аутентификации

1. Перейдите в настройки аккаунта Google
2. Безопасность → Двухэтапная аутентификация
3. Включите двухэтапную аутентификацию

#### Шаг 2: Создание пароля приложения

1. Перейдите в https://myaccount.google.com/apppasswords
2. Выберите "Почта" и "Другое устройство"
3. Введите имя (например, "n8n")
4. Скопируйте сгенерированный пароль

#### Шаг 3: Настройка в n8n

1. Откройте n8n → Settings → Credentials
2. Нажмите "Add Credential"
3. Выберите "SMTP"
4. Заполните данные:
   - **Name**: Gmail SMTP
   - **Host**: smtp.gmail.com
   - **Port**: 587
   - **User**: your-email@gmail.com
   - **Password**: [пароль приложения]
   - **Secure**: false (для TLS)
5. Нажмите "Save"

### SendGrid

#### Шаг 1: Регистрация

1. Зарегистрируйтесь на https://sendgrid.com
2. Подтвердите email
3. Пройдите верификацию аккаунта

#### Шаг 2: Создание API ключа

1. Перейдите в Settings → API Keys
2. Нажмите "Create API Key"
3. Выберите "Full Access"
4. Скопируйте API ключ

#### Шаг 3: Настройка в n8n

1. Откройте n8n → Settings → Credentials
2. Нажмите "Add Credential"
3. Выберите "SendGrid API"
4. Заполните данные:
   - **Name**: SendGrid
   - **API Key**: [ваш API ключ]
5. Нажмите "Save"

### Mailgun

#### Шаг 1: Регистрация

1. Зарегистрируйтесь на https://mailgun.com
2. Подтвердите email
3. Добавьте домен или используйте sandbox-домен

#### Шаг 2: Получение API ключа

1. Перейдите в Settings → API Keys
2. Скопируйте Private API key

#### Шаг 3: Настройка в n8n

1. Откройте n8n → Settings → Credentials
2. Нажмите "Add Credential"
3. Выберите "Mailgun API"
4. Заполните данные:
   - **Name**: Mailgun
   - **API Key**: [ваш API ключ]
   - **Domain**: [ваш домен]
5. Нажмите "Save"

---

## Проверка установки

### Тест 1: Доступность n8n

```bash
curl http://localhost:5678/healthz
```

Ожидаемый результат: `{"status":"ok"}`

### Тест 2: Проверка workflow

1. Откройте импортированный workflow
2. Нажмите "Execute Workflow"
3. Выберите "Manual Trigger"
4. Проверьте выполнение каждого узла

### Тест 3: Тестовая отправка письма

1. Создайте тестовый CSV-файл с одним адресом:

```csv
email,firstName,lastName
your-test-email@example.com,Test,User
```

2. Настройте workflow на этот файл
3. Запустите workflow
4. Проверьте получение письма

### Тест 4: Проверка логов

```bash
# Для Docker Compose
docker-compose logs n8n

# Для Docker
docker logs n8n

# Для npm
cat ~/.n8n/logs/n8n.log
```

---

## Устранение проблем при установке

### Проблема: n8n не запускается

**Решение:**

```bash
# Проверка портов
sudo netstat -tulpn | grep 5678

# Если порт занят, используйте другой
n8n start --port 5679
```

### Проблема: Ошибка прав доступа (Docker)

**Решение:**

```bash
# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Перезапуск сессии
newgrp docker
```

### Проблема: Не импортируется workflow

**Решение:**

1. Проверьте формат JSON-файла
2. Убедитесь, что используете актуальную версию n8n
3. Попробуйте создать workflow вручную

### Проблема: Не работает SMTP

**Решение:**

1. Проверьте credentials
2. Убедитесь, что используете правильный порт
3. Проверьте настройки firewall
4. Для Gmail используйте пароль приложения, не обычный пароль

---

## Следующие шаги

После успешной установки:

1. Прочитайте [Руководство пользователя](user_guide.md)
2. Настройте свои шаблоны в папке `templates/`
3. Создайте списки рассылки в `data/mailing_lists/`
4. Настройте расписание в workflow
5. Запустите первую тестовую кампанию

---

## Обновление n8n

### npm

```bash
npm update -g n8n
```

### Docker

```bash
docker pull n8nio/n8n:latest
docker-compose down
docker-compose up -d
```

---

## Резервное копирование

### Важные данные для бэкапа:

```bash
# Данные n8n
~/.n8n/

# Workflows
workflows/

# Templates
templates/

# Конфигурация
configs/

# Списки рассылки
data/mailing_lists/
```

### Скрипт для бэкапа:

```bash
#!/bin/bash
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r ~/.n8n $BACKUP_DIR/
cp -r workflows $BACKUP_DIR/
cp -r templates $BACKUP_DIR/
cp -r configs $BACKUP_DIR/
cp -r data $BACKUP_DIR/
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR
echo "Backup created: $BACKUP_DIR.tar.gz"
```

---

**Установка завершена! 🎉**

Теперь вы готовы использовать систему рассылок на базе n8n.
