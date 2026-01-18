import React, { useState, useEffect } from 'react';
import { pagesAPI, promptsAPI, automationAPI, driveAPI, manualAPI } from '../api';
import '../App.css';
import '../App.css';
import ManualPostModal from '../components/ManualPostModal';

function Pages() {
  const [pages, setPages] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [driveFolders, setDriveFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [postingPageId, setPostingPageId] = useState(null);
  const [formData, setFormData] = useState({
    pageId: '',
    accessToken: '',
    name: '',
    promptId: '',
    scheduleType: 'interval',
    intervalHours: 2,
    cronExpression: '',
    times: ['09:00'],
    timezone: 'UTC',
    scheduleEnabled: true,
    driveFolderId: '',
    driveFolderName: '',
    googleSheetId: '',
    googleSheetRange: 'Sheet1!A:D',
    isActive: true,
  });

  // Manual Post State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualPageId, setManualPageId] = useState(null);

  const openManualModal = (pageId) => {
    setManualPageId(pageId);
    setShowManualModal(true);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setShowModal(false);
        setShowManualModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pagesRes, promptsRes, foldersRes] = await Promise.all([
        pagesAPI.getAll(),
        promptsAPI.getAll(),
        driveAPI.getFolders().catch(err => {
          console.warn('Failed to load drive folders', err);
          return { data: { data: [] } };
        }),
      ]);
      setPages(pagesRes?.data?.data || []);
      setPrompts(promptsRes?.data?.data || []);
      setDriveFolders(foldersRes?.data?.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + (error?.message || 'Unknown error'));
      // Set empty arrays on error to prevent undefined errors
      setPages([]);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await pagesAPI.update(editingPage.pageId, formData);
      } else {
        await pagesAPI.create(formData);
      }
      setShowModal(false);
      setEditingPage(null);
      resetForm();
      loadData();
    } catch (error) {
      alert('Error saving page: ' + error.message);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    const schedule = page.postingSchedule || {};

    // Determine schedule type
    let scheduleType = 'interval';
    if (schedule.cronExpression) {
      scheduleType = 'cron';
    } else if (schedule.times && schedule.times.length > 0) {
      scheduleType = 'times';
    }

    setFormData({
      pageId: page.pageId,
      accessToken: page.accessToken,
      name: page.name,
      promptId: page.promptId?.toString() || '',
      scheduleType,
      intervalHours: schedule.intervalHours || 2,
      cronExpression: schedule.cronExpression || '',
      times: schedule.times || ['09:00'],
      timezone: schedule.timezone || 'UTC',
      timezone: schedule.timezone || 'UTC',
      scheduleEnabled: schedule.enabled !== undefined ? schedule.enabled : true,
      driveFolderId: page.driveFolderId || '',
      driveFolderName: page.driveFolderName || '',
      googleSheetId: page.googleSheetId || '',
      googleSheetRange: page.googleSheetRange || 'Sheet1!A:D',
      isActive: page.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await pagesAPI.delete(pageId);
      loadData();
    } catch (error) {
      alert('Error deleting page: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      pageId: '',
      accessToken: '',
      name: '',
      promptId: '',
      scheduleType: 'interval',
      intervalHours: 2,
      cronExpression: '',
      times: ['09:00'],
      timezone: 'UTC',
      timezone: 'UTC',
      scheduleEnabled: true,
      driveFolderId: '',
      driveFolderName: '',
      googleSheetId: '',
      googleSheetRange: 'Sheet1!A:D',
      isActive: true,
    });
  };

  const getScheduleDisplay = (page) => {
    const schedule = page.postingSchedule || {};
    if (schedule.cronExpression) {
      return `Cron: ${schedule.cronExpression}`;
    } else if (schedule.times && schedule.times.length > 0) {
      return `Times: ${schedule.times.join(', ')}`;
    } else if (schedule.intervalHours) {
      return `Every ${schedule.intervalHours} hour(s)`;
    }
    return 'Not scheduled';
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '09:00'],
    });
  };

  const removeTimeSlot = (index) => {
    setFormData({
      ...formData,
      times: formData.times.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({
      ...formData,
      times: newTimes,
    });
  };

  const openAddModal = () => {
    setEditingPage(null);
    resetForm();
    setShowModal(true);
  };

  const handleQuickTrigger = async () => {
    const activeCount = pages.filter(p => p.isActive && p.postingSchedule?.enabled).length;
    if (activeCount === 0) {
      alert('No active pages found. Please activate at least one page.');
      return;
    }

    if (!window.confirm(`Post to ${activeCount} active page(s) now?`)) return;

    setTriggering(true);
    try {
      await automationAPI.trigger();
      alert(`Automation triggered! Processing ${activeCount} page(s)...`);
      setTimeout(loadData, 3000);
    } catch (error) {
      alert('Error triggering automation: ' + error.message);
    } finally {
      setTriggering(false);
    }
  };

  const handleToggleAllSchedules = async () => {
    const isAnyEnabled = pages.some(p => p.postingSchedule?.enabled);
    const action = isAnyEnabled ? 'disable' : 'enable';

    if (!window.confirm(`Are you sure you want to ${action} schedules for ALL pages?`)) return;

    try {
      const res = isAnyEnabled
        ? await pagesAPI.bulkDisableSchedules()
        : await pagesAPI.bulkEnableSchedules();
      alert(res.data.message);
      loadData();
    } catch (error) {
      alert(`Error ${action}ing schedules: ` + error.message);
    }
  };

  const handleClearAllTimings = async () => {
    if (!window.confirm('Are you sure you want to clear saved times (intervals, cron, and times array) for ALL pages? scheduler status will remain unchanged.')) return;

    try {
      const res = await pagesAPI.bulkClearTimings();
      alert(res.data.message);
      loadData();
    } catch (error) {
      alert('Error clearing timings: ' + error.message);
    }
  };

  const handleResetAllRows = async () => {
    if (!window.confirm('Are you sure you want to reset consumed rows for ALL pages? This will start all sheets from Row 2 again.')) return;

    try {
      const res = await pagesAPI.bulkResetConsumedRows();
      alert(res.data.message);
      loadData();
    } catch (error) {
      alert('Error resetting all rows: ' + error.message);
    }
  };

  const handleSinglePagePost = async (page) => {
    if (!page.isActive) {
      alert('This page is not active. Please activate it first.');
      return;
    }

    if (!window.confirm(`Post to "${page.name}" (${page.pageId}) now?`)) return;

    setPostingPageId(page.pageId);
    try {
      await automationAPI.trigger(page.pageId);
      alert(`Posting to "${page.name}"... Check logs for progress.`);
      setTimeout(loadData, 3000);
    } catch (error) {
      alert('Error posting to page: ' + error.message);
    } finally {
      setPostingPageId(null);
    }
  };

  const handleResetConsumedRows = async (page) => {
    if (!page.googleSheetId) {
      alert('This page is not linked to a Google Sheet.');
      return;
    }

    if (!window.confirm(`Reset consumed rows for "${page.name}"? This will allow reusing rows from the beginning.`)) return;

    try {
      await pagesAPI.resetConsumedRows(page.pageId);
      alert('Consumed rows reset successfully!');
      loadData();
    } catch (error) {
      alert('Error resetting consumed rows: ' + error.message);
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Facebook Pages</h2>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              className={`btn ${pages.some(p => p.postingSchedule?.enabled) ? 'btn-danger' : 'btn-success'}`}
              onClick={handleToggleAllSchedules}
              disabled={pages.length === 0}
              style={{ fontSize: '0.85rem' }}
            >
              {pages.some(p => p.postingSchedule?.enabled) ? 'Disable All Schedules' : 'Enable All Schedules'}
            </button>
            <button
              className="btn btn-warning"
              onClick={handleClearAllTimings}
              disabled={pages.length === 0}
              style={{ fontSize: '0.85rem' }}
            >
              Clear Saved Times
            </button>
            <button
              className="btn"
              onClick={handleResetAllRows}
              disabled={pages.length === 0}
              style={{ fontSize: '0.85rem', background: '#f97316', color: 'white' }}
            >
              Reset All Rows
            </button>
            <button
              className="btn btn-success"
              onClick={handleQuickTrigger}
              disabled={triggering || pages.filter(p => p.isActive && p.postingSchedule?.enabled).length === 0}
              style={{ fontSize: '0.9rem' }}
            >
              {triggering ? 'Posting...' : 'Post All Active'}
            </button>
            <button className="btn btn-primary" onClick={openAddModal}>
              + Add Page
            </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prompt</th>
              <th>Schedule</th>
              <th>Google Sheet</th>
              <th>Consumed</th>
              <th>Status</th>
              <th>Last Posted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!pages || pages.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No pages found. Add your first page!
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page._id}>
                  <td>
                    <a
                      href={`https://www.facebook.com/${page.pageId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}
                      onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {page.name}
                    </a>
                  </td>
                  <td>{page.promptName || 'Not assigned'}</td>
                  <td>
                    {getScheduleDisplay(page)}
                    {!page.postingSchedule?.enabled && ' (Disabled)'}
                  </td>
                  <td>
                    {page.googleSheetId ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{page.googleSheetRange}</span>
                        <span style={{ fontSize: '0.7rem', color: '#666', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={page.googleSheetId}>
                          ID: {page.googleSheetId}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{page.consumedRows?.length || 0}</span>
                      {page.googleSheetId && (
                        <button
                          className="btn"
                          onClick={() => handleResetConsumedRows(page)}
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.7rem',
                            background: '#f59e0b',
                            color: 'white'
                          }}
                          title="Reset consumed rows to start over"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${page.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {page.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {page.postingSchedule?.lastPostedAt
                      ? new Date(page.postingSchedule.lastPostedAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn"
                        onClick={() => openManualModal(page.pageId)}
                        disabled={!page.isActive}
                        style={{
                          background: '#8b5cf6', color: 'white',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.875rem'
                        }}
                        title="Create One-Off Post manually"
                      >
                        Manual
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => handleSinglePagePost(page)}
                        disabled={postingPageId === page.pageId || !page.isActive}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.875rem',
                          opacity: postingPageId === page.pageId ? 0.6 : 1
                        }}
                        title={!page.isActive ? 'Page is not active' : 'Post to this page now'}
                      >
                        {postingPageId === page.pageId ? 'Posting...' : 'Post'}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEdit(page)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(page.pageId)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingPage ? 'Edit Page' : 'Add New Page'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!editingPage && (
                <>
                  <div className="form-group">
                    <label className="form-label">Page ID *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.pageId}
                      onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Access Token *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.accessToken}
                      onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Page Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prompt</label>
                <select
                  className="form-select"
                  value={formData.promptId}
                  onChange={(e) => setFormData({ ...formData, promptId: e.target.value })}
                >
                  <option value="">Select a prompt</option>
                  {prompts
                    .filter((p) => p.isActive)
                    .map((prompt) => (
                      <option key={prompt._id} value={prompt._id}>
                        {prompt.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Google Drive Folder</label>
                <select
                  className="form-select"
                  value={formData.driveFolderId}
                  onChange={(e) => {
                    const selectedFolder = driveFolders.find(f => f.id === e.target.value);
                    setFormData({
                      ...formData,
                      driveFolderId: e.target.value,
                      driveFolderName: selectedFolder ? selectedFolder.name : ''
                    });
                  }}
                >
                  <option value="">Select a folder (Optional)</option>
                  {driveFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Images will be fetched from this folder if "Image Source" is set to "Google Drive" in the prompt.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Google Sheet ID</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.googleSheetId}
                  onChange={(e) => setFormData({ ...formData, googleSheetId: e.target.value })}
                  placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                />
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Get this from your Google Sheet URL. Only needed if prompt's "Content Source" is set to "Google Sheet".
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Google Sheet Range</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.googleSheetRange}
                  onChange={(e) => setFormData({ ...formData, googleSheetRange: e.target.value })}
                  placeholder="Sheet1!A:D"
                />
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Range to read (e.g., "Sheet1!A:D" for columns A-D). Row 1 is treated as header.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Schedule Type *</label>
                <select
                  className="form-select"
                  value={formData.scheduleType}
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                  required
                >
                  <option value="interval">Interval (Every X hours)</option>
                  <option value="times">Specific Times (Daily)</option>
                  <option value="cron">Cron Expression (Advanced)</option>
                </select>
              </div>

              {formData.scheduleType === 'interval' && (
                <div className="form-group">
                  <label className="form-label">Posting Interval (hours) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={formData.intervalHours}
                    onChange={(e) => setFormData({ ...formData, intervalHours: parseInt(e.target.value) })}
                    required
                  />
                  <small style={{ color: '#666', fontSize: '0.875rem' }}>
                    Page will post every {formData.intervalHours} hour(s)
                  </small>
                </div>
              )}

              {formData.scheduleType === 'times' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Posting Times (HH:MM format) *</label>
                    {formData.times.map((time, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          className="form-input"
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          required
                          style={{ flex: 1 }}
                        />
                        {formData.times.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeTimeSlot(index)}
                            style={{ padding: '0.5rem' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn"
                      onClick={addTimeSlot}
                      style={{ background: '#ddd', marginTop: '0.5rem' }}
                    >
                      + Add Time
                    </button>
                    <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                      Page will post at these times daily
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-select"
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                    </select>
                  </div>
                </>
              )}

              {formData.scheduleType === 'cron' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Cron Expression *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.cronExpression}
                      onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                      placeholder="0 9 * * *"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem' }}>
                      Format: minute hour day month weekday (e.g., "0 9 * * *" = daily at 9 AM)
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-select"
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.scheduleEnabled}
                    onChange={(e) => setFormData({ ...formData, scheduleEnabled: e.target.checked })}
                  />
                  Schedule Enabled
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Page Active
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                  style={{ background: '#ddd' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }

      <ManualPostModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        pageId={manualPageId}
      />
    </div >
  );
}


export default Pages;

