# KeepCalm

### Що це?

KeepCalm — це невелика веб-гра у жанрі психологічної візуальної новели і власний енжин, розроблений на Django/Python.

### Інсталяція

1. Встановіть Python

   Для Unix-подібних систем пропишіть

       apt install python

   (або в залежності від системи — замість apt — інший менеджер пакетів)

   Для Windows/MacOS — завантажте останню версію з [офіційного дистрибутиву Python](https://www.python.org/downloads/) та встановіть її. Під час встановлення, оберіть пункт `Add Python to PATH`.

2. Клонуйте репозиторій на локальну машину

   У консолі, перейдіть у папку, де ви хочете розгорнути проєкт. На більшості систем, це відбувається за допомогою команди

       cd <your_folder>

   Пропишіть

       git clone https://github.com/Casy7/KeepCalm.git

   Зачекайте, допоки проєкт завантажиться на вашу машину.

   Та перейдіть у папку проєкту.

   Задля цього, напишіть

       cd KeepCalm


3. Встановіть необхідні бібліотеки для роботи сайту з `requirements.txt`.

   Щоб зробити це в автоматичному режимі, пропишіть команду. За бажанням налаштуйте під проєкт окремий environment.

       pip install -r requirements.txt

4. Запустіть проєкт
   
   Пропишіть у консолі

       python manage.py runserver 8000

