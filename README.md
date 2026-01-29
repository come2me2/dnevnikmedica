# Дневник медика (TMA)

Личное приложение для учёбы в медицинском университете: расписание, задания и шпаргалки.

## Возможности

- **Расписание** — загрузка PDF с расписанием (авторазбор по возможности), отображение в календаре, ручное добавление/редактирование занятий.
- **Задания** — привязка заданий к занятиям, отметка выполнения галочкой, шкала прогресса (выполнено / всего).
- **Шпаргалки** — предметы, загрузка шпаргалок в виде текста, PDF или изображений; просмотр по предметам.

Данные хранятся локально в браузере (IndexedDB). Деплой на Vercel — статический фронт + API не требуется.

## Стек

- Next.js 14, React 18, TypeScript
- Tailwind CSS
- react-big-calendar, date-fns
- pdfjs-dist (разбор PDF)
- idb (IndexedDB)

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Сборка и деплой на Vercel

```bash
npm run build
```

Подключите репозиторий [come2me2/dnevnikmedica](https://github.com/come2me2/dnevnikmedica) к Vercel — деплой по push в `main`. Либо:

```bash
npx vercel
```

## Репозиторий

https://github.com/come2me2/dnevnikmedica
