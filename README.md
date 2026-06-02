<!-- Improved compatibility of back to top link -->

<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Stargazers][stars-shield]][stars-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![Contributors][contributors-shield]][contributors-url]
[![License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/nikidanil/craftform-app">
    <img src="public/logo-mark.svg" alt="FormCraft logo" width="80" height="80">
  </a>

  <h3 align="center">FormCraft</h3>

  <p align="center">
    Конструктор форм для опросов, обратной связи, заявок и регистраций.
    <br />
    Собери форму из вопросов, опубликуй ссылку, собирай и анализируй отклики.
    <br />
    <br />
    <a href="docs/product.md"><strong>Продуктовое описание »</strong></a>
    <br />
    <br />
    <a href="docs/design/index.html">Дизайн-макеты</a>
    &middot;
    <a href="docs/roadmap.md">Дорожная карта</a>
    &middot;
    <a href="https://github.com/nikidanil/craftform-app/issues">Сообщить о проблеме</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>📑 Оглавление</summary>
  <ol>
    <li>
      <a href="#about">О проекте</a>
      <ul>
        <li><a href="#problem">Какую задачу решает</a></li>
        <li><a href="#features">Возможности</a></li>
        <li><a href="#built-with">Технологии</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Начало работы</a>
      <ul>
        <li><a href="#prerequisites">Требования</a></li>
        <li><a href="#installation">Установка и запуск</a></li>
      </ul>
    </li>
    <li><a href="#usage">Использование</a></li>
    <li>
      <a href="#structure">Структура и архитектура</a>
      <ul>
        <li><a href="#fsd">Слои FSD-light</a></li>
        <li><a href="#dataflow">Как устроены данные</a></li>
      </ul>
    </li>
    <li><a href="#testing">Тестирование</a></li>
    <li><a href="#details">Важные детали реализации</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

<a id="about"></a>

## 📋 О проекте

**FormCraft** — это веб-приложение (SPA) для создания форм: опросов, форм обратной
связи, заявок и регистраций на мероприятия. Автор собирает форму из вопросов разных
типов, публикует её и распространяет публичную ссылку. Любой, у кого есть ссылка,
проходит форму без регистрации, а автор видит отклики и базовую аналитику в личном
кабинете.

Цель проекта — продемонстрировать на одном законченном продукте зрелый набор
практик современной фронтенд-разработки:

- слоистую архитектуру **FSD-light** с однонаправленными зависимостями;
- строгую типизацию и **валидацию данных на границе приложения** (Zod);
- разделение **серверного** (React Query) и **клиентского** (Zustand) состояния;
- разработку **по TDD** — сначала сценарный тест, потом реализация;
- доступность (a11y) и работу с формами через `react-hook-form`.

> 🤖 **Об использовании ИИ.** В работе над проектом применялся **Claude Code** —
> он помогал с проработкой дизайна, составлением дорожной карты и сопровождал
> процесс разработки (ревью, подсказки, документация).

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<a id="problem"></a>

### 🎯 Какую задачу решает

Людям регулярно нужно собирать структурированные данные от многих респондентов
(опрос, отзыв, заявка, регистрация), и для этого нужен инструмент, который закрывает
**весь цикл**:

| Роль                              | Что должна уметь система                                                                                                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Автор формы** (зарегистрирован) | зарегистрироваться/войти, редактировать профиль, собрать форму из вопросов, опубликовать и получить публичную ссылку, видеть список своих форм, читать отклики (списком и по одному) с фильтрами и сортировкой, редактировать и удалять формы |
| **Респондент** (аноним)           | открыть форму по ссылке без регистрации, заполнить, отправить ответы; один проход = один отклик                                                                                                                                               |

Все страницы автора **защищены сессией** — без входа пользователя перенаправляет на
страницу логина. Публичная страница заполнения, наоборот, доступна без авторизации.

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<a id="features"></a>

### ✨ Возможности

- 🔐 **Регистрация, вход и выход**, сессия переживает перезагрузку (localStorage).
- 👤 **Редактирование профиля** с проверкой уникальности email.
- 🧱 **Конструктор форм** с тремя типами вопросов: короткий текст, длинный текст и
  выбор (одиночный/множественный) с вариантами ответа.
- 🖱️ **Drag-and-drop**: добавление вопросов перетаскиванием из палитры, сортировка и
  удаление карточек; поддержка клавиатуры (доступность).
- 🔗 **Публикация и копирование** публичной ссылки на форму.
- 📝 **Публичное заполнение** формы анонимом с валидацией обязательных полей.
- 📥 **Список откликов** с фильтром по диапазону дат и сортировкой.
- 🔎 **Просмотр отдельного отклика** с сопоставлением «вопрос → ответ».
- 🗑️ **Каскадное удаление** формы вместе со всеми её откликами.
- 🔢 **Счётчики откликов** и поиск/сортировка в списке форм.

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<a id="built-with"></a>

### 🛠️ Технологии

- [![React][React-badge]][React-url]
- [![TypeScript][TS-badge]][TS-url]
- [![Vite][Vite-badge]][Vite-url]
- [![React Router][Router-badge]][Router-url]
- [![React Query][Query-badge]][Query-url]
- [![Zustand][Zustand-badge]][Zustand-url]
- [![React Hook Form][RHF-badge]][RHF-url]
- [![Zod][Zod-badge]][Zod-url]
- [![dnd kit][Dnd-badge]][Dnd-url]
- [![Tailwind CSS][Tailwind-badge]][Tailwind-url]
- [![Vitest][Vitest-badge]][Vitest-url]
- [![ESLint][ESLint-badge]][ESLint-url]

> Также: **shadcn/ui** (UI-примитивы), **CSS Modules** (стили), **json-server** (mock-API),
> **Playwright** (сквозные smoke-проверки), включён **React Compiler**.

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<!-- GETTING STARTED -->

<a id="getting-started"></a>

## 🚀 Начало работы

Чтобы поднять проект локально, выполни простые шаги ниже.

<a id="prerequisites"></a>

### 📦 Требования

- **Node.js** ≥ 20 (разрабатывалось на 22.x)
- **npm** ≥ 10

    ```sh
    node -v   # проверить версию Node
    npm -v    # проверить версию npm
    ```

<a id="installation"></a>

### ⚙️ Установка и запуск

1. Склонировать репозиторий
    ```sh
    git clone https://github.com/nikidanil/craftform-app.git
    cd craftform-app
    ```
2. Установить зависимости
    ```sh
    npm install
    ```
3. Запустить приложение в dev-режиме — поднимутся **сразу два процесса**: Vite-сервер
   и mock-API (`json-server`)
    ```sh
    npm run dev
    ```
4. Открыть приложение в браузере
    ```
    http://localhost:5173
    ```

> 🔧 Как это работает: Vite на dev проксирует все запросы `/api/*` на `json-server`
> (`http://127.0.0.1:3001`), который отдаёт данные из `mocks/db.json`. Отдельно
> бэкенд поднимать не нужно.

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<!-- USAGE -->

<a id="usage"></a>

## 💡 Использование

Доступные npm-скрипты:

| Команда             | Что делает                                              |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Vite + mock-API параллельно (основной режим разработки) |
| `npm run dev:vite`  | только Vite (без mock-API)                              |
| `npm run mock`      | только mock-API (`json-server` на порту 3001)           |
| `npm run build`     | проверка типов + production-сборка                      |
| `npm run preview`   | предпросмотр production-сборки                          |
| `npm run lint`      | запуск ESLint                                           |
| `npm run test`      | тесты в watch-режиме (Vitest)                           |
| `npm run test:run`  | прогон всех тестов один раз                             |
| `npm run typecheck` | проверка типов без сборки                               |

**Быстрый сценарий проверки работоспособности:**

1. `npm run dev` → открыть `http://localhost:5173`.
2. Зарегистрироваться (или войти под тестовым пользователем из `mocks/db.json`).
3. Нажать **«Новая форма»**, перетащить пару вопросов, заполнить, **сохранить**.
4. Скопировать публичную ссылку, открыть её в режиме инкогнито, **отправить отклик**.
5. Вернуться в кабинет → открыть **отклики** формы, проверить фильтр по дате.

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<!-- STRUCTURE -->

<a id="structure"></a>

## 🗂️ Структура и архитектура

```text
craftform-app/
├── public/              # статика (favicon, спрайт иконок)
├── mocks/
│   └── db.json          # данные mock-API (forms, responses, users)
├── docs/                # продуктовая и техническая документация
│   ├── product.md       # описание продукта
│   ├── roadmap.md       # этапы и подзадачи
│   ├── design/          # HTML-прототипы экранов
│   └── assets/          # скриншоты
├── src/
│   ├── app/             # провайдеры, роутер, guard'ы, корневой App, layout'ы
│   ├── pages/           # по одной странице на маршрут (только композиция)
│   ├── widgets/         # крупные блоки UI (конструктор, списки, шапка)
│   ├── features/        # действия пользователя (login, save-form, delete-form…)
│   ├── entities/        # бизнес-сущности (Form, Submission, User, Session)
│   └── shared/          # ui/ (shadcn), lib/ (утилиты, хуки), api/ (http-клиент)
├── vite.config.ts       # сборка, alias '@', dev-прокси /api, настройки Vitest
└── package.json
```

<a id="fsd"></a>

### 🧩 Слои FSD-light

Архитектура построена по упрощённому **Feature-Sliced Design**. Главное правило:
**слой может импортировать только из слоёв ниже себя.**

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
```

- **app** — точка входа, провайдеры (`QueryClientProvider`), роутер и guard'ы
  (`ProtectedRoute`, `UnauthorizedOnlyRoute`), оболочка `AppShell`.
- **pages** — собирают виджеты и подключают данные через хуки; своей бизнес-логики
  не несут.
- **widgets** — самодостаточные блоки (конструктор формы, список форм/откликов,
  просмотр отклика, шапка).
- **features** — одно осмысленное действие (вход, сохранение формы, удаление,
  отправка отклика, копирование ссылки, редактирование профиля).
- **entities** — типы, Zod-схемы и хуки чтения/записи для `Form`, `Submission`,
  `User`, `Session`.
- **shared** — переиспользуемое: UI-примитивы, утилиты и хуки, базовый http-клиент.

Импорты идут через barrel-файлы (`@/shared/ui`, `@/entities/form`), `@` — алиас на `src/`.

<a id="dataflow"></a>

### 🔄 Как устроены данные

- **Сеть.** Единственная точка похода в API — обёртка `http()` в `shared/api`. Она
  ставит JSON-заголовки, сериализует тело и при ошибке бросает типизированный
  `HttpError` (со `status` и `body`).
- **Граница доверия.** Любой ответ сервера парсится **Zod-схемой** прежде, чем попасть
  в приложение, — некорректные данные в UI не проходят, а типы выводятся из тех же
  схем (`z.infer`).
- **Серверное состояние** — **React Query**: кэш по иерархическим ключам, точечная
  инвалидация после мутаций, политика ретраев (4xx не повторяем).
- **Клиентское состояние** — **Zustand** хранит сессию (текущий пользователь) с
  персистом в `localStorage`.
- **Формы** — `react-hook-form` + `zodResolver`; схемы лежат рядом с формой в
  `model/schema.ts`. В конструкторе схема валидации статична, на странице заполнения
  она **строится из самой формы** в рантайме.

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<!-- TESTING -->

<a id="testing"></a>

## 🧪 Тестирование

Проект разрабатывался по **строгому TDD**: сначала пишется падающий тест на сценарий
из фича-документации, затем минимальная реализация до зелёного.

- **Юнит/интеграционные тесты** — Vitest + React Testing Library. Тесты лежат рядом с
  кодом в папках `__tests__/`. Пишутся **только пользовательские сценарии**
  (действие → результат); smoke-тесты в Vitest не используются. API мокается точечно
  (`vi.mock` на http-клиенте).

Запуск:

```sh
npm run test:run     # прогнать все тесты один раз
npm run test         # watch-режим
npm run typecheck    # проверка типов
npm run lint         # статический анализ
```

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<!-- DETAILS -->

<a id="details"></a>

## 🔍 Важные детали реализации

Эти решения помогут быстрее понять и оценить код:

- **Разделение типов сущностей**: `Form`/`FormInput` и `User`/`UserRecord` —
  серверные поля (`id`, `createdAt`, `authorId`, `password`) не смешиваются с
  пользовательским вводом; пароль срезается до попадания в сессию (`toPublicUser`).
- **Безопасность входа**: при неверном логине показывается одна обобщённая ошибка —
  не раскрываем, существует ли email.
- **Каскадное удаление формы** реализовано на клиенте (mock-API не каскадит), а
  инвалидация счётчиков откликов поднимается через колбэк, чтобы слой `entities/form`
  не зависел от `entities/submission`.
- **Состояние фильтров/сортировки — в URL** (`useSyncedSearchParam`): переживает
  перезагрузку и шарится ссылкой.

<p align="right">(<a href="#readme-top">наверх</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[stars-shield]: https://img.shields.io/github/stars/nikidanil/craftform-app.svg?style=for-the-badge
[stars-url]: https://github.com/nikidanil/craftform-app/stargazers
[forks-shield]: https://img.shields.io/github/forks/nikidanil/craftform-app.svg?style=for-the-badge
[forks-url]: https://github.com/nikidanil/craftform-app/network/members
[issues-shield]: https://img.shields.io/github/issues/nikidanil/craftform-app.svg?style=for-the-badge
[issues-url]: https://github.com/nikidanil/craftform-app/issues
[contributors-shield]: https://img.shields.io/github/contributors/nikidanil/craftform-app.svg?style=for-the-badge
[contributors-url]: https://github.com/nikidanil/craftform-app/graphs/contributors
[license-shield]: https://img.shields.io/badge/license-educational-blue.svg?style=for-the-badge
[license-url]: #license
[React-badge]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TS-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TS-url]: https://www.typescriptlang.org/
[Vite-badge]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[Router-badge]: https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white
[Router-url]: https://reactrouter.com/
[Query-badge]: https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white
[Query-url]: https://tanstack.com/query
[Zustand-badge]: https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white
[Zustand-url]: https://zustand-demo.pmnd.rs/
[RHF-badge]: https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white
[RHF-url]: https://react-hook-form.com/
[Zod-badge]: https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white
[Zod-url]: https://zod.dev/
[Dnd-badge]: https://img.shields.io/badge/dnd_kit-000000?style=for-the-badge&logo=react&logoColor=white
[Dnd-url]: https://dndkit.com/
[Tailwind-badge]: https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Vitest-badge]: https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white
[Vitest-url]: https://vitest.dev/
[ESLint-badge]: https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white
[ESLint-url]: https://eslint.org/
