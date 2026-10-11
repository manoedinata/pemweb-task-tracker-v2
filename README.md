# Task Tracker Kuliah v2

Pemrograman Web · ET234305 — Minggu 6: Asynchronous JavaScript & Fetch API

Repo: https://github.com/manoedinata/pemweb-task-tracker-v2

Lanjutan dari [Task Tracker Kuliah (v1)](https://github.com/manoedinata/pemweb-task-tracker), kini tersambung ke REST API (lewat Mock API Kampus):

- `GET /api/tugas` saat halaman dibuka, dengan state loading, error + tombol coba lagi, dan kosong
- `POST /api/tugas` untuk menambah tugas, tombol nonaktif selama mengirim
- `PATCH` / `DELETE /api/tugas/:id` lewat event delegation, dengan optimistic update + rollback
- Mata kuliah dimuat paralel dari `GET /api/matkul` via `Promise.all`
- Pencarian tugas dengan debounce

## Menjalankan

Buka `index.html` lewat live server mana pun (mis. `python3 -m http.server`). `mock-api-kampus.js` mencegat `fetch()` ke `/api/*` sehingga tidak perlu backend sungguhan.

Simulasi kondisi jaringan lewat Console:

```js
__API.setMode("lambat")   // atau "offline", "tidakstabil", "error500"
__API.pulihkan()
__API.reset()
```
