import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence} from "framer-motion";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const API = "http://localhost:8000";

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const SearchIcon = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const FilterIcon = () => <Icon d="M4 6h16M7 12h10M10 18h4" />;
const StarIcon = ({ filled }) => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" />;
const ChartIcon = () => <Icon d="M18 20V10M12 20V4M6 20v-6" />;
const FilmIcon = () => <Icon d="M2 8h20M2 16h20M8 2v20M16 2v20M2 2h20v20H2z" />;
const GlobeIcon = () => <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />;
const TrendIcon = () => <Icon d="M22 7l-8.5 8.5-5-5L2 17" />;
const CloseIcon = () => <Icon d="M18 6L6 18M6 6l12 12" />;
const XIcon = () => <Icon d="M18 6L6 18M6 6l12 12" size={14} />;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const LANG_NAMES = { en: "English", fr: "French", es: "Spanish", ja: "Japanese", ko: "Korean", de: "German", it: "Italian", pt: "Portuguese", zh: "Chinese", hi: "Hindi", ru: "Russian", ar: "Arabic", nl: "Dutch", sv: "Swedish", da: "Danish", fi: "Finnish", pl: "Polish", tr: "Turkish", "null": "Unknown" };
const langName = (code) => LANG_NAMES[code] || code?.toUpperCase() || "Unknown";
const stars = (avg) => Math.round(avg / 2);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// ─── MINI BAR CHART ─────────────────────────────────────────────────────────
function BarChart({ data, xKey, yKey, color = "#6366f1", label }) {
  const max = Math.max(...data.map(d => d[yKey]));
  return (
    <div>
      {label && <p className="chart-label">{label}</p>}
      <div className="bar-chart">
        {data.map((d, i) => (
          <motion.div
            key={d[xKey]}
            className="bar-item"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
            style={{ transformOrigin: "bottom" }}
          >
            <div className="bar-tooltip">{d[xKey]}: {d[yKey].toLocaleString()}</div>
            <div className="bar" style={{ height: `${clamp((d[yKey] / max) * 100, 4, 100)}%`, background: color }} />
            <span className="bar-x">{String(d[xKey]).slice(-2)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── HORIZONTAL BAR ─────────────────────────────────────────────────────────
function HBar({ data, xKey, yKey, color = "#8b5cf6" }) {
  const max = Math.max(...data.map(d => d[yKey]));
  return (
    <div className="hbar-chart">
      {data.map((d, i) => (
        <motion.div
          key={d[xKey]}
          className="hbar-row"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <span className="hbar-label">{d[xKey]}</span>
          <div className="hbar-track">
            <motion.div
              className="hbar-fill"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(d[yKey] / max) * 100}%` }}
              transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="hbar-val">{d[yKey].toLocaleString()}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, delay = 0 }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </motion.div>
  );
}

// ─── MOVIE CARD ──────────────────────────────────────────────────────────────
function MovieCard({ movie, index }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = movie.backdrop_url || movie.poster_url;

  return (
    <motion.div
      className="movie-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
    >
      <div className="movie-poster">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={movie.original_title || movie.title}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextSibling;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}

        <div
          className="movie-poster-fallback"
          style={{ display: imgSrc ? "none" : "flex" }}
        >
          <FilmIcon />
          <span>{(movie.original_title || movie.title || "M")[0]?.toUpperCase()}</span>
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              className="movie-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="movie-overview">{movie.overview}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="movie-rating-badge">
          <StarIcon filled />
          <span>{movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{movie.original_title}</h3>
        <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "6px" }}>
          {movie.title}
        </p>
        <div className="movie-meta">
          <span className="movie-year">{movie.release_year || "—"}</span>
          <span className="movie-lang">{langName(movie.original_language)}</span>
        </div>
        <div className="movie-genres">
          {movie.genre_names?.slice(0, 3).map((g) => (
            <span key={g} className="genre-tag">{g}</span>
          ))}
        </div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--text2)",
            marginBottom: "8px",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {movie.overview}
        </p>
        <div className="movie-stats">
          <span className="movie-pop">⚡ {movie.popularity?.toFixed(0)}</span>
          <span className="movie-votes">{movie.vote_count?.toLocaleString()} votes</span>
        </div>
      </div>
    </motion.div>
  );
}


// ─── ANALYTICS TAB ──────────────────────────────────────────────────────────
function AnalyticsView({ data }) {
  if (!data) return <div className="loading"><div className="spinner" /></div>;
  const { stats, genre_distribution, rating_distribution, movies_per_year, language_distribution, top_popular, top_rated } = data;

  return (
    <motion.div
      className="analytics-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Movies" value={stats.total_movies.toLocaleString()} icon={<FilmIcon />} delay={0} />
        <StatCard label="Avg Rating" value={stats.avg_rating} icon={<StarIcon filled />} delay={0.08} sub={`out of 10`} />
        <StatCard label="Languages" value={stats.total_languages} icon={<GlobeIcon />} delay={0.16} />
        <StatCard label="Genres" value={stats.total_genres} icon={<ChartIcon />} delay={0.24} />
        <StatCard label="Year Range" value={`${stats.year_range[0]}–${stats.year_range[1]}`} icon={<TrendIcon />} delay={0.32} />
        <StatCard label="Avg Popularity" value={stats.avg_popularity.toLocaleString()} icon={<TrendIcon />} delay={0.4} />
      </div>

      <div className="charts-grid">
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3>Movies per Year</h3>
          <BarChart data={movies_per_year.slice(-30)} xKey="year" yKey="count" color="#6366f1" />
        </motion.div>

        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3>Rating Distribution</h3>
          <BarChart data={rating_distribution} xKey="range" yKey="count" color="#10b981" />
        </motion.div>

        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3>Top Genres</h3>
          <HBar data={genre_distribution.slice(0, 10)} xKey="genre" yKey="count" color="#f59e0b" />
        </motion.div>

        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3>Languages</h3>
          <HBar data={language_distribution} xKey="language" yKey="count" color="#ec4899" />
        </motion.div>

        <motion.div className="chart-card wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3>🔥 Most Popular</h3>
          <div className="top-list">
            {top_popular.map((m, i) => (
              <motion.div key={m.title} className="top-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                <span className="top-rank">#{i + 1}</span>
                <span className="top-title">{m.title}</span>
                <span className="top-score">⚡ {m.popularity.toLocaleString()}</span>
                <span className="top-rating">★ {m.rating}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="chart-card wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h3>⭐ Top Rated</h3>
          <div className="top-list">
            {top_rated.map((m, i) => (
              <motion.div key={m.title} className="top-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}>
                <span className="top-rank">#{i + 1}</span>
                <span className="top-title">{m.title}</span>
                <span className="top-score">{m.votes.toLocaleString()} votes</span>
                <span className="top-rating">★ {m.rating}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── MOVIES TAB ──────────────────────────────────────────────────────────────
function MoviesView({ filterOptions }) {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ genre: "", language: "", year_min: "", year_max: "", rating_min: "", rating_max: "" });
  const [sort, setSort] = useState({ by: "popularity", order: "desc" });
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

  const fetchMovies = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (params.search) q.set("search", params.search);
      if (params.genre) q.set("genre", params.genre);
      if (params.language) q.set("language", params.language);
      if (params.year_min) q.set("year_min", params.year_min);
      if (params.year_max) q.set("year_max", params.year_max);
      if (params.rating_min) q.set("rating_min", params.rating_min);
      if (params.rating_max) q.set("rating_max", params.rating_max);
      q.set("sort_by", params.sort_by || "popularity");
      q.set("sort_order", params.sort_order || "desc");
      q.set("page", params.page || 1);
      q.set("per_page", 24);
      const res = await fetch(`${API}/movies?${q}`);
      const data = await res.json();
      setMovies(data.movies);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchMovies({ search, ...filters, sort_by: sort.by, sort_order: sort.order, page: 1 });
    }, 300);
  }, [search, filters, sort]);

  useEffect(() => {
    fetchMovies({ search, ...filters, sort_by: sort.by, sort_order: sort.order, page });
  }, [page]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const totalPages = Math.ceil(total / 24);

  return (
    <div className="movies-view">
      {/* Search + Controls */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <SearchIcon />
          <input
            className="search-input"
            placeholder="Search movies, titles, overviews..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}><XIcon /></button>
          )}
        </div>
        <button className={`filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(v => !v)}>
          <FilterIcon />
          Filters {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
        </button>
        <select className="sort-select" value={`${sort.by}|${sort.order}`} onChange={e => { const [by, order] = e.target.value.split("|"); setSort({ by, order }); }}>
          <option value="popularity|desc">Popularity ↓</option>
          <option value="popularity|asc">Popularity ↑</option>
          <option value="rating|desc">Rating ↓</option>
          <option value="rating|asc">Rating ↑</option>
          <option value="votes|desc">Votes ↓</option>
          <option value="year|desc">Newest</option>
          <option value="year|asc">Oldest</option>
          <option value="title|asc">Title A-Z</option>
        </select>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="filter-grid">
              <div className="filter-group">
                <label>Genre</label>
                <select value={filters.genre} onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}>
                  <option value="">All Genres</option>
                  {filterOptions?.genres?.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Language</label>
                <select value={filters.language} onChange={e => setFilters(f => ({ ...f, language: e.target.value }))}>
                  <option value="">All Languages</option>
                  {filterOptions?.languages?.map(l => <option key={l} value={l}>{langName(l)}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Year From</label>
                <input type="number" placeholder={filterOptions?.year_min || 1990} value={filters.year_min} onChange={e => setFilters(f => ({ ...f, year_min: e.target.value }))} min={1900} max={2030} />
              </div>
              <div className="filter-group">
                <label>Year To</label>
                <input type="number" placeholder={filterOptions?.year_max || 2026} value={filters.year_max} onChange={e => setFilters(f => ({ ...f, year_max: e.target.value }))} min={1900} max={2030} />
              </div>
              <div className="filter-group">
                <label>Min Rating</label>
                <input type="number" placeholder="0" value={filters.rating_min} onChange={e => setFilters(f => ({ ...f, rating_min: e.target.value }))} min={0} max={10} step={0.5} />
              </div>
              <div className="filter-group">
                <label>Max Rating</label>
                <input type="number" placeholder="10" value={filters.rating_max} onChange={e => setFilters(f => ({ ...f, rating_max: e.target.value }))} min={0} max={10} step={0.5} />
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button className="clear-filters" onClick={() => setFilters({ genre: "", language: "", year_min: "", year_max: "", rating_min: "", rating_max: "" })}>
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results info */}
      <div className="results-info">
        <span>{total.toLocaleString()} movies found</span>
        {loading && <span className="loading-text">Loading...</span>}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading && movies.length === 0 ? (
          <motion.div key="loading" className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="spinner" />
          </motion.div>
        ) : (
          <motion.div key={`grid-${page}`} className="movies-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div className="pagination" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 6, page - 3)) + i;
            return p <= totalPages ? (
              <button key={p} className={page === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
            ) : null;
          })}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </motion.div>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("movies");
  const [analytics, setAnalytics] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    fetch(`${API}/filters/options`)
      .then(r => r.json())
      .then(d => { setFilterOptions(d); setApiStatus("ok"); })
      .catch(() => setApiStatus("error"));

    fetch(`${API}/analytics`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Background orbs */}
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />

        {/* Header */}
        <motion.header
          className="header"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="header-inner">
            <div className="logo">
              <span className="logo-icon">🎬</span>
              <div>
                <span className="logo-text">CineScope</span>
                <span className="logo-sub">Movie Analytics Platform</span>
              </div>
            </div>

            <nav className="nav">
              {[
                { id: "movies", label: "Browse", icon: <FilmIcon /> },
                { id: "analytics", label: "Analytics", icon: <ChartIcon /> },
              ].map(t => (
                <motion.button
                  key={t.id}
                  className={`nav-btn ${tab === t.id ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t.icon}
                  {t.label}
                  {tab === t.id && (
                    <motion.div className="nav-indicator" layoutId="nav-indicator" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
                  )}
                </motion.button>
              ))}
            </nav>

            <div className={`api-status ${apiStatus}`}>
              <span className="status-dot" />
              {apiStatus === "ok" ? "API Connected" : apiStatus === "error" ? "API Offline" : "Connecting..."}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="main">
          <AnimatePresence mode="wait">
            {tab === "movies" ? (
              <motion.div key="movies" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <MoviesView filterOptions={filterOptions} />
              </motion.div>
            ) : (
              <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <AnalyticsView data={analytics} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060810;
    --surface: #0d1117;
    --surface2: #13182b;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #e8eaf0;
    --text2: #8892a4;
    --text3: #4a5568;
    --accent: #6366f1;
    --accent2: #8b5cf6;
    --gold: #f59e0b;
    --green: #10b981;
    --pink: #ec4899;
    --radius: 12px;
    --radius-lg: 20px;
  }

  html, body { background: var(--bg); color: var(--text); font-family: 'Outfit', sans-serif; min-height: 100vh; overflow-x: hidden; }

  .app { min-height: 100vh; position: relative; }

  .bg-orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
  .orb1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%); top: -200px; left: -200px; }
  .orb2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%); bottom: 100px; right: -150px; }
  .orb3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); }

  /* HEADER */
  .header { position: sticky; top: 0; z-index: 100; border-bottom: 1px solid var(--border); background: rgba(6,8,16,0.85); backdrop-filter: blur(20px); }
  .header-inner { max-width: 1400px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 32px; }

  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon { font-size: 28px; }
  .logo-text { font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #e8eaf0, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: block; line-height: 1; }
  .logo-sub { font-size: 10px; color: var(--text3); font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; }

  .nav { display: flex; gap: 4px; margin-left: auto; }
  .nav-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; background: none; color: var(--text2); font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; position: relative; transition: color 0.2s; }
  .nav-btn:hover { color: var(--text); }
  .nav-btn.active { color: var(--text); border-color: var(--border2); background: var(--surface2); }
  .nav-indicator { position: absolute; inset: 0; border-radius: 8px; background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); }

  .api-status { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px; background: var(--surface2); border: 1px solid var(--border); }
  .api-status.ok { color: var(--green); }
  .api-status.error { color: #ef4444; }
  .api-status.checking { color: var(--text3); }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .api-status.ok .status-dot { box-shadow: 0 0 6px currentColor; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* MAIN */
  .main { max-width: 1400px; margin: 0 auto; padding: 32px 24px 80px; position: relative; z-index: 1; }

  /* MOVIES VIEW */
  .search-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
  .search-input-wrap { flex: 1; min-width: 280px; display: flex; align-items: center; gap: 10px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; padding: 0 14px; transition: border-color 0.2s; }
  .search-input-wrap:focus-within { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  .search-input-wrap svg { color: var(--text3); flex-shrink: 0; }
  .search-input { flex: 1; background: none; border: none; outline: none; color: var(--text); font-family: 'Outfit', sans-serif; font-size: 14px; height: 44px; }
  .search-input::placeholder { color: var(--text3); }
  .search-clear { background: none; border: none; cursor: pointer; color: var(--text3); display: flex; padding: 4px; border-radius: 4px; }
  .search-clear:hover { color: var(--text); }

  .filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 16px; height: 44px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; color: var(--text2); font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .filter-btn:hover, .filter-btn.active { color: var(--accent); border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.08); }
  .filter-badge { background: var(--accent); color: white; font-size: 11px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

  .sort-select { height: 44px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; color: var(--text); font-family: 'Outfit', sans-serif; font-size: 14px; padding: 0 12px; cursor: pointer; outline: none; }

  /* FILTER PANEL */
  .filter-panel { overflow: hidden; background: var(--surface2); border: 1px solid var(--border2); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
  .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
  .filter-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .filter-group select, .filter-group input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'Outfit', sans-serif; font-size: 13px; padding: 8px 10px; outline: none; transition: border-color 0.2s; }
  .filter-group select:focus, .filter-group input:focus { border-color: rgba(99,102,241,0.5); }
  .clear-filters { margin-top: 16px; background: none; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #ef4444; padding: 6px 14px; font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .clear-filters:hover { background: rgba(239,68,68,0.1); }

  .results-info { font-size: 13px; color: var(--text3); margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
  .loading-text { color: var(--accent); animation: pulse 1s infinite; }

  /* MOVIES GRID */
  .movies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }

  .movie-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
  .movie-card:hover { border-color: var(--border2); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

  .movie-poster { position: relative; aspect-ratio: 2/3; background: var(--surface); overflow: hidden; }
  .movie-poster img { width: 100%; height: 100%; object-fit: cover; }
  .movie-poster-fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text3); font-size: 48px; font-weight: 800; font-family: 'Playfair Display', serif; }
  .movie-poster-fallback svg { opacity: 0.3; }

  .movie-overlay { position: absolute; inset: 0; background: rgba(6,8,16,0.92); padding: 16px; display: flex; align-items: center; justify-content: center; }
  .movie-overview { font-size: 12px; line-height: 1.6; color: var(--text2); display: -webkit-box; -webkit-line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden; }

  .movie-rating-badge { position: absolute; top: 10px; right: 10px; background: rgba(6,8,16,0.85); border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; padding: 4px 8px; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--gold); backdrop-filter: blur(8px); }

  .movie-info { padding: 14px; }
  .movie-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
  .movie-meta { display: flex; gap: 8px; font-size: 12px; color: var(--text3); margin-bottom: 8px; }
  .movie-year { font-weight: 600; }
  .movie-genres { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
  .genre-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: rgba(99,102,241,0.15); color: rgba(165,170,255,0.9); border: 1px solid rgba(99,102,241,0.2); }
  .movie-stats { display: flex; justify-content: space-between; font-size: 11px; color: var(--text3); }
  .movie-pop { color: #fbbf24; }

  /* PAGINATION */
  .pagination { display: flex; justify-content: center; gap: 4px; margin-top: 40px; flex-wrap: wrap; }
  .pagination button { min-width: 36px; height: 36px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text2); font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; padding: 0 8px; }
  .pagination button:hover:not(:disabled) { border-color: var(--border2); color: var(--text); background: var(--surface); }
  .pagination button.active { background: var(--accent); border-color: var(--accent); color: white; }
  .pagination button:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ANALYTICS */
  .analytics-view {}
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(99,102,241,0.06), transparent); }
  .stat-icon { color: var(--accent); margin-bottom: 12px; opacity: 0.7; }
  .stat-value { font-size: 28px; font-weight: 800; font-family: 'Outfit', sans-serif; margin-bottom: 4px; background: linear-gradient(135deg, var(--text), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .stat-label { font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.06em; }
  .stat-sub { font-size: 11px; color: var(--text3); margin-top: 4px; }

  .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px; }
  .chart-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
  .chart-card.wide { grid-column: 1 / -1; }
  .chart-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 20px; color: var(--text); }

  /* BAR CHART */
  .chart-label { font-size: 12px; color: var(--text3); margin-bottom: 10px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 3px; height: 140px; padding-bottom: 24px; position: relative; }
  .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; position: relative; justify-content: flex-end; cursor: default; }
  .bar-item:hover .bar-tooltip { opacity: 1; transform: translateY(-4px); }
  .bar-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: var(--surface); border: 1px solid var(--border2); border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 600; white-space: nowrap; color: var(--text); pointer-events: none; opacity: 0; transition: all 0.2s; z-index: 10; }
  .bar { width: 100%; border-radius: 4px 4px 0 0; transition: opacity 0.2s; min-height: 4px; }
  .bar-item:hover .bar { opacity: 0.8; }
  .bar-x { position: absolute; bottom: 0; font-size: 9px; color: var(--text3); white-space: nowrap; }

  /* HBAR CHART */
  .hbar-chart { display: flex; flex-direction: column; gap: 10px; }
  .hbar-row { display: grid; grid-template-columns: 90px 1fr 60px; align-items: center; gap: 12px; }
  .hbar-label { font-size: 12px; color: var(--text2); text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
  .hbar-track { height: 8px; background: var(--surface); border-radius: 4px; overflow: hidden; }
  .hbar-fill { height: 100%; border-radius: 4px; }
  .hbar-val { font-size: 12px; color: var(--text3); font-weight: 600; }

  /* TOP LIST */
  .top-list { display: flex; flex-direction: column; gap: 8px; }
  .top-item { display: grid; grid-template-columns: 32px 1fr auto auto; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface); border-radius: 10px; border: 1px solid var(--border); transition: border-color 0.2s; }
  .top-item:hover { border-color: var(--border2); }
  .top-rank { font-size: 13px; font-weight: 800; color: var(--text3); }
  .top-title { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .top-score { font-size: 12px; color: var(--text3); }
  .top-rating { font-size: 13px; font-weight: 700; color: var(--gold); }

  /* LOADING */
  .loading { display: flex; align-items: center; justify-content: center; min-height: 300px; }
  .spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .header-inner { gap: 16px; }
    .logo-sub { display: none; }
    .api-status { display: none; }
    .main { padding: 20px 16px 60px; }
    .movies-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
    .charts-grid { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .top-item { grid-template-columns: 24px 1fr auto; }
    .top-score { display: none; }
  }
`;

