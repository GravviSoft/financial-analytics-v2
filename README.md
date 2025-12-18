# Financial Analytics Dashboard (Active vs Passive)

A full-stack dashboard that answers one question quickly: **how often do active funds fail to beat the index?**
It pairs a React + PrimeReact frontend with a Flask API that serves SPIVA-style data from CSV files.

## What this shows
- **Bar chart** with year toggles: share of active funds that underperform benchmarks.
- **Line chart**: underperformance trend across time horizons.
- **Tables**: S&P comparison + SPIVA dataset (downloadable as CSV).
- **Light/Dark mode** toggle in the navbar.

## Data sources
The backend reads CSVs located in `backend/`:
- `sp500-benchmark-underperformance.csv`
- `spiva-underperformance-by-category.csv`

## Quick Start (Docker Dev - Recommended)
```bash
# from repo root
docker-compose -f docker-compose.dev.yml up --build
```

Local URLs:
- Frontend: http://localhost:3003
- Backend API: http://localhost:4003

Stop:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Local Dev (no Docker, optional)
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Backend runs on http://localhost:7000 by default.

### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000 by default.

## Environment variables
Create `frontend/.env` if needed:
```bash
# Main API (dashboard mock endpoints, optional)
REACT_APP_API_URL=http://localhost:5000/api

# SPIVA/S&P data API
REACT_APP_SP_API_URL=http://localhost:4003/api
```

Create `backend/.env` for Flask settings if needed.

## API endpoints
- `GET /health`
- `GET /api/chart-data` (from `sp500-benchmark-underperformance.csv`)
- `GET /api/spiva-table` (from `spiva-underperformance-by-category.csv`)

## Production (Traefik)
`docker-compose.yml` is configured for Traefik and `financial.gravvisoft.com`.
If you don’t use Traefik, stick to the dev compose file.

## Troubleshooting
- **Missing Python deps in Docker**: rebuild the backend image:
  ```bash
  docker-compose -f docker-compose.dev.yml build --no-cache backend
  ```
- **CORS errors**: backend uses Flask-CORS, so rebuild after dependency changes.
- **Chart.js scale errors**: ensure frontend is rebuilt after dependency or code changes.

## Tech Stack
- Frontend: React, PrimeReact, Chart.js, React Router
- Backend: Flask, Pandas
- Infra: Docker, Docker Compose

## Contributing
1. Fork the repo
2. Create a branch
3. Make changes
4. Run locally with Docker or npm/flask
5. Open a PR
