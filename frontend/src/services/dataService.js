import axios from 'axios';

const resolveSpApiBase = () => {
  if (process.env.REACT_APP_SP_API_URL) return process.env.REACT_APP_SP_API_URL;

  // When running locally outside Docker
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4003/api';
    }
  }

  // Default for docker-compose where backend service is named `backend`
  return 'http://backend:7003/api';
};

// API service functions
const dataService = {
  async getSpComparisonData() {
    const response = await axios.get(`${resolveSpApiBase()}/chart-data`);
    return response.data;
  },

  async getSpivaTableData() {
    const response = await axios.get(`${resolveSpApiBase()}/spiva-table`);
    return response.data;
  },
};

export default dataService;
