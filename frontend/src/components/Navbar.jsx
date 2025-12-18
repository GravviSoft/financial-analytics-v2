import { useLocation } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { FaMoon, FaSun } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ darkMode, onToggleMode }) => {
  const location = useLocation();

  const items = [
    // {
    //   label: 'Dashboard',
    //   icon: 'pi pi-home',
    //   command: () => (window.location.href = '/'),
    //   className: location.pathname === '/' ? 'active-menu-item' : '',
    // },
    // {
    //   label: 'Analytics',
    //   icon: 'pi pi-chart-line',
    //   command: () => (window.location.href = '/analytics'),
    //   className: location.pathname === '/analytics' ? 'active-menu-item' : '',
    // },
    // {
    //   label: 'Reports',
    //   icon: 'pi pi-file',
    //   command: () => (window.location.href = '/reports'),
    //   className: location.pathname === '/reports' ? 'active-menu-item' : '',
    // },
  ];

  const start = (
    <div className="navbar-brand">
      <i className="pi pi-chart-bar" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}></i>
      <span className="brand-text">Analytics Dashboard</span>
    </div>
  );

  const end = (
    <div className="navbar-end">
      <button
        className="navbar-mode-button"
        type="button"
        onClick={onToggleMode}
        aria-label="Toggle light and dark mode"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );

  return (
    <div className={`navbar-container ${darkMode ? 'navbar-container--dark' : ''}`}>
      <Menubar model={items} start={start} end={end} className="custom-menubar" />
    </div>
  );
};

export default Navbar;
