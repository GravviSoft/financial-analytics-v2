from flask import Flask, jsonify
import os
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "flask-app-backend"})


@app.route("/api/example")
def example():
    return jsonify({"message": "Hello from flask-app backend"})


@app.route("/api/chart-data")
def chart_data():
    """JSON API endpoint that returns chart data"""
    csv_path = os.path.join(os.path.dirname(__file__), "sp500-benchmark-underperformance.csv")
    df = pd.read_csv(csv_path)

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
    csv_path = os.path.join(os.path.dirname(__file__), "spiva-underperformance-by-category.csv")
    df = pd.read_csv(csv_path)

    records = df.to_dict(orient="records")
    for idx, row in enumerate(records, start=1):
        row["id"] = idx

    return jsonify(records)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7000))
    app.run(host="0.0.0.0", port=port)
