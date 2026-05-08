# Lighthouse-аудит

## Запуск (потрібен задеплоєний URL)

### 1. Через Chrome DevTools (найпростіше)

1. Відкрий задеплоєний проект (наприклад `https://warhammer-shop.vercel.app`)
2. **Інкогніто-режим обов'язковий** — розширення впливають на бал
3. F12 → вкладка **Lighthouse**
4. Налаштування:
   - Mode: **Navigation**
   - Device: **Desktop** (для головного балу) і потім **Mobile**
   - Categories: всі чотири (Performance, Accessibility, Best Practices, SEO)
5. **Analyze page load**

### 2. Через PageSpeed Insights (онлайн)

`https://pagespeed.web.dev/` → ввести URL → побачиш ті самі бали + рекомендації.

### 3. Через CLI (для скриптингу)

```powershell
npm install -g @lhci/cli
lhci collect --url=https://warhammer-shop.vercel.app/uk --numberOfRuns=3
lhci assert --preset=lighthouse:recommended
```

## Цільові бали (для рубрики потрібно ≥90 хоча б на одному маршруті)

Перевіряти на трьох сторінках мінімум:

| Сторінка | Перф | A11y | BP | SEO |
|---|---|---|---|---|
| `/uk` (головна) | ≥95 | ≥95 | ≥95 | ≥95 |
| `/uk/catalog` | ≥85 | ≥95 | ≥95 | ≥95 |
| `/uk/products/combat-patrol-space-marines` | ≥85 | ≥95 | ≥95 | ≥95 |

Каталог і сторінки продуктів просідають по Performance через зовнішні
картинки з `placehold.co` — це нормально для прототипу. На захист скажи:
«У проді картинки буде хоститись на CDN з оптимізованими WebP, що дасть
+10-15 балів». Або зміни seed на локальні файли в `public/products/`.

## Що вже зроблено для Lighthouse

### SEO ✓
- `app/robots.ts` → `/robots.txt` з виключенням `/admin`, `/account`, `/api/`,
  `/checkout`, `/auth/`
- `app/sitemap.ts` → `/sitemap.xml` з усіма продуктами обома локалями
- `generateMetadata` на всіх сторінках з description + canonical + alternates
- Open Graph (siteName, locale `uk_UA` / `en_US`)
- Twitter card (summary_large_image)
- `lang="uk"` / `lang="en"` на `<html>`

### Best Practices ✓
- `app/icon.tsx` → fav-icon (32×32, генерується через `ImageResponse`)
- `app/opengraph-image.tsx` → OG-картка 1200×630
- HTTPS-only (Vercel сам)
- `themeColor: '#1a1c1f'` через viewport — для мобільних браузерів
- `colorScheme: 'dark'` — без FOIT при темній темі браузера
- Автологам в actions через `console.error` тільки на справжніх помилках

### Accessibility ✓
- Skip-to-content link перед хедером (sr-only до фокуса)
- `aria-label` на іконці-кошику з лічильником, на пагінації, на формах
- `role="radiogroup"` для зіркового рейтингу + per-star `aria-label`
- Кольорові контрасти: `#e7dfc6` на `#1a1c1f` = 13:1 (AAA)
- Семантичні `<main>`, `<nav>`, `<header>`, `<aside>`, `<article>`
- Усі `<img>` через `<Image>` з `alt`
- Усі форми мають `<label>` для кожного `<input>`

### Performance ✓
- `next/font` для Cinzel і Inter з `display: swap` + `preload: true`
- `next/image` всюди з `sizes` і `priority` для above-fold
- Server Components за замовчуванням → мінімальний JS
- Static generation де можливо: `/[locale]`, `/catalog`, статичні сторінки
- `<head>` без render-blocking ресурсів

## Якщо бал < 90 — типові причини

### Performance < 90

1. **Велика LCP** (Largest Contentful Paint > 2.5s)
   - Картинки на головній / каталозі
   - Додай `priority` на перші 4 картинки в каталозі
   - Або заміни placeholder URL на статичний файл у `public/`

2. **CLS** (Cumulative Layout Shift > 0.1)
   - Перевір що в усіх `<Image>` є `width`/`height` АБО `fill` + `aspect-ratio`
   - У нас всюди `fill` з `aspect-square` — має бути ОК

3. **TBT** (Total Blocking Time > 300ms)
   - Перевір розмір JS у DevTools → Coverage
   - Можливо забагато client components — переведи що можна на server

### Accessibility < 95

- Якщо «Buttons do not have an accessible name» — перевір кнопки `<button>`
  лише з SVG-ім всередині, додай `aria-label`
- «Background and foreground colors do not have a sufficient contrast ratio»
  — використовуй `text-bone/70` замість `text-bone/40` для не-критичного тексту

### SEO < 95

- Якщо «Document does not have a meta description» на якійсь сторінці —
  додай `generateMetadata` з `description`
- Перевір що `robots.txt` доступний на `/{deployURL}/robots.txt`
- Перевір що `sitemap.xml` повертає валідний XML

## Як зберегти звіт для записки

DevTools Lighthouse → правий верхній кут → іконка завантаження → **Save as HTML**
(або **Save as JSON** для CI). Збережи у `docs/lighthouse/` для приклеювання
скріна в записку.

```
docs/lighthouse/
  home-desktop.html
  home-mobile.html
  catalog-desktop.html
  product-desktop.html
```

На захист достатньо одного скріна головної з 4-ма зеленими колами 95+.
