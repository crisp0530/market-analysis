"""Export analysis results to JSON for web dashboard."""

import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

import pandas as pd
from loguru import logger


class JsonExporter:
    def __init__(self, output_dir: str = "data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def export(self, strength_df: pd.DataFrame, anomalies: list,
               analysis_text: str, cycle_signals: list,
               stock_picks: dict, config: dict) -> Path:
        """Export all analysis data to a dated JSON file."""
        today = datetime.now().strftime("%Y-%m-%d")
        data = {
            "date": today,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": self._build_summary(strength_df, anomalies),
            "strength": self._df_to_records(strength_df),
            "anomalies": anomalies,
            "cycle_signals": cycle_signals,
            "stock_picks": stock_picks,
            "analysis_text": analysis_text or "",
        }

        filepath = self.output_dir / f"{today}.json"
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)

        logger.info(f"JSON exported: {filepath} ({filepath.stat().st_size / 1024:.1f} KB)")
        self._cleanup_old_files(max_days=30)
        return filepath

    def _build_summary(self, df: pd.DataFrame, anomalies: list) -> dict:
        summary = {
            "total_symbols": int(df["symbol"].nunique()) if not df.empty else 0,
            "anomaly_count": len(anomalies),
            "tier_distribution": {},
        }

        if not df.empty:
            # Tier distribution
            if "tier" in df.columns:
                summary["tier_distribution"] = df["tier"].value_counts().to_dict()

            # Market temperatures
            for market in df["market"].dropna().unique():
                market_df = df[df["market"] == market]
                if "market_temperature" in market_df.columns:
                    temps = market_df["market_temperature"].dropna()
                    if not temps.empty:
                        summary[f"{market}_temperature"] = temps.iloc[0]

            # VIX
            vix_rows = df[df["symbol"] == "^VIX"]
            if not vix_rows.empty:
                vix_row = vix_rows.iloc[0]
                summary["vix_close"] = round(float(vix_row.get("close", 0)), 2)
                summary["vix_roc_5d"] = round(float(vix_row.get("roc_5d", 0)), 2)

        return summary

    def _df_to_records(self, df: pd.DataFrame) -> list:
        """Convert DataFrame to list of dicts, handling NaN/Inf."""
        if df is None or df.empty:
            return []
        # Replace NaN/Inf with None for JSON serialization
        clean_df = df.replace([float('inf'), float('-inf')], None)
        records = clean_df.where(clean_df.notna(), None).to_dict(orient="records")
        # Round floats
        for record in records:
            for k, v in record.items():
                if isinstance(v, float):
                    record[k] = round(v, 4)
        return records

    def _cleanup_old_files(self, max_days: int = 30):
        """Delete JSON files older than max_days."""
        cutoff = datetime.now() - timedelta(days=max_days)
        removed = 0
        for f in self.output_dir.glob("*.json"):
            try:
                # Parse date from filename (YYYY-MM-DD.json)
                date_str = f.stem
                file_date = datetime.strptime(date_str, "%Y-%m-%d")
                if file_date < cutoff:
                    f.unlink()
                    removed += 1
            except (ValueError, OSError):
                continue
        if removed:
            logger.info(f"Cleaned up {removed} old JSON files (>{max_days} days)")
