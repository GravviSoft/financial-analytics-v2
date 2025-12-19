from flask import Flask, jsonify
import os
import pandas as pd
from flask_cors import CORS
import sqlalchemy as sa

app = Flask(__name__)
CORS(app)

USE_DB = os.getenv("USE_DB") == "1"
DB_URL = os.getenv("CONNECTION_STRING")
ENGINE = None

if USE_DB and DB_URL:
    try:
        ENGINE = sa.create_engine(DB_URL)
    except Exception as exc:
        # If the database engine fails to initialize, fall back to CSV silently.
        print(f"Database engine init failed, falling back to CSV: {exc}")
        ENGINE = None


def load_chart_df():
    """Load chart data from CSV by default, optionally from Postgres when enabled."""
    if ENGINE:
        query = """
            SELECT *
            FROM kaggle.spiva-underperformance-by-category
        """
        return pd.read_sql_query(query, ENGINE)

    csv_path = os.path.join(os.path.dirname(__file__), "sp500-benchmark-underperformance.csv")
    return pd.read_csv(csv_path)


def load_spiva_df():
    """Load SPIVA table data from CSV by default, optionally from Postgres when enabled."""
    if ENGINE:
        query = """
            SELECT *
            FROM kaggle.spiva_underperformance_by_category
        """
        return pd.read_sql_query(query, ENGINE)

    csv_path = os.path.join(os.path.dirname(__file__), "spiva-underperformance-by-category.csv")
    return pd.read_csv(csv_path)


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "flask-app-backend"})


@app.route("/api/example")
def example():
    return jsonify({"message": "Hello from flask-app backend"})


@app.route("/api/chart-data")
def chart_data():
    """JSON API endpoint that returns chart data"""
    df = load_chart_df()

    # Prepare data for all years
    years = ["1 YR (%)", "3 YR (%)", "5 YR (%)", "10 YR (%)", "15 YR (%)"]
    categories = df["Comparison Index"].tolist()

    # Create data structure with all year data
    chart_data = {
        "categories": categories,
        "years": {}
    }

    for year in years:
        year_label = year.replace(" (%)", "")
        chart_data["years"][year_label] = df[year].tolist()
    return jsonify(chart_data)


@app.route("/api/spiva-table")
def spiva_table():
    """JSON API endpoint that returns SPIVA table data"""
    df = load_spiva_df()

    records = df.to_dict(orient="records")
    for idx, row in enumerate(records, start=1):
        row["id"] = idx

    return jsonify(records)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7000))
    app.run(host="0.0.0.0", port=port)
