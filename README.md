# Хлеб - Discord Bot
Рабочая версия проекта, больше не в разработке, активная разработка [по ссылке.](https://github.com/AvroraPolnareff/bread)
Планируется управление с веб-приложения, работа с несколькими аукционами, поиск пользователя по сторонним сервисам на основе никнейма\информации профиля.
## Для чего этот бот?
Отслеживание цен аукционов на сайте [warframe.market](https://warframe.market/) с быстрым уведомлением в дискорд чат. Еще можно отследить онлайн пользователя на сайте и получить мгновенное уведомление как только он появится онлайн. Если не проспите, то любое выгодное предложение будет вашим! ::
 ## Как использовать бота?
К сожалению бот сейчас приватный, и тестируется, но если вы подкованый разработчик, то запустить его не будет проблемой!
1. Убедитесь, что у вас установлена версия ноды не младше 13-й
```(bash)
user@os-name:~$ node --version
v13.14.0
```
2. Установите Postgress и создайте новую базу данных или запустите контейнер в докере (к сожалению пока не прилагается).
3. Переименуйте .example_env в .env, подставьте свои параметры
4. `npm install && npm run start`
