# CzasoGra

Gra dla ósmoklasistów do nauki **angielskich czasów gramatycznych** (Present Simple → Future Perfect Continuous).

Polski interfejs, angielskie ćwiczenia: misje z życiami i combo, bossy ze soft-timerem, XP, gwiazdki i odznaki. Postęp zapisuje się w przeglądarce (`localStorage`).

## Uruchom lokalnie

```bash
npm install
npm run dev
```

Otwórz [http://127.0.0.1:43123](http://127.0.0.1:43123).

```bash
npm test          # Vitest
npm run build     # produkcja → dist/
npm run preview   # podgląd builda
```

## GitHub Pages

1. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push na `main` uruchamia workflow `.github/workflows/deploy.yml` (testy → build → deploy)
3. Aplikacja używa `HashRouter` i `base: './'`, więc działa pod dowolną ścieżką Pages

## Jak grać

1. **Briefing** — krótka ściąga o czasie
2. **Misja (arcade)** — **Celownik** (strzel w poprawną odpowiedź), **Type-Blast** (wpisz i wystrzel), **Link Laser** (połącz pary); 3 serca + combo
3. **Boss** — ten sam arcade na punkty; 60% / 80% / 100% = 1★ / 2★ / 3★
4. Odblokuj następny poziom za 1★; **Mega Boss** po 6★
5. **Podpoziomy** (osobna strefa) — po 1★ na bossie: **10 etapów × 20 pytań** na każdy czas; kolejny etap od 60%
6. **Zapisy uczniów** — wiele lokalnych profili (imię) na urządzeniu: twórz, zmieniaj nazwę, usuwaj, przełączaj (`#/uczniowie`)

## Stack

Vite · React · TypeScript · Tailwind CSS · Vitest · GitHub Actions
