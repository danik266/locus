# Continue — персональный маршрут поступления

Рабочий прототип для LOCUS Startup Hackathon 2026, кейс 02. От анкеты до объяснимого подбора, сравнения и плана действий.

## Запуск

Node.js >= 22.13. `npm ci`, затем `npm run dev`. Адрес выводится в терминале. `npm run build` — production-сборка, `npm test` — проверки подбора и плана.

## Пользовательский путь

1. «Построить маршрут»: три шага анкеты (цель, страна/бюджет, готовность).
2. Диагностика и три программы выбранного направления с объяснениями и ограничениями.
3. Выбрать минимум две программы и сравнить их.
4. Выбрать программу, получить задачи, отметить прогресс. Изменение бюджета и английского влияет на рекомендации и подготовку.
5. Вернуться после перезагрузки через «Мой маршрут». Можно сохранить план в PDF через печать или удалить локальные данные.

## Стек и архитектура

React 19, TypeScript, vinext/Vite, CSS. `app/page.tsx` — клиентские экраны, `lib/admissions.ts` — каталог и детерминированные правила подбора/плана, `app/globals.css` — адаптивный дизайн и объёмные CSS-модели. IntersectionObserver запускает сборку моделей один раз при появлении; `prefers-reduced-motion` отключает движение. Нет скролл-перехвата. Локальное сохранение в `localStorage` (`dalee-v1`).

## Данные и проверка

**Каталог полностью демонстрационный:** названия учебных заведений, программы, стоимость и языковые требования иллюстративны и не представляют предложения реальных вузов. Это явно обозначено в интерфейсе. Реальные дедлайны не выдумываются; первая задача — проверка официального сайта. Стоимость проживания не входит в учебный бюджет.

Правила ранжирования: совпадение направления (фильтр), бюджет, страна, английский. Баллы внутренние и не отображаются как вероятность поступления. При несовпадениях показываются ограничения, даже если ни одна программа не подходит полностью. Анкета и отметки не отправляются на сервер; аккаунта и облачной синхронизации нет.

## AI / API / готовые компоненты

Внешняя AI-модель в работающий прототип **не подключена**. Используется разрешённая кейсом логика на правилах. GPT Images использован для дизайн-концептов в `design/` и social preview. Программирование — при помощи Codex. Базовый vinext/Sites starter предоставлен готовым; вся продуктовая логика создана в проекте. Шрифт Manrope загружается через Google Fonts; есть системный fallback. CSS-модели — код, не фотографии и не WebGL.

## Тестовый сценарий

Создать профиль: технологии, любая страна, 12 000 €, IELTS 6. Проверить три программы и предупреждения. Выбрать Нидерланды и 20 000 € — первая программа меняется. Поменять направление на дизайн — весь набор меняется. Сравнить две программы. Выбрать AI-программу при IELTS 5 и бюджете 5 000 € — в плане есть язык и финансирование. Отметить задачу и перезагрузить: прогресс сохраняется. Повторить с IELTS 7 и 20 000 € — лишних подготовительных задач нет.

## Ограничения и следующий этап

Это каркас, не готовый финальный сабмит. До подачи нужны реальные проверенные источники или расширенное обозначение демосценария, визуальная проверка на устройствах, доступный GitHub с историей, демо-видео до 3 минут, презентация до 8 слайдов и описание ролей команды (заполняет капитан). Название рабочее. Реальные заявления не отправляются. Поступление не гарантируется. Локальное хранение можно потерять при очистке браузера.

## Languages

Complete English, Russian and Kazakh interfaces (EN / RU / KK). English is the default. The header switcher persists a language-only `continue_locale` cookie for one year. The server uses it for document language, metadata and initial rendering. Changing language does not replace profile values, selected programs or completed tasks. The original `dalee-v1` storage key is retained for backward compatibility.

`lib/messages.ts` contains translations; `lib/i18n.ts` handles locale validation, currency and dynamic sentences. `app/language.tsx` localizes React text and accessibility labels without DOM mutation; form option values and event handlers remain canonical. Add new languages with complete dictionaries and coverage tests. No external translation API is used.

12 automated tests cover recommendations, preparation tasks, dictionary coverage, dynamic translations, locale validation and name preservation. Visual browser QA remains pending because no browser was available in the development session.
