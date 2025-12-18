import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Mock data generator for demo purposes
export const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    // Revenue data over time
    revenueData: {
      labels: months,
      datasets: [
        {
          label: 'Revenue',
          data: months.map(() => Math.floor(Math.random() * 100000) + 50000),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
        },
      ],
    },

    // Property types distribution
    propertyTypesData: {
      labels: ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use'],
      datasets: [
        {
          label: 'Properties',
          data: [45, 25, 15, 10, 5],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderWidth: 1,
        },
      ],
    },

    // Sales by region
    salesByRegionData: {
      labels: ['North', 'South', 'East', 'West', 'Central'],
      datasets: [
        {
          label: 'Sales',
          data: [65, 59, 90, 81, 56],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },

    // Monthly trends
    trendsData: {
      labels: months,
      datasets: [
        {
          label: 'Sales',
          data: months.map(() => Math.floor(Math.random() * 50) + 20),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Listings',
          data: months.map(() => Math.floor(Math.random() * 50) + 30),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
        },
      ],
    },

    // KPI Stats
    stats: {
      totalRevenue: '$1,245,680',
      totalProperties: '342',
      avgPropertyValue: '$425,000',
      activeListings: '156',
      salesThisMonth: '47',
      growthRate: '+12.5%',
    },

    // Recent transactions table
    recentTransactions: [
      { id: 1, property: '123 Main St', type: 'Residential', price: '$450,000', date: '2024-12-10', status: 'Completed', agent: 'John Doe' },
      { id: 2, property: '456 Oak Ave', type: 'Commercial', price: '$1,200,000', date: '2024-12-09', status: 'Pending', agent: 'Jane Smith' },
      { id: 3, property: '789 Pine Rd', type: 'Residential', price: '$325,000', date: '2024-12-08', status: 'Completed', agent: 'Mike Johnson' },
      { id: 4, property: '321 Elm St', type: 'Industrial', price: '$850,000', date: '2024-12-07', status: 'Completed', agent: 'Sarah Williams' },
      { id: 5, property: '654 Maple Dr', type: 'Land', price: '$175,000', date: '2024-12-06', status: 'Under Review', agent: 'Tom Brown' },
      { id: 6, property: '987 Cedar Ln', type: 'Residential', price: '$525,000', date: '2024-12-05', status: 'Completed', agent: 'Emily Davis' },
      { id: 7, property: '147 Birch Blvd', type: 'Commercial', price: '$2,100,000', date: '2024-12-04', status: 'Pending', agent: 'John Doe' },
      { id: 8, property: '258 Walnut Way', type: 'Residential', price: '$395,000', date: '2024-12-03', status: 'Completed', agent: 'Jane Smith' },
    ],

    // Top performing agents
    topAgents: [
      { id: 1, name: 'John Doe', sales: 23, revenue: '$5,200,000', rating: 4.9 },
      { id: 2, name: 'Jane Smith', sales: 19, revenue: '$4,100,000', rating: 4.8 },
      { id: 3, name: 'Mike Johnson', sales: 17, revenue: '$3,800,000', rating: 4.7 },
      { id: 4, name: 'Sarah Williams', sales: 15, revenue: '$3,200,000', rating: 4.8 },
      { id: 5, name: 'Tom Brown', sales: 14, revenue: '$2,900,000', rating: 4.6 },
    ],
  };
};

// API service functions
const dataService = {
  // Fetch dashboard data
  async getDashboardData() {
    try {
      // Try to fetch from API first
      const response = await axios.get(`${API_BASE_URL}/dashboard`);
      return response.data;
    } catch (error) {
      console.log('Using mock data - API not available');
      // Fallback to mock data
      return generateMockData();
    }
  },

  // Fetch transactions
  async getTransactions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions`);
      return response.data;
    } catch (error) {
      return generateMockData().recentTransactions;
    }
  },

  // Fetch agents data
  async getAgents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents`);
      return response.data;
    } catch (error) {
      return generateMockData().topAgents;
    }
  },

  async getSpComparisonData() {
    try {
      const response = await axios.get(`${resolveSpApiBase()}/chart-data`);
      return response.data;
    } catch (error) {
      // Fallback to the CSV values if backend isn't reachable
      return {
        categories: ['S&P 500®', 'All Large-Cap'],
        years: {
          '1 YR': [72.61, 27.39],
          '3 YR': [64.87, 35.13],
          '5 YR': [86.91, 13.09],
          '10 YR': [85.98, 14.02],
          '15 YR': [88.29, 11.71],
        },
      };
    }
  },

  async getSpivaTableData() {
    try {
      const response = await axios.get(`${resolveSpApiBase()}/spiva-table`);
      return response.data;
    } catch (error) {
      // Small fallback subset mirroring the CSV structure
      return [
        {
          id: 1,
          'Asset Class': 'U.S. Equity',
          'Fund Category': 'All Large-Cap',
          'Comparison Index': 'S&P 500®',
          '1 YR (%)': 72.61,
          '3 YR (%)': 64.87,
          '5 YR (%)': 86.91,
          '10 YR (%)': 85.98,
          '15 YR (%)': 88.29,
        },
        {
          id: 2,
          'Asset Class': 'U.S. Equity',
          'Fund Category': 'All Domestic',
          'Comparison Index': 'S&P Composite 1500®',
          '1 YR (%)': 74.87,
          '3 YR (%)': 79.32,
          '5 YR (%)': 88.32,
          '10 YR (%)': 90.31,
          '15 YR (%)': 92.52,
        },
      ];
    }
  },
};

export default dataService;
