# Shree Jagannath Mandir — Admin Dashboard (React + Vite)

A working front-end of the temple admin: a login screen plus 8 panels
(Overview, Gallery, Blog Posts, Festivals, Timings, Donations, Messages, Settings).
Built with **React 18 + Vite (JavaScript)**, plain CSS, and React Router.

Data is stored in the browser (`localStorage`) via a small data layer, so the app
runs standalone with no backend. When you're ready, swap that layer for a REST API
(see "Connecting a backend" below).

## Run

```bash
cd admin-app
npm install
npm run dev        # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Login

- **Username:** `admin`
- **Password:** `jagannath`

(Defined in `src/context/AuthContext.jsx`.)

## Project structure

```
admin-app/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx                 # entry + providers
   ├─ App.jsx                  # routes (login + protected dashboard)
   ├─ styles/global.css        # all design tokens + component classes
   ├─ context/AuthContext.jsx  # demo auth (localStorage token)
   ├─ data/store.js            # localStorage data layer (maps 1:1 to REST)
   ├─ components/
   │   ├─ DashboardLayout.jsx  # sidebar + topbar + <Outlet/>
   │   ├─ Sidebar.jsx          # grouped nav + live unread badge
   │   └─ PageHead.jsx         # eyebrow + title helper
   └─ pages/
       ├─ Login.jsx
       ├─ Overview.jsx
       ├─ Gallery.jsx
       ├─ Blogs.jsx
       ├─ Festivals.jsx
       ├─ Timings.jsx
       ├─ Donations.jsx
       ├─ Messages.jsx
       └─ Settings.jsx
```

## Design

All colours, fonts and component styles live in `src/styles/global.css` under `:root`
tokens (maroon `#6E1413`, gold `#C28A1E`, cream `#FBF6EA`, …). Fonts: Cormorant
Garamond (headings), Mukta (body), Space Mono (labels), Noto Sans Oriya (Odia).

## Connecting a backend

`src/data/store.js` is the single seam. Each call maps to a REST endpoint:

| Data layer                     | REST endpoint            |
|--------------------------------|--------------------------|
| `store.list('blogs')`          | `GET /api/blogs`         |
| `store.add('blogs', rec)`      | `POST /api/blogs`        |
| `store.update('blogs', id, p)` | `PUT /api/blogs/:id`     |
| `store.remove('blogs', id)`    | `DELETE /api/blogs/:id`  |
| `store.get('settings')`        | `GET /api/settings`      |
| `store.patch('settings', p)`   | `PUT /api/settings`      |

Replace the bodies with `axios` calls (make each page's handlers `async`) and swap
`AuthContext.login` for a real `POST /api/auth/login` that returns a JWT. The
component/markup layer does not need to change.

See `Cursor Admin Dashboard Prompt.md` in the project root for a full backend spec.
