# Financial Analytics Dashboard — Do Professional Fund Managers Beat the Market?

A focused dashboard that answers one question: **How often do active funds fail to beat their index benchmarks?**

It pairs a React + PrimeReact frontend with a Flask API that serves SPIVA-style data from either bundled CSVs or Postgres (toggleable)

![Analytics dashboard demo](docs/media/dashboard-demo.gif)

## What this shows
- **Bar chart** with year toggles: share of active funds that underperform benchmarks.
- **Line chart**: underperformance trend across time horizons.
- **Tables**: S&P comparison + SPIVA dataset (downloadable as CSV).
- **Light/Dark mode** toggle in the navbar.

## Data sources
The backend reads CSVs located in `backend/`:
- `sp500-benchmark-underperformance.csv`
- `spiva-underperformance-by-category.csv`

## Run with Docker (Dev)
```bash
# from repo root
docker-compose -f docker-compose.dev.yml up --build
```

## Local URLs
- Frontend: http://localhost:3003
- Backend API: http://localhost:4003

Stop dev stack:
docker-compose -f docker-compose.dev.yml down

## Environment
Frontend (`frontend/.env`):
- None needed for local dev; it auto-targets http://localhost:4003/api.
- For production, set REACT_APP_SP_API_URL in your deploy env if you need to override the default (<window.location.origin>/api).

Backend (`backend/.env`):
USE_DB=0                      # 0 = CSV (default), 1 = Postgres
CONNECTION_STRING=postgresql://user:password@host:port/dbname  # used only when USE_DB=1


### Data storage modes
- CSV mode (default): USE_DB=0; reads from the two CSVs in backend/.
- Postgres mode (optional): USE_DB=1; reads from Postgres using CONNECTION_STRING (and DB_SCHEMA if needed).
  - Tables must mirror the CSV headers:
    - sp500_benchmark_underperformance: "Comparison Index","1 YR (%)","3 YR (%)","5 YR (%)","10 YR (%)","15 YR (%)"
    - spiva_underperformance_by_category: "Asset Class","Fund Category","Comparison Index","1 YR (%)","3 YR (%)","5 YR (%)","10 YR (%)","15 YR (%)"

## API endpoints
- GET /api/chart-data
- GET /api/spiva-table

## Production (Traefik)
`docker-compose.yml` includes a Traefik setup pointed at your production host. Update the host/labels to your own domain, or use the dev compose file if you aren’t deploying behind Traefik.

## Tech stack & dependencies
- Frontend: React, PrimeReact, Chart.js, React Router, axios
- Backend: Flask, Pandas, SQLAlchemy, psycopg2-binary, Flask-CORS
- Data: CSVs in `backend/` or Postgres (see Data storage modes)
- Infra/Dev: Docker, Docker Compose, react-scripts (dev server), gunicorn (prod)

## Troubleshooting
- Rebuild backend deps: docker-compose -f docker-compose.dev.yml build --no-cache backend
- CORS errors: rebuild backend after dependency changes.
- Chart issues: rebuild frontend (npm start / npm run build).

## Contributing
1. Fork the repo
2. Create a branch
3. Make changes
4. Run locally with Docker
5. Open a PR
