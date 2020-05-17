# ДЗ 5 (Express.js + Mongoose + socket.io + Docker)
Дата прохождения курса 10.03.2020 - 17.04.2020

Итоговый проект находится на heroku [https://microlabig.herokuapp.com](https://microlabig.herokuapp.com "https://microlabig.herokuapp.com")

**Студент:** Безместин Игорь

**Наставник:** Артем Пузаков

## Необходимые действия для запуска проекта

1. установить node.js - [nodejs.org](https://nodejs.org/ "Node.JS")
2. установить mongodb - [MongoDBCompassCommunity](https://www.mongodb.com/download-center/compass "MongoDB Compass")
3. cклонировать проект к себе и перейти в каталог проекта
4. `npm i` или `yarn install` - установить зависимости
5. создать в корне проекта файл `.env`, настроить следующим образом:  
   
   ```dotnetcli
    PORT=3000               # порт приложения
    mode=production         # режим работы приложения ("development" работает с локальной БД)
    secretKey=secret        # секретный ключ для сессий

    JWT_SECRET='jwt_secret' # секретный ключ для работы с JWT-токенами

    DB_HOST='127.0.0.1'     # сервер локальной БД
    DB_PORT='27017'         # порт локальной БД

    REMOTE_DB_NAME='nameDB' # имя удаленной БД
    REMOTE_DB_USER='user'   # логин доступа к удаленной БД
    REMOTE_DB_PASS='pass'   # пароль к удаленной БД
   ```

6. запуск проекта командой `node app`

---
## ТЗ:

1. Выберите фреймворк - Express.js или Koa.js.
2. Выберите базу данных - MongoDB (рекомедуемая ORM - Mongoose) или PostgreSQL (рекомедуемая ORM - Sequelize).
3. Подготовьте http-сервер, который на любой get-запрос вернет index.html (маршрутизация выполняется на frontend'e средствами бибилиотеки react-router).
4. Реализуйте логику обработки 12 различных запросов:
   - POST-запрос на /api/registration - создание нового пользователя (регистрация). Сигнатура запроса: { username, surName, firstName, middleName, password }. Необходимо вернуть объект авторизовавшегося пользователя.
   - POST-запрос на /api/login - авторизация после пользователького ввода. Cигнатура запроса: { username, password } Необходимо вернуть объект авторизовавшегося пользователя.
   - POST-запрос на /api/refresh-token - обновление access-токена. В headers['authorization'] прикрепить refresh-токен. Вернуть обьект с токенами
   - GET-запрос на /api/profile - авторизация при наличии токена. Необходимо вернуть объект пользователя.
   - PATCH-запрос на /api/profile - обновление информации о пользователе. Сигнатура запроса:
        ```javascript
        {
            firstName: String,
            middleName: String,
            surName: String,
            oldPassword: String,
            newPassword: String,
            avatar: File
        }
        ```
        Необходимо вернуть объект обновленного пользователя.
    - DELETE-запрос на /api/users/:id - удаление пользователя.
    - GET-запрос на /api/news - получение списка новостей. Необходимо вернуть список всех новостей из базы данных.
    - POST-запрос на /api/news - создание новой новости. Сигнатура запроса: { text, title }. Необходимо вернуть обновленный список всех новостей из базы данных.
    - PATCH-запрос на /api/news/:id - обновление существующей новости. Сигнатура запроса: { text, title }. Необходимо вернуть обновленный список всех новостей из базы данных.
    - DELETE-запрос на /api/news/:id - удаление существующей новости. Необходимо вернуть обновленный список всех новостей из базы данных.
    - Автоматический GET-запрос на /api/users - получение списка пользователей. Необходимо вернуть список всех пользоватлей из базы данных.
    - PATCH-запрос на /api/users/:id/permission - обновление существующей записи о разрешениях конкретного пользователя. 
    Сигнатура:
        ```javascript
        {
            permission: {
                chat: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
                news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
                settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean }
            }
        }
        ```
        Обьект пользователя:
        ```javascript
        {
            firstName: String,
            id: Primary key,
            image: String,
            middleName: String,
            permission: {
                chat: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
                news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
                settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean }
            },
            surName: String,
            username: String
        }
        ```
        Обьект авторизованного пользователя:
        ```javascript
        {
            firstName: String,
            id: Primary key,
            image: String,
            middleName: String,
            permission: {
                chat: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
                news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
                settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean }
            },
            surName: String,
            username: String,
            accessToken: String,
                refreshToken: String,
                accessTokenExpiredAt: Date (ms),
                refreshTokenExpiredAt: Date (ms)
        }
        ```
        Обьект новости:
        ```javascript
        {
            id: Primary key,
            created_at: Date,
            text: String,
            title: String,
            user: {
                firstName: String,
                id: Key,
                image: String,
                middleName: String,
                surName: String,
                username: String
            }
        }
        ```
        Обьект с токенами:
        ```javascript
        {
            accessToken: String,
            refreshToken: String,
            accessTokenExpiredAt: Date (ms),
            refreshTokenExpiredAt: Date (ms)
        }
        ```
        Более подробную информацию о url, дополнительных параметрах и передаваемых данных запроса вы можете получить через средства разработчика при взаимодействии с интерфейсом.

5. Реализуйте логику взаимодействия frontend и backend частей между собой с помощью socket. Необходимо для реализации чата. У вас далжен быть хеш-объект, в который вы запишите все активные подключения в формате:
    ```javascript
    { 
        #socketId: 
        {
            username: #username,
            socketId: #socketId,
            userId: #userId,
            activeRoom: null // По умолчанию
        },
    // ...
    }
    ```
    Ваше socket-подключение должно обрабатывать следующие события:

    - `users:connect`, инициируется при подключении пользователя. Необходимо создать объект пользователя и сохранить в нем socketId сокета, userId пользователя и имя пользователя, как свойства, обновить общий объект, и отправить его, в виде массива, только что подключившемуся пользователю (с помощью события users:list) и разослать всем подключенным сокетам объект нового пользователя (с помощью события users:add).

    - `message:add`, инициируется при отправке одним из пользователей сообщения другому. Нужно передать пользователю-получателю в параметрах текст сообщения (text) и senderId отправителя и recipientId получателя с помощью события message:add.

    - `message:history`, инициируется при открытии пользователем чата. Нужно вернуть пользователю список сообщений диалога с выбранным пользователем. Параметры: recipientId - id пользователя-получателя (чат с которым мы открыли), userId - id пользователя (свой). Список сообщений диалога отправить с помощью события message:history.

    - `disconnect`, инициируется при отключении пользователя. Нужно передать всем подключенным пользователям socketId отключившегося пользователя (с помощью события users:leave), и удалить пользователя из объекта всех подключенных пользователей.
  
6. Подготовьте окружение и запустите проект на выбранном вами хостинге (например, heroku).
   
**Дополнительное задание 1**: обеспечьте при необходимости сжатие картинок, загружаемых пользователями, и их обрезку до квадратных пропорций (для этого можно использовать jimp).

**Дополнительное задание 2**: обеспечьте возможность работы приложения в 2 режимах - development и producton. В development режиме приложение должно быть подключено к локальной базе данных, в то время как в producton режиме - к удаленной, которая и будет использоваться при работе на хостинге.
