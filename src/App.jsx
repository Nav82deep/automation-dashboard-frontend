import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Pages from './pages/Pages';
import Prompts from './pages/Prompts';
import Logs from './pages/Logs';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo">🤖 Automation Dashboard</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/pages" className="nav-link">Pages</Link>
              <Link to="/prompts" className="nav-link">Prompts</Link>
              <Link to="/logs" className="nav-link">Logs</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pages" element={<Pages />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

