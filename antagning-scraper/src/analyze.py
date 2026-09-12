#!/usr/bin/env python3
"""Analyze the normalized antagning.se course table produced by scrape.py.

Examples:
    python src/analyze.py
    python src/analyze.py --search "maskininl|AI|artificiell"
    python src/analyze.py --niche "hallbarhet"
"""
from __future__ import annotations

import argparse
import re
from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # headless-safe: always save charts to file, never try to open a window
import matplotlib.pyplot as plt
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = PROJECT_ROOT / "data" / "processed" / "courses.csv"
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "output"

SWEDISH_STOPWORDS = {
    "och", "i", "att", "det", "som", "en", "ett", "på", "för", "med", "av", "till",
    "är", "om", "den", "de", "har", "kurs", "kursen", "grundnivå", "avancerad",
    "nivå", "distans", "hp", "del", "grund",
}


def load_courses(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    if "hp" in df.columns:
        df["hp"] = pd.to_numeric(df["hp"], errors="coerce")
    if "antal_platser" in df.columns:
        df["antal_platser"] = pd.to_numeric(df["antal_platser"], errors="coerce")
    return df


def overview(df: pd.DataFrame) -> None:
    print("\n=== Antal kurser per lärosäte ===")
    print(df["larosate"].value_counts().to_string())

    if "niva" in df.columns:
        print("\n=== Antal kurser per nivå ===")
        print(df["niva"].value_counts().to_string())

    if "hp" in df.columns:
        print("\n=== Fördelning poäng (hp) ===")
        print(df["hp"].describe().to_string())


def find_outliers(df: pd.DataFrame, short_hp: float = 3.0, long_hp: float = 30.0, few_seats: int = 5) -> dict[str, pd.DataFrame]:
    outliers: dict[str, pd.DataFrame] = {}
    if "hp" in df.columns:
        outliers["korta_kurser"] = df[df["hp"] <= short_hp]
        outliers["langa_kurser"] = df[df["hp"] >= long_hp]
    if "antal_platser" in df.columns:
        outliers["fa_platser"] = df[df["antal_platser"] <= few_seats]
    return outliers


def word_frequencies(df: pd.DataFrame, column: str = "kursnamn") -> Counter:
    counter: Counter = Counter()
    for title in df[column].dropna():
        words = re.findall(r"[A-Za-zÅÄÖåäö]+", str(title).lower())
        counter.update(w for w in words if w not in SWEDISH_STOPWORDS and len(w) > 2)
    return counter


def niche_providers(df: pd.DataFrame, keyword: str, column: str = "kursnamn") -> pd.Series:
    mask = df[column].fillna("").astype(str).str.contains(keyword, case=False, regex=True)
    return df[mask]["larosate"].value_counts()


def search(df: pd.DataFrame, pattern: str, columns: list[str]) -> pd.DataFrame:
    combined = pd.Series(False, index=df.index)
    for col in columns:
        if col in df.columns:
            combined = combined | df[col].fillna("").astype(str).str.contains(pattern, case=False, regex=True)
    return df[combined]


def plot_top_providers(df: pd.DataFrame, out_dir: Path, top_n: int = 20) -> Path:
    counts = df["larosate"].value_counts().head(top_n)
    fig, ax = plt.subplots(figsize=(8, max(4, top_n * 0.3)))
    counts.sort_values().plot.barh(ax=ax)
    ax.set_xlabel("Antal distanskurser")
    ax.set_title("Flest distanskurser per lärosäte")
    fig.tight_layout()
    out_path = out_dir / "top_providers.png"
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
    return out_path


def plot_top_words(counter: Counter, out_dir: Path, top_n: int = 25) -> Path:
    top = counter.most_common(top_n)
    words, counts = zip(*top) if top else ((), ())
    fig, ax = plt.subplots(figsize=(8, max(4, top_n * 0.25)))
    ax.barh(list(words)[::-1], list(counts)[::-1])
    ax.set_xlabel("Antal förekomster i kurstitlar")
    ax.set_title("Ämnesord som sticker ut i frekvens")
    fig.tight_layout()
    out_path = out_dir / "top_words.png"
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--search", help="Regex to search for in kursnamn (title)")
    parser.add_argument("--niche", help="Keyword to find niche providers for, e.g. 'AI'")
    args = parser.parse_args()

    if not args.input.exists():
        raise SystemExit(f"{args.input} does not exist yet -- run src/scrape.py first.")

    df = load_courses(args.input)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    overview(df)

    for name, subset in find_outliers(df).items():
        print(f"\n=== {name} ({len(subset)}) ===")
        cols = [c for c in ("kurskod", "kursnamn", "larosate", "hp", "antal_platser") if c in subset.columns]
        print(subset[cols].head(20).to_string(index=False))

    words = word_frequencies(df)
    print("\n=== Vanligaste ämnesorden i kurstitlar ===")
    for word, count in words.most_common(20):
        print(f"{word}: {count}")

    if args.niche:
        print(f"\n=== Lärosäten med flest kurser som matchar '{args.niche}' ===")
        print(niche_providers(df, args.niche).to_string())

    if args.search:
        hits = search(df, args.search, ["kursnamn"])
        print(f"\n=== Sökträffar för '{args.search}' ({len(hits)}) ===")
        cols = [c for c in ("kurskod", "kursnamn", "larosate", "hp") if c in hits.columns]
        print(hits[cols].to_string(index=False))

    providers_png = plot_top_providers(df, args.output_dir)
    words_png = plot_top_words(words, args.output_dir)
    print(f"\nSparade grafer: {providers_png}, {words_png}")


if __name__ == "__main__":
    main()
