# schema-flow

> Narzędzie do wizualizacji schematów baz danych. Wklejasz instrukcje `CREATE TABLE`, dostajesz interaktywny diagram węzłowy z automatycznie narysowanymi relacjami kluczy obcych.

Projekt budowany jako samodzielna realizacja portfolio — od zera, bez gotowych szablonów. Cel: działające, publicznie dostępne narzędzie z realnym use-casem dla każdego pracującego z SQL.

---

## Demo

**Live:** https://schema.gorzkiewicz.dev

---

## Co pokazuje ten projekt technicznie

- **Parser SQL** — wyodrębnianie tabel, kolumn, typów, kluczy głównych i obcych z surowego DDL bez zewnętrznych bibliotek
- **Wizualizacja grafowa** — interaktywny canvas z węzłami i krawędziami (React Flow), przeciąganie tabel, auto-layout (dagre)
- **Typy relacji** — automatyczne wykrywanie one-to-many, one-to-one i many-to-many z osobnym stylem krawędzi per typ
- **Architektura frontend** — podział na warstwy (parser → typy → stan → widok), custom hooks, komponenty bez side-effectów
- **TypeScript** — pełne typowanie od parsera po komponenty, brak `any`
- **Export** — zapis diagramu do PNG i SVG z uwzględnieniem aktualnego układu węzłów
- **Deploy** — Vercel, automatyczny z GitHuba

---

## Funkcjonalności

- Parsowanie `CREATE TABLE` — kolumny, typy, `PRIMARY KEY`, `REFERENCES`, `CONSTRAINT FOREIGN KEY`
- Interaktywny diagram — węzły z listą kolumn i oznaczeniami PK/FK, przeciąganie, zoom, pan
- Automatyczne wykrywanie i rysowanie relacji FK z rozróżnieniem typów (one-to-many, one-to-one, many-to-many)
- Auto-layout — dagre układa węzły w czytelną hierarchię po kliknięciu Visualize lub Auto layout
- Sidebar z listą tabel, relacji i legendą typów krawędzi
- Eksport diagramu do PNG (2x) i SVG
- Tryb ciemny

---

## Stack

| Warstwa     | Technologia                  |
|-------------|------------------------------|
| Frontend    | React 19 + TypeScript        |
| Bundler     | Vite                         |
| Canvas      | React Flow (`@xyflow/react`) |
| Layout      | dagre                        |
| Export      | html-to-image                |
| Style       | Tailwind CSS v4              |
| Deploy      | Vercel                       |
| Domeny      | Cloudflare (gorzkiewicz.dev) |

---

## Struktura projektu

```
schema-flow/
├── public/
├── src/
│   ├── components/
│   │   ├── SqlInput.tsx       # textarea + przycisk Visualize
│   │   ├── SchemaCanvas.tsx   # React Flow canvas
│   │   ├── TableNode.tsx      # custom node: nagłówek + kolumny z PK/FK
│   │   ├── Sidebar.tsx        # lista tabel, relacji i legenda
│   │   └── ExportButton.tsx   # eksport PNG i SVG
│   ├── hooks/
│   │   └── useSchema.ts       # stan parsowania, nodes i edges do canvasu
│   ├── lib/
│   │   ├── sqlParser.ts       # parser CREATE TABLE → Schema
│   │   └── layout.ts          # auto-layout z dagre
│   ├── types/
│   │   └── schema.ts          # typy Table, Field, Relation, Schema
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
└── README.md
```

---

## Uruchomienie lokalne

**Wymagania:** Node.js 18+

```bash
git clone https://github.com/g0rzki/schema-flow.git
cd schema-flow
npm install
npm run dev
```

App: `http://localhost:5173`

---

## Przykładowe wejście

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  body TEXT NOT NULL
);
```

---

## Roadmap

- [x] Setup projektu, struktura, Vite + React + Tailwind
- [x] Parser SQL (`CREATE TABLE` → typy, PK, FK, relacje)
- [x] Canvas z węzłami tabel (React Flow)
- [x] Automatyczne krawędzie FK z typami relacji
- [x] Auto-layout (dagre)
- [x] Sidebar z listą tabel, relacji i legendą
- [x] Eksport do PNG i SVG
- [ ] Domyślny przykładowy schemat przy starcie
- [ ] Shareable URL (schemat zakodowany w hashu)
- [ ] Import z pliku `.sql`
- [ ] Minimap
- [ ] Skróty klawiszowe
- [ ] Poprawki UI