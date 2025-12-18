import React, { useState, useEffect, useCallback } from 'react';
import './Chart.css';

const Chart = () => {
  const [chartData, setChartData] = useState(null);
  const [currentYear, setCurrentYear] = useState('1 YR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bokehVersion = '3.6.2';

  const loadScriptOnce = (src) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  const loadBokeh = useCallback(async () => {
    if (window.Bokeh && window.Bokeh.Plotting && window.Bokeh.ColumnDataSource) {
      return window.Bokeh;
    }

    // Load core BokehJS
    await loadScriptOnce(`https://cdn.bokeh.org/bokeh/release/bokeh-${bokehVersion}.min.js`);

    // Load the Bokeh API bundle to expose Plotting helpers in the global namespace
    if (!window.Bokeh?.Plotting) {
      await loadScriptOnce(`https://cdn.bokeh.org/bokeh/release/bokeh-api-${bokehVersion}.min.js`);
    }

    if (!window.Bokeh || !window.Bokeh.Plotting || !window.Bokeh.ColumnDataSource) {
      throw new Error('Bokeh failed to load');
    }

    return window.Bokeh;
  }, []);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4003';
      const response = await fetch(`${apiBase}/api/chart-data`);
      if (!response.ok) throw new Error('Failed to fetch chart data');
      const data = await response.json();
      setChartData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const renderChart = useCallback((yearLabel) => {
    if (!chartData) return;

    const categories = chartData.categories;
    const values = chartData.years[yearLabel];

    // Create data source
    const source = new window.Bokeh.ColumnDataSource({
      data: {
        categories: categories,
        values: values
      }
    });

    // Create figure
    const plot = window.Bokeh.Plotting.figure({
      x_range: categories,
      height: 400,
      width: 700,
      title: `S&P 500 Performance Comparison - ${yearLabel}`,
      toolbar_location: null,
      tools: ""
    });

    // Add bars
    plot.vbar({
      x: { field: 'categories' },
      top: { field: 'values' },
      width: 0.5,
      source: source,
      color: '#4472C4',
      alpha: 0.8
    });

    // Styling
    plot.xgrid.grid_line_color = null;
    plot.y_range.start = 0;
    plot.yaxis.axis_label = "Performance (%)";

    // Clear previous chart and render new one
    const chartDiv = document.getElementById('bokeh-chart');
    if (chartDiv) {
      while (chartDiv.firstChild) {
        chartDiv.removeChild(chartDiv.firstChild);
      }
      window.Bokeh.Plotting.show(plot, chartDiv);
    }
  }, [chartData]);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!chartData) return;
      try {
        await loadBokeh();
        if (!cancelled) renderChart(currentYear);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [chartData, currentYear, loadBokeh, renderChart]);

  const handleYearClick = (yearLabel) => {
    setCurrentYear(yearLabel);
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const yearKeys = chartData ? Object.keys(chartData.years) : [];

  return (
    <div className="chart-container">
      <h1>S&amp;P 500 Performance Comparison</h1>

      <div className="button-container">
        {yearKeys.map((yearLabel) => (
          <button
            key={yearLabel}
            className={`year-button ${currentYear === yearLabel ? 'active' : ''}`}
            onClick={() => handleYearClick(yearLabel)}
          >
            {yearLabel}
          </button>
        ))}
      </div>

      <div id="bokeh-chart" className="chart"></div>
    </div>
  );
};

export default Chart;
