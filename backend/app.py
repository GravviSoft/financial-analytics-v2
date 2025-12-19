from flask import Flask, jsonify
import os
import pandas as pd
from flask_cors import CORS
import sqlalchemy as sa

app = Flask(__name__)
CORS(app)

USE_DB = os.getenv("USE_DB") == "1"
DB_URL = os.getenv("CONNECTION_STRING")
DB_SCHEMA = os.getenv("DB_SCHEMA")
ENGINE = None

# Log startup config (mask sensitive connection string)
print(
    f"Startup config -> USE_DB={USE_DB}, "
    f"DB_SCHEMA={DB_SCHEMA or '(default)'}, "
    f"DB_URL set={bool(DB_URL)}"
)

if USE_DB and DB_URL:
    try:
        ENGINE = sa.create_engine(DB_URL)
        with ENGINE.connect() as conn:
            conn.execute(sa.text("select 1"))
        print(f"Database engine initialized successfully (schema={DB_SCHEMA or 'default'})")
    except Exception as exc:
        # If the database engine fails to initialize, fall back to CSV silently.
        print(f"Database engine init failed, falling back to CSV: {exc}")
        ENGINE = None
else:
    print("Database mode disabled; using CSV data sources.")


def load_chart_df():
    """Load chart data from CSV by default, optionally from Postgres when enabled."""
    if ENGINE:
        query = """
            SELECT *
            FROM kaggle.sp500_benchmark_underperformance
        """
        try:
            df = pd.read_sql_query(query, ENGINE)
            print("chart-data source: Postgres")
            return df
        except Exception as exc:
            print(f"DB load_chart_df failed, falling back to CSV: {exc}")

    csv_path = os.path.join(os.path.dirname(__file__), "sp500-benchmark-underperformance.csv")
    print("chart-data source: CSV")
    return pd.read_csv(csv_path)


def load_spiva_df():
    """Load SPIVA table data from CSV by default, optionally from Postgres when enabled."""
    if ENGINE:
        query = """
            SELECT *
            FROM kaggle.spiva_underperformance_by_category
        """
        try:
            df = pd.read_sql_query(query, ENGINE)
            print("spiva-table source: Postgres")
            return df
        except Exception as exc:
            print(f"DB load_spiva_df failed, falling back to CSV: {exc}")

    csv_path = os.path.join(os.path.dirname(__file__), "spiva-underperformance-by-category.csv")
    print("spiva-table source: CSV")
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
    try:
        categories = df["Comparison Index"].tolist()
        years = ["1 YR (%)", "3 YR (%)", "5 YR (%)", "10 YR (%)", "15 YR (%)"]
    except KeyError as exc:
        # If column names don't match (e.g., DB columns differ), fall back to CSV.
        print(f"chart_data missing expected column {exc}; falling back to CSV.")
        csv_path = os.path.join(os.path.dirname(__file__), "sp500-benchmark-underperformance.csv")
        df = pd.read_csv(csv_path)
        categories = df["Comparison Index"].tolist()
        years = ["1 YR (%)", "3 YR (%)", "5 YR (%)", "10 YR (%)", "15 YR (%)"]

    # Prepare data for all years
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
