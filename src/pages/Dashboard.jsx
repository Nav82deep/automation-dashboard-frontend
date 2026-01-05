import React, { useState, useEffect } from 'react';
import { automationAPI, logsAPI, pagesAPI } from '../api';
import '../App.css';

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activePages, setActivePages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastTriggerResult, setLastTriggerResult] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, summaryRes, pagesRes] = await Promise.all([
        automationAPI.getStatus(),
        logsAPI.getSummary(),
        pagesAPI.getAll(),
      ]);
      setStatus(statusRes?.data?.data || null);
      setSummary(summaryRes?.data?.data || null);
      
      // Get active pages that will be posted
      const pages = pagesRes?.data?.data || [];
      const active = pages.filter(page => page.isActive && page.postingSchedule?.enabled);
      setActivePages(active);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStatus(null);
      setSummary(null);
      setActivePages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    if (activePages.length === 0) {
      alert('No active pages found. Please add and activate at least one page.');
      return;
    }

    const confirmMessage = `Post to ${activePages.length} page(s) now?\n\nPages:\n${activePages.map(p => `• ${p.name || p.pageId}`).join('\n')}`;
    if (!window.confirm(confirmMessage)) return;

    setTriggering(true);
    setLastTriggerResult(null);
    
    try {
      const result = await automationAPI.trigger();
      setLastTriggerResult({
        success: true,
        message: `Automation triggered successfully! Processing ${activePages.length} page(s)...`,
        timestamp: new Date(),
      });
      
      // Refresh data after a delay to see results
      setTimeout(() => {
        loadData();
      }, 3000);
    } catch (error) {
      setLastTriggerResult({
        success: false,
        message: 'Error triggering automation: ' + (error?.message || 'Unknown error'),
        timestamp: new Date(),
      });
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      {/* Manual Trigger Card - Prominent */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'white' }}>Manual Post Trigger</h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              Instantly post to all active pages. Great for testing!
            </p>
          </div>
          <button
            className="btn"
            onClick={handleTrigger}
            disabled={triggering || activePages.length === 0}
            style={{
              background: triggering ? '#95a5a6' : 'white',
              color: triggering ? '#fff' : '#667eea',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: triggering || activePages.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            {triggering ? '⏳ Posting...' : activePages.length === 0 ? '⚠️ No Active Pages' : '🚀 Post Now'}
          </button>
        </div>

        {activePages.length > 0 && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <strong>Pages that will be posted ({activePages.length}):</strong>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {activePages.map(page => (
                <span 
                  key={page._id || page.pageId}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                >
                  {page.name || page.pageId}
                </span>
              ))}
            </div>
          </div>
        )}

        {lastTriggerResult && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: lastTriggerResult.success ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)',
            borderRadius: '8px',
            border: `1px solid ${lastTriggerResult.success ? '#27ae60' : '#e74c3c'}`
          }}>
            <strong>{lastTriggerResult.success ? '✅' : '❌'} {lastTriggerResult.message}</strong>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9 }}>
              {lastTriggerResult.timestamp.toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Automation Status</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Active Pages</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {status?.activePagesCount || 0}
            </div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Total Logs</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
              {summary?.totalLogs || 0}
            </div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Successful Posts</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
              {summary?.successCount || 0}
            </div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Failed Posts</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
              {summary?.errorCount || 0}
            </div>
          </div>
        </div>

        {status?.lastExecution && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <strong>Last Execution:</strong>{' '}
            {new Date(status.lastExecution).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

