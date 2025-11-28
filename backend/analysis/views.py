# backend/analysis/views.py
import os
import tempfile
import logging
from typing import Any, Dict, Optional

import pandas as pd
from django.http import JsonResponse, HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .utils import (
    load_dataset_from_path,
    filter_by_area,
    aggregate_for_chart,
    make_summary,
    generate_llm_summary,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_view(request):
    """
    POST /api/upload/
    Accepts multipart/form-data with 'file'. Saves file to temp dir and returns its path.
    """
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    tmpdir = tempfile.gettempdir()
    save_path = os.path.join(tmpdir, uploaded_file.name)
    try:
        with open(save_path, "wb") as fh:
            for chunk in uploaded_file.chunks():
                fh.write(chunk)
    except Exception as e:
        logger.exception("Failed to save uploaded file: %s", e)
        return Response({"error": f"Failed to save file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"status": "ok", "path": save_path}, status=status.HTTP_200_OK)


@api_view(["GET"])
def analyze_view(request):
    """
    GET /api/analyze/?query=<q>&top=<n>&use_llm=true|false&file=<path>
    Returns JSON: { mode, summary, chart, table }
    """
    query = request.GET.get("query", "")
    top = int(request.GET.get("top", 200))
    use_llm_raw = request.GET.get("use_llm", "false").lower()
    use_llm = use_llm_raw in ("1", "true", "yes")
    file_path = request.GET.get("file")  # optional path returned after upload

    # Load dataset
    try:
        df = load_dataset_from_path(file_path, top=50000)
    except Exception as e:
        logger.exception("Failed to load dataset: %s", e)
        return Response({"error": f"Failed to load dataset: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Filter by area/query
    try:
        df_filtered = filter_by_area(df, query, top=top)
    except Exception as e:
        logger.exception("Filtering failed: %s", e)
        return Response({"error": f"Filtering failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Coerce year if present
    if "year" in df_filtered.columns:
        try:
            df_filtered["year"] = pd.to_numeric(df_filtered["year"], errors="coerce").astype("Int64")
        except Exception:
            pass

    # Build chart data
    chart = aggregate_for_chart(df_filtered, year_col="year", price_col="price", demand_col="demand")

    # Build summary (LLM optional)
    summary_text: Optional[str] = None
    if use_llm and os.getenv("OPENAI_API_KEY"):
        try:
            prompt = (
                f"Given aggregated data: years {chart.get('labels', [])}, average prices {chart.get('price', [])}, "
                f"demands {chart.get('demand', [])}. Also {len(df_filtered)} raw rows from query '{query}'. "
                "Provide a concise 3-sentence analysis highlighting the price trend, demand observation, and one actionable insight."
            )
            llm_res = generate_llm_summary(prompt)
            if llm_res:
                summary_text = llm_res
        except Exception as e:
            logger.exception("LLM generation failed: %s", e)
            summary_text = None

    if not summary_text:
        summary_text = make_summary(df_filtered, chart, query)

    table_json = df_filtered.fillna("").head(500).to_dict(orient="records")

    mode = "comparison" if (" vs " in query.lower() or "compare " in query.lower() or ("," in query and len([x for x in query.split(",") if x.strip()]) > 1)) else "single"

    return Response(
        {
            "mode": mode,
            "summary": summary_text,
            "chart": chart,
            "table": table_json,
            "query": query,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def download_view(request):
    """
    Simple CSV download endpoint (optional).
    GET /api/download/?query=wakad&file=/tmp/...
    Returns a CSV of the filtered rows (max 500 rows).
    """
    query = request.GET.get("query", "")
    file_path = request.GET.get("file")
    try:
        df = load_dataset_from_path(file_path, top=50000)
        df_filtered = filter_by_area(df, query, top=500)
    except Exception as e:
        logger.exception("Download: data load/filter failed: %s", e)
        return Response({"error": f"Failed to prepare download: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Convert to CSV bytes
    try:
        csv_bytes = df_filtered.head(500).to_csv(index=False).encode("utf-8")
        resp = HttpResponse(csv_bytes, content_type="text/csv")
        resp["Content-Disposition"] = f'attachment; filename="filtered_{query or "dataset"}.csv"'
        return resp
    except Exception as e:
        logger.exception("Failed to build CSV: %s", e)
        return Response({"error": f"Failed to build CSV: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def schema_view(request):
    """
    Minimal schema endpoint used by the front-end / docs.
    Returns a JSON object describing a few API endpoints, parameters and examples.
    """
    schema: Dict[str, Any] = {
        "endpoints": {
            "/api/upload/ (POST)": {
                "description": "Upload CSV/XLSX file. Returns { path } to pass to analyze.",
                "form_field": "file (multipart/form-data)",
            },
            "/api/analyze/ (GET)": {
                "description": "Analyze dataset for a query (area).",
                "params": {
                    "query": "text query, e.g., 'Wakad' or 'Compare A,B'",
                    "top": "max rows to consider (int)",
                    "use_llm": "true/false - whether to call OpenAI (backend must have OPENAI_API_KEY)",
                    "file": "optional path returned by upload endpoint to analyze uploaded file",
                },
                "example": "/api/analyze/?query=wakad&use_llm=false",
            },
            "/api/download/ (GET)": {
                "description": "Download filtered CSV",
                "example": "/api/download/?query=wakad",
            },
        }
    }
    return JsonResponse(schema, status=200)
