# Эвотор 6 lite — лендинг акции «Касса за кассу»

Адаптивный лендинг по PDF-макету: Vite, Three.js (интерактивная 3D-модель терминала), GSAP + ScrollTrigger, Lenis, шрифт Manrope.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # сборка в dist/
```

- `src/main.js` — скролл, анимации, шапка, форма
- `src/terminal.js` — 3D-терминал: загрузка GLB, материалы, скриншоты на экране, вращение
- `src/styles.css` — стили (на десктопе 1rem = 10px макета при ширине 1200px)
- `public/models/terminal.glb` — модель, сжатая meshopt
- `public/img/` — изображения в WebP и текстуры экрана

## Прототип

Это визуальный прототип для согласования дизайна. Форма ничего не отправляет и не сохраняет: после нажатия «Оставить заявку» поля очищаются и появляется сообщение, что заявка не отправлена. Автозаполнение браузера отключено, страница закрыта от индексации (`noindex`).

## GitHub Pages

Сборка и публикация настроены в `.github/workflows/pages.yml`. Сайт собирается с относительными путями (`base: './'`), поэтому работает по адресу вида `https://<user>.github.io/<repo>/`.

Пока Pages не включён в настройках, workflow ничего не публикует. Чтобы включить:

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Запустить workflow «Deploy to GitHub Pages» (Actions → Run workflow) или сделать push в `main`.

После этого каждый push в `main` обновляет сайт.
