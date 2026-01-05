import React, { useState, useEffect } from 'react';
import { logsAPI } from '../api';
import '../App.css';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    level: '',
    limit: 100,
  });

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const loadLogs = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.level) params.level = filters.level;
      if (filters.limit) params.limit = filters.limit;

      const res = await logsAPI.getAll(params);
      setLogs(res.data.data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return '#e74c3c';
      case 'warn':
        return '#f39c12';
      case 'info':
        return '#27ae60';
      default:
        return '#333';
    }
  };

  if (loading && logs.length === 0) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Logs</h2>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="database_connection">Database Connection</option>
              <option value="operation">Operation</option>
              <option value="post_execution">Post Execution</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label className="form-label">Level</label>
            <select
              className="form-select"
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            >
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label className="form-label">Limit</label>
            <select
              className="form-select"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Type</th>
              <th>Level</th>
              <th>Message</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.type || 'N/A'}</td>
                  <td>
                    <span
                      style={{
                        color: getLevelColor(log.level),
                        fontWeight: 'bold',
                      }}
                    >
                      {log.level?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td>{log.message}</td>
                  <td>
                    {log.pageId && <div>Page: {log.pageId}</div>}
                    {log.error && (
                      <div style={{ color: '#e74c3c', fontSize: '0.875rem' }}>
                        {log.error}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Logs;

