# 🎬 CineScope — Movie Analytics Platform

A full-stack movie data processing, search, filter, and analytics app built with **Python FastAPI** + **React** + **Framer Motion**.

---

## 🗂 Project Structure

```
cinescope/
├── movies_dataset.csv        ← Your dataset goes here
├── start.sh                  ← One-command startup script
├── backend/
│   ├── main.py               ← FastAPI backend (data processing, REST API)
│   └── requirements.txt      ← Python dependencies
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        └── App.jsx           ← React app (search, filter, analytics UI)
```

---

## 🚀 Quick Start

### Option 1 — Automated (Linux/macOS)
```bash
chmod +x start.sh
./start.sh
```

### Option 2 — Manual

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../movies_dataset.csv .        # copy your dataset
uvicorn main:app --reload --port 8000
```

**Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:3000**

---

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /movies` | Paginated movie list with search, filter & sort |
| `GET /analytics` | Full analytics data (stats, charts, rankings) |
| `GET /filters/options` | Available filter options (genres, languages, years) |

### `/movies` Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Full-text search in title & overview |
| `genre` | string | Filter by genre name (e.g. `Action`) |
| `language` | string | Filter by language code (e.g. `en`) |
| `year_min` | int | Minimum release year |
| `year_max` | int | Maximum release year |
| `rating_min` | float | Minimum vote average |
| `rating_max` | float | Maximum vote average |
| `sort_by` | string | `popularity`, `rating`, `votes`, `year`, `title` |
| `sort_order` | string | `asc` or `desc` |
| `page` | int | Page number (default 1) |
| `per_page` | int | Results per page (default 20) |

---

## ✨ Features

### 🔍 Search & Filter
- Full-text search across title, original title & overview
- Genre filter (dynamically populated from dataset)
- Language filter
- Year range filter
- Rating range filter
- Multi-column sorting (popularity, rating, votes, year, title)
- Paginated results (24 per page)

### 📊 Analytics Dashboard
- **6 summary stats**: total movies, avg rating, languages, genres, year range, avg popularity
- **Movies per year** bar chart (last 30 years)
- **Rating distribution** bar chart
- **Top genres** horizontal bar chart
- **Language distribution** horizontal bar chart
- **Top 10 most popular** ranked list
- **Top 10 highest rated** ranked list (min 100 votes)

### 🎨 UI/UX
- Framer Motion page transitions & staggered animations
- Movie poster hover overlay with synopsis
- Responsive grid layout
- Dark cinematic theme
- Real-time search with 300ms debounce
- API connection status indicator

---

## 📋 CSV Requirements

Your `movies_dataset.csv` must include these columns:
```
adult, backdrop_path, genre_ids, id, original_language, original_title,
overview, popularity, poster_path, release_date, title, video,
vote_average, vote_count
```

Movie posters are loaded from **TMDB** using the `poster_path` column.
If no `movies_dataset.csv` is found, the backend auto-generates 200 sample movies.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Pandas, NumPy |
| Frontend | React 18, Vite, Framer Motion |
| Fonts | Outfit (UI), Playfair Display (accents) |
| Images | TMDB CDN |
