# backend/analysis/utils.py
import os
import io
import csv
import json
import pandas as pd
import numpy as np
from pathlib import Path
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Optional OpenAI import - used only if OPENAI_API_KEY present.
try:
    import openai
except Exception:
    openai = None

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "sample_data"
SAMPLE_FILE = SAMPLE_DIR / "dataset.csv"  # fallback csv name

def load_dataset_from_path(path: Optional[str] = None, top: int = 20000) -> pd.DataFrame:
    """
    Load a dataset from a given path (uploaded) or from SAMPLE_FILE.
    Returns a pandas DataFrame limited to `top` rows.
    """
    if path:
        logger.debug("Loading dataset from provided path: %s", path)
        if str(path).lower().endswith(".csv"):
            df = pd.read_csv(path)
        else:
            df = pd.read_excel(path)
    else:
        sample = SAMPLE_FILE
        if not sample.exists():
            raise FileNotFoundError(f"Sample data not found at {sample}")
        logger.debug("Loading dataset from sample file: %s", sample)
        if str(sample).lower().endswith(".csv"):
            df = pd.read_csv(sample)
        else:
            df = pd.read_excel(sample)
    df = df.copy()
    return df.head(top)


def _candidate_location_columns(df: pd.DataFrame) -> List[str]:
    """
    Return candidate columns likely to contain locality names.
    """
    cols = []
    for c in df.columns:
        lc = c.lower()
        if "location" in lc or "area" in lc or "locality" in lc or "final location" in lc or "place" in lc:
            cols.append(c)
    # fallback: any object/string columns
    if not cols:
        cols = [c for c in df.columns if df[c].dtype == "object"]
    return cols


def extract_area_from_query_using_values(df: pd.DataFrame, query: str) -> Optional[str]:
    """
    Given dataframe and a full natural-language query, try to find a location
    value present in the dataframe which appears (as substring) inside the query.
    Returns the matched location string or None.
    """
    if not query:
        return None
    q = query.lower()
    # gather candidate location values from dataset (unique)
    candidate_cols = _candidate_location_columns(df)
    values = set()
    for c in candidate_cols:
        try:
            for v in df[c].dropna().astype(str).unique():
                if v and len(v.strip()) > 0:
                    values.add(v.strip())
        except Exception:
            continue

    # sort by length descending so longer names match first (e.g., "ambegaon budruk" before "ambegaon")
    sorted_values = sorted(values, key=lambda s: -len(s))
    for val in sorted_values:
        if val.lower() in q:
            return val
    return None


def filter_by_area(df: pd.DataFrame, query: str, top: int = 200) -> pd.DataFrame:
    """
    Filter dataframe by an area query.
    - First, attempt case-insensitive substring match of the entire query against candidate columns.
    - If that yields no rows, attempt to detect a known location value inside the query (extract_area_from_query_using_values)
      and filter for that specific location value.
    Returns df.head(top) of filtered results.
    """
    q = (query or "").strip().lower()
    if not q:
        return df.head(top)

    df_filtered = pd.DataFrame()
    candidate_cols = _candidate_location_columns(df)

    # Primary: try to match the query directly against candidate columns
    mask = None
    for c in candidate_cols:
        try:
            this_mask = df[c].astype(str).str.lower().str.contains(q, na=False)
            mask = this_mask if mask is None else (mask | this_mask)
        except Exception:
            continue
    if mask is not None:
        df_filtered = df[mask].head(top)

    # If empty, try to extract a location value from query by comparing known values
    if df_filtered.empty:
        detected = extract_area_from_query_using_values(df, query)
        if detected:
            # filter rows where any candidate column equals (or contains) the detected value
            mask2 = None
            for c in candidate_cols:
                try:
                    this_mask = df[c].astype(str).str.lower().str.contains(detected.strip().lower(), na=False)
                    mask2 = this_mask if mask2 is None else (mask2 | this_mask)
                except Exception:
                    continue
            if mask2 is not None:
                df_filtered = df[mask2].head(top)

    # Final fallback: return empty (no match) or at least top rows if query empty
    if df_filtered is None or df_filtered.empty:
        return pd.DataFrame(columns=df.columns)  # empty df with same columns
    return df_filtered.head(top)


def aggregate_for_chart(df: pd.DataFrame, year_col: str = "year", price_col: str = "price", demand_col: str = "demand") -> Dict[str, Any]:
    """
    Build a chart-friendly dict:
      { labels: [years], price: [avg_price], demand: [sum_demand], price_col: actual column name, demand_col: actual column name }
    Attempts to auto-detect columns when standard names not present.
    """
    df = df.copy()
    # Detect year column if not found
    if year_col not in df.columns:
        possible_years = [c for c in df.columns if c.lower() == "year"]
        if possible_years:
            year_col = possible_years[0]
        else:
            for c in df.columns:
                if np.issubdtype(df[c].dtype, np.datetime64):
                    df["year"] = pd.to_datetime(df[c], errors="coerce").dt.year
                    year_col = "year"
                    break

    # Detect price/demand candidates
    if price_col not in df.columns:
        price_candidates = [c for c in df.columns if "price" in c.lower() or "rate" in c.lower() or "weighted average" in c.lower()]
        price_col = price_candidates[0] if price_candidates else None
    if demand_col not in df.columns:
        demand_candidates = [c for c in df.columns if "demand" in c.lower() or "sold" in c.lower() or "units" in c.lower() or "total sold" in c.lower()]
        demand_col = demand_candidates[0] if demand_candidates else None

    if year_col not in df.columns:
        df["year"] = pd.NA
        year_col = "year"

    try:
        df[year_col] = pd.to_numeric(df[year_col], errors="coerce").astype("Int64")
    except Exception:
        pass

    price_exists = (price_col in df.columns) if price_col else False
    demand_exists = (demand_col in df.columns) if demand_col else False

    agg_map = {}
    if price_exists:
        agg_map["avg_price"] = (price_col, lambda s: pd.to_numeric(s, errors="coerce").mean())
    else:
        agg_map["avg_price"] = (price_col or "price", lambda s: np.nan)

    if demand_exists:
        agg_map["total_demand"] = (demand_col, lambda s: pd.to_numeric(s, errors="coerce").sum())
    else:
        agg_map["total_demand"] = (demand_col or "demand", lambda s: np.nan)

    try:
        grouped = df.groupby(year_col).agg(**agg_map).reset_index().dropna(subset=[year_col], how="any")
    except Exception:
        grouped = pd.DataFrame(columns=[year_col, "avg_price", "total_demand"])

    grouped = grouped.sort_values(by=year_col)
    labels = grouped[year_col].astype(str).tolist() if year_col in grouped.columns else []
    price_list = grouped["avg_price"].fillna(0).round(4).tolist() if "avg_price" in grouped.columns else []
    demand_list = grouped["total_demand"].fillna(0).round(4).tolist() if "total_demand" in grouped.columns else []

    return {
        "labels": labels,
        "price": price_list,
        "demand": demand_list,
        "price_col": price_col or "",
        "demand_col": demand_col or "",
    }


def make_summary(df_filtered: pd.DataFrame, chart: Dict[str, Any], query: str) -> str:
    """
    Create a simple fallback summary (2-3 sentences).
    """
    try:
        n = len(df_filtered)
        if n == 0:
            return f"No records found for '{query}'."

        labels = chart.get("labels", [])
        price = chart.get("price", [])
        demand = chart.get("demand", [])

        if price and len(price) >= 2:
            start, end = price[0], price[-1]
            try:
                pct = (float(end) - float(start)) / float(start) * 100 if float(start) != 0 else 0.0
            except Exception:
                pct = 0.0
            price_line = f"Average price moved from {round(start,2)} to {round(end,2)} ({round(pct,1)}%)."
        else:
            price_line = "Price trend is not available."

        if demand and len(demand) >= 1:
            total_demand = sum([float(x) for x in demand if x is not None])
            demand_line = f"Total demand across periods: {int(total_demand)}."
        else:
            demand_line = "Demand data not available."

        sample_rows = []
        for _, row in df_filtered.head(3).iterrows():
            y = row.get("year", "")
            loc = ""
            for c in df_filtered.columns:
                if "location" in c.lower() or "area" in c.lower() or "final location" in c.lower():
                    loc = row.get(c, "")
                    break
            sample_rows.append(f"- {loc} | {y} | {chart.get('price_col','price')}: {row.get(chart.get('price_col', ''), '')}")

        sample_text = "\n".join(sample_rows)
        return f"Found {n} records matching '{query}'.\n{price_line} {demand_line}\nTop {min(3,n)} sample rows:\n{sample_text}"
    except Exception as e:
        logger.exception("make_summary failed: %s", e)
        return f"Found {len(df_filtered)} records matching '{query}'."


def generate_llm_summary(prompt: str, model: str = "gpt-4o-mini", max_tokens: int = 200) -> Optional[str]:
    """
    Generate summary using OpenAI. Requires OPENAI_API_KEY to be set.
    Returns string summary or None if something fails.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.debug("OPENAI_API_KEY not set — skipping LLM call.")
        return None
    if openai is None:
        logger.debug("openai package not installed; can't call LLM.")
        return None

    try:
        openai.api_key = api_key
        logger.debug("Calling OpenAI ChatCompletion for prompt length %d", len(prompt))
        response = openai.ChatCompletion.create(
            model=os.getenv("OPENAI_MODEL", model),
            messages=[
                {"role": "system", "content": "You are a concise assistant that summarizes real-estate aggregated statistics into 2-3 sentences."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.2,
        )
        text = None
        if response and "choices" in response and len(response.choices) > 0:
            choice = response.choices[0]
            # new API shapes may return message
            if getattr(choice, "message", None):
                text = choice.message.get("content")
            else:
                text = choice.get("text")
        if text:
            return text.strip()
    except Exception as e:
        logger.exception("LLM call failed: %s", e)
        return None
    return None
