# schema-flow

> Narzędzie do wizualizacji schematów baz danych. Wklejasz instrukcje `CREATE TABLE`, dostajesz interaktywny diagram węzłowy z automatycznie narysowanymi relacjami kluczy obcych.

Projekt budowany jako samodzielna realizacja portfolio — od zera, bez gotowych szablonów. Cel: działające, publicznie dostępne narzędzie z realnym use-casem dla każdego pracującego z SQL.

---

## Demo

**Live:** https://schema.gorzkiewicz.dev

---

## Co pokazuje ten projekt technicznie

- **Parser SQL** — wyodrębnianie tabel, kolumn, typów, kluczy głównych i obcych z surowego DDL bez zewnętrznych bibliotek
- **Wizualizacja grafowa** — interaktywny canvas z węzłami i krawędziami (React Flow), przeciąganie tabel, auto-layout
- **Architektura frontend** — podział na warstwy (parser → typy → stan → widok), custom hooks, komponenty bez side-effectów
- **TypeScript** — pełne typowanie od parsera po komponenty, brak `any`
- **Deploy** — Vercel, automatyczny z GitHuba

---

## Funkcjonalności

- Parsowanie `CREATE TABLE` — kolumny, typy, `PRIMARY KEY`, `REFERENCES`
- Interaktywny diagram — węzły z listą kolumn i oznaczeniami PK/FK, przeciąganie, zoom, pan
- Automatyczne rysowanie relacji FK jako krawędzie między węzłami
- Sidebar z listą tabel i relacji
- Eksport diagramu do SVG
- Tryb ciemny

---

## Stack

| Warstwa     | Technologia              |
|-------------|--------------------------|
| Frontend    | React 19 + TypeScript    |
| Bundler     | Vite                     |
| Canvas      | React Flow (`@xyflow/react`) |
| Style       | Tailwind CSS v4          |
| Deploy      | Vercel                   |
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
│   │   └── Sidebar.tsx        # lista tabel i relacji
│   ├── hooks/
│   │   └── useSchema.ts       # stan parsowania, nodes i edges do canvasu
│   ├── lib/
│   │   └── sqlParser.ts       # parser CREATE TABLE → Schema
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
- [ ] Typy i parser SQL (`CREATE TABLE` → AST)
- [ ] Canvas z węzłami tabel (React Flow)
- [ ] Automatyczne krawędzie FK
- [ ] Sidebar z listą tabel i relacji
- [ ] Eksport do SVG
- [ ] Import z pliku `.sql`
- [ ] Shareable URL (schema zakodowana w hashu)
- [ ] Minimap