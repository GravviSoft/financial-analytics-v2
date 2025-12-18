import React, { useState, useEffect, useMemo } from 'react';
import { FaGithub } from 'react-icons/fa';
import DataTable from '../components/DataTable';
import dataService from '../services/dataService';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

const Dashboard = ({ darkMode = false }) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [spData, setSpData] = useState(null);
  const [spYear, setSpYear] = useState('1 YR');
  const [spLoading, setSpLoading] = useState(true);
  const [spivaData, setSpivaData] = useState([]);
  const [spivaLoading, setSpivaLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadSpComparison();
    loadSpivaTable();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpComparison = async () => {
    setSpLoading(true);
    try {
      const data = await dataService.getSpComparisonData();
      setSpData(data);
    } catch (error) {
      console.error('Error loading S&P comparison data:', error);
    } finally {
      setSpLoading(false);
    }
  };

  const loadSpivaTable = async () => {
    setSpivaLoading(true);
    try {
      const data = await dataService.getSpivaTableData();
      const normalized = data.map((row) => ({
        id: row.id,
        assetClass: row['Asset Class'],
        fundCategory: row['Fund Category'],
        comparisonIndex: row['Comparison Index'],
        yr1: row['1 YR (%)'],
        yr3: row['3 YR (%)'],
        yr5: row['5 YR (%)'],
        yr10: row['10 YR (%)'],
        yr15: row['15 YR (%)'],
      }));
      setSpivaData(normalized);
    } catch (error) {
      console.error('Error loading SPIVA table data:', error);
    } finally {
      setSpivaLoading(false);
    }
  };

  const spYears = useMemo(() => {
    if (!spData) return [];
    const preferredOrder = ['1 YR', '3 YR', '5 YR', '10 YR', '15 YR'];
    return preferredOrder.filter((year) => spData.years[year]);
  }, [spData]);

  const spChartData = useMemo(() => {
    if (!spData) return null;
    const palette = ['rgba(54, 162, 235, 0.8)', 'rgba(34, 197, 94, 0.8)'];
    return {
      labels: spData.categories,
      datasets: [
        {
          label: `${spYear} Performance (%)`,
          data: spData.years[spYear],
          backgroundColor: palette.slice(0, spData.categories.length),
          borderRadius: 8,
        },
      ],
    };
  }, [spData, spYear]);

  const spSummary = useMemo(() => {
    if (!spData || !spData.years[spYear]) return null;
    const values = spData.years[spYear]
      .map((value) => Number.parseFloat(value))
      .filter((value) => Number.isFinite(value));
    if (!values.length) return null;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const aboveHalf = values.filter((value) => value >= 50).length;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const maxIndex = values.indexOf(maxValue);
    return {
      average,
      aboveHalf,
      total: values.length,
      maxValue,
      minValue,
      maxLabel: spData.categories[maxIndex],
    };
  }, [spData, spYear]);

  const spLineData = useMemo(() => {
    if (!spData) return null;
    const palette = ['rgba(54, 162, 235, 1)', 'rgba(34, 197, 94, 1)'];

    return {
      labels: spYears,
      datasets: spData.categories.map((cat, idx) => ({
        label: cat,
        data: spYears.map((year) => spData.years[year]?.[idx]),
        borderColor: palette[idx % palette.length],
        backgroundColor: palette[idx % palette.length],
        tension: 0.35,
        fill: false,
        borderWidth: 3,
        pointRadius: 5,
      })),
    };
  }, [spData, spYears]);

  const spTableRows = useMemo(() => {
    if (!spData) return [];
    return spData.categories.map((cat, idx) => ({
      id: idx + 1,
      category: cat,
      '1 YR': spData.years['1 YR']?.[idx],
      '3 YR': spData.years['3 YR']?.[idx],
      '5 YR': spData.years['5 YR']?.[idx],
      '10 YR': spData.years['10 YR']?.[idx],
      '15 YR': spData.years['15 YR']?.[idx],
    }));
  }, [spData]);

  const spTableColumns = [
    { field: 'category', header: 'Comparison Index' },
    { field: '1 YR', header: '1 YR (%)', sortable: true },
    { field: '3 YR', header: '3 YR (%)', sortable: true },
    { field: '5 YR', header: '5 YR (%)', sortable: true },
    { field: '10 YR', header: '10 YR (%)', sortable: true },
    { field: '15 YR', header: '15 YR (%)', sortable: true },
  ];

  const spivaColumns = [
    { field: 'assetClass', header: 'Asset Class' },
    { field: 'fundCategory', header: 'Fund Category' },
    { field: 'comparisonIndex', header: 'Comparison Index' },
    { field: 'yr1', header: '1 YR (%)', sortable: true },
    { field: 'yr3', header: '3 YR (%)', sortable: true },
    { field: 'yr5', header: '5 YR (%)', sortable: true },
    { field: 'yr10', header: '10 YR (%)', sortable: true },
    { field: 'yr15', header: '15 YR (%)', sortable: true },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <ProgressSpinner />
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className={`dashboard ${darkMode ? 'dashboard--dark' : ''}`}>
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-heading">
            <p className="eyebrow">Financial Intelligence</p>
            <h1>Do Professional Fund Managers Beat the Market?</h1>
            <div className="subtitle-row">
              <p className="subtitle">
                This dashboard shows how often professional fund managers fail to beat simple index benchmarks like the S&P 500.
              </p>
              <a
                className="primary-button github-button"
                href="https://github.com/GravviSoft/financial-analytics-v2.git"
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub />
                View on GitHub
              </a>
            </div>
          </div>
        </header>

        {/* <div className="info-banner">
          <div className="info-banner__title">United States</div>
          <div className="info-banner__subtitle">Percentage of funds that underperformed their benchmark</div>
          <div className="info-banner__meta">As of: Jun 30, 2025</div>
        </div> */}

        <section className="panel-grid panel-grid--split">
          <Card className="chart-card" title="Fund Managers That Underperform The S&P 500 (US)">
            <div className="chart-explainer">
              Underperforming means a majority of active funds failed to beat the S&P 500.
            </div>
            <div className="year-toggle">
              <div className="year-toggle__label">Time horizon</div>
              {spYears.map((year) => (
                <button
                  key={year}
                  className={`year-toggle__button ${spYear === year ? 'active' : ''}`}
                  onClick={() => setSpYear(year)}
                  type="button"
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="chart-container chart-container--tall">
              {spLoading && (
                <div className="loading-container">
                  <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                </div>
              )}
              {!spLoading && spChartData && <Bar data={spChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Underperforming Funds (%)' } } },
              }} />}
              {!spLoading && !spChartData && (
                <div className="error-text">Unable to load S&P comparison data.</div>
              )}
            </div>
          </Card>
          <div className="hero-kpi hero-kpi--side">
            <div className="hero-kpi__label">As of: Jun 30, 2025</div>
            <div className="hero-kpi__value">
              {spSummary ? `${spSummary.maxValue.toFixed(1)}%` : '--'}
            </div>
            <div className="hero-kpi__caption hero-kpi__caption--callout">
              S&P 500 WINS 
            </div>
              <div className="hero-kpi__caption">
              ({spYear}).
            </div>
          </div>
        </section>

        {/* S&P Line Trend */}
        <section className="panel-grid">
          <Card className="chart-card" title="Underperformance Trend by Benchmark">
            <div className="chart-container chart-container--tall">
              {spLoading && (
                <div className="loading-container">
                  <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                </div>
              )}
              {!spLoading && spLineData && (
                <Line
                  data={spLineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'top' },
                    },
                    scales: {
                      y: { beginAtZero: true, title: { display: true, text: 'Underperforming Funds (%)' } },
                      x: { title: { display: true, text: 'Time Period' } },
                    },
                  }}
                />
              )}
              {!spLoading && !spLineData && (
                <div className="error-text">Unable to load S&P comparison data.</div>
              )}
            </div>
          </Card>
        </section>

        {/* S&P Comparison Table */}
        <section className="table-section">
          <DataTable
            title="S&P 500 vs Large-Cap Benchmarks (Table View)"
            data={spTableRows}
            columns={spTableColumns}
            downloadName="sp-comparison"
          />
        </section>

        {/* SPIVA Table */}
        <section className="table-section">
          {spivaLoading ? (
            <div className="loading-container">
              <ProgressSpinner style={{ width: '40px', height: '40px' }} />
            </div>
          ) : (
            <DataTable
              title="SPIVA Benchmark Underperformance (CSV)"
              data={spivaData}
              columns={spivaColumns}
              downloadName="spiva-benchmark"
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
