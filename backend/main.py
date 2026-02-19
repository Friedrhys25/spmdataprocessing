from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import json
import ast
from pathlib import Path
from typing import Optional, List
from collections import Counter

app = FastAPI(title="Movies Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western"
}

df_global = None

def load_data():
    global df_global

    # ✅ always locate CSV relative to project root (one level above /backend)
    BASE_DIR = Path(__file__).resolve().parent
    csv_path = BASE_DIR / "movies_dataset.csv"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found at: {csv_path}")

    df_global = pd.read_csv(csv_path)


    # Parse genre_ids
    def parse_genres(val):
        if pd.isna(val):
            return []
        try:
            return ast.literal_eval(str(val))
        except:
            return []

    df_global["genre_ids_parsed"] = df_global["genre_ids"].apply(parse_genres)
    df_global["genre_names"] = df_global["genre_ids_parsed"].apply(
        lambda ids: [GENRE_MAP.get(g, str(g)) for g in ids]
    )
    df_global["release_year"] = pd.to_datetime(df_global["release_date"], errors="coerce").dt.year
    df_global["release_month"] = pd.to_datetime(df_global["release_date"], errors="coerce").dt.month
    df_global["vote_average"] = pd.to_numeric(df_global["vote_average"], errors="coerce")
    df_global["vote_count"] = pd.to_numeric(df_global["vote_count"], errors="coerce")
    df_global["popularity"] = pd.to_numeric(df_global["popularity"], errors="coerce")
    return df_global

load_data()


@app.get("/movies")
def get_movies(
    search: Optional[str] = None,
    genre: Optional[str] = None,
    language: Optional[str] = None,
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    rating_min: Optional[float] = None,
    rating_max: Optional[float] = None,
    sort_by: Optional[str] = "popularity",
    sort_order: Optional[str] = "desc",
    page: int = 1,
    per_page: int = 20
):
    df = df_global.copy()

    if search:
        mask = (
            df["title"].str.contains(search, case=False, na=False) |
            df["overview"].str.contains(search, case=False, na=False) |
            df["original_title"].str.contains(search, case=False, na=False)
        )
        df = df[mask]

    if genre:
        df = df[df["genre_names"].apply(lambda g: genre in g)]

    if language:
        df = df[df["original_language"] == language]

    if year_min:
        df = df[df["release_year"] >= year_min]
    if year_max:
        df = df[df["release_year"] <= year_max]

    if rating_min is not None:
        df = df[df["vote_average"] >= rating_min]
    if rating_max is not None:
        df = df[df["vote_average"] <= rating_max]

    sort_cols = {
        "popularity": "popularity",
        "rating": "vote_average",
        "votes": "vote_count",
        "year": "release_year",
        "title": "title"
    }
    sort_col = sort_cols.get(sort_by, "popularity")
    ascending = sort_order == "asc"
    df = df.sort_values(sort_col, ascending=ascending, na_position="last")

    total = len(df)
    start = (page - 1) * per_page
    end = start + per_page
    page_df = df.iloc[start:end]

    movies = []
    for _, row in page_df.iterrows():
        movies.append({
            "id": int(row["id"]) if not pd.isna(row["id"]) else None,
            "title": row["title"],
            "original_title": row["original_title"],
            "overview": row["overview"] if not pd.isna(row.get("overview", "")) else "",
            "popularity": float(row["popularity"]) if not pd.isna(row["popularity"]) else 0,
            "vote_average": float(row["vote_average"]) if not pd.isna(row["vote_average"]) else 0,
            "vote_count": int(row["vote_count"]) if not pd.isna(row["vote_count"]) else 0,
            "release_date": row["release_date"] if not pd.isna(row.get("release_date", "")) else "",
            "release_year": int(row["release_year"]) if not pd.isna(row.get("release_year")) else None,
            "original_language": row["original_language"],
            "genre_names": row["genre_names"],
            "poster_url": f"https://image.tmdb.org/t/p/w500{row['poster_path']}" if not pd.isna(row.get("poster_path", "")) and row.get("poster_path", "") else "",
            "backdrop_url": f"https://image.tmdb.org/t/p/w780{row['backdrop_path']}" if not pd.isna(row.get("backdrop_path", "")) and row.get("backdrop_path", "") else "",
        })

    return {"total": total, "page": page, "per_page": per_page, "movies": movies}


@app.get("/analytics")
def get_analytics():
    df = df_global.copy()

    # Genre distribution
    all_genres = []
    for genres in df["genre_names"]:
        all_genres.extend(genres)
    genre_counts = Counter(all_genres)
    genre_dist = [{"genre": k, "count": v} for k, v in genre_counts.most_common(15)]

    # Rating distribution
    bins = [0, 2, 4, 5, 6, 7, 8, 9, 10]
    labels = ["0-2", "2-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10"]
    df["rating_bin"] = pd.cut(df["vote_average"], bins=bins, labels=labels, include_lowest=True)
    rating_dist = df["rating_bin"].value_counts().sort_index()
    rating_data = [{"range": str(k), "count": int(v)} for k, v in rating_dist.items()]

    # Movies per year
    year_counts = df["release_year"].dropna().value_counts().sort_index()
    year_data = [{"year": int(k), "count": int(v)} for k, v in year_counts.items() if k >= 1990]

    # Language distribution (top 10)
    lang_counts = df["original_language"].value_counts().head(10)
    lang_data = [{"language": k, "count": int(v)} for k, v in lang_counts.items()]

    # Top movies by popularity
    top_popular = df.nlargest(10, "popularity")[["title", "popularity", "vote_average"]].dropna()
    top_popular_data = [
        {"title": row["title"], "popularity": round(float(row["popularity"]), 2), "rating": round(float(row["vote_average"]), 2)}
        for _, row in top_popular.iterrows()
    ]

    # Top rated (min 100 votes)
    top_rated = df[df["vote_count"] >= 100].nlargest(10, "vote_average")[["title", "vote_average", "vote_count"]]
    top_rated_data = [
        {"title": row["title"], "rating": round(float(row["vote_average"]), 2), "votes": int(row["vote_count"])}
        for _, row in top_rated.iterrows()
    ]

    # Summary stats
    stats = {
        "total_movies": len(df),
        "avg_rating": round(float(df["vote_average"].mean()), 2),
        "avg_popularity": round(float(df["popularity"].mean()), 2),
        "total_languages": int(df["original_language"].nunique()),
        "year_range": [int(df["release_year"].min()), int(df["release_year"].max())] if not df["release_year"].isna().all() else [0, 0],
        "total_genres": len(genre_counts),
    }

    return {
        "stats": stats,
        "genre_distribution": genre_dist,
        "rating_distribution": rating_data,
        "movies_per_year": year_data,
        "language_distribution": lang_data,
        "top_popular": top_popular_data,
        "top_rated": top_rated_data,
    }


@app.get("/filters/options")
def get_filter_options():
    df = df_global.copy()

    all_genres = set()
    for genres in df["genre_names"]:
        all_genres.update(genres)

    languages = sorted(df["original_language"].dropna().unique().tolist())
    years = sorted(df["release_year"].dropna().astype(int).unique().tolist())

    return {
        "genres": sorted(list(all_genres)),
        "languages": languages,
        "year_min": min(years) if years else 1990,
        "year_max": max(years) if years else 2026,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
