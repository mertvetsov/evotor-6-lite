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

Отправка формы пока имитируется в `src/main.js`. Подключите свой адрес для заявок.
