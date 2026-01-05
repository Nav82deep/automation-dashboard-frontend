import React, { useState, useEffect } from 'react';
import { promptsAPI } from '../api';
import '../App.css';

function Prompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    promptText: '',
    hashtags: '',
    aiProvider: 'openai',
    language: 'en',
    imageSource: 'real',
    metrics: 'age,height,famous_for,net_worth,spouse',
    collageCount: 4,
    layout: 'grid',
    isActive: true,
    statsOverlayConfig: {
      tableBgColor: 'rgba(0, 0, 0, 0.88)',
      tableBorderColor: '#FFD700',
      headerBgColor: 'rgba(139, 69, 19, 0.9)',
      rowBgColor1: 'rgba(139, 69, 19, 0.75)',
      rowBgColor2: 'rgba(101, 67, 33, 0.75)',
      nameColor: '#FFD700',
      metricColor: '#FFD700',
      valueColor: '#FFFFFF',
      vsColor: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      nameFontSize: 20,
      metricFontSize: 15,
      valueFontSize: 17,
      vsFontSize: 18,
      tableMargin: 30,
      rowHeight: 50,
      headerHeight: 60,
      borderWidth: 3,
    },
  });
  const [showOverlayConfig, setShowOverlayConfig] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await promptsAPI.getAll();
      setPrompts(res?.data?.data || []);
    } catch (error) {
      console.error('Error loading prompts:', error);
      alert('Error loading prompts: ' + (error?.message || 'Unknown error'));
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // Only include statsOverlayConfig if type is celebrity_comparison
      if (submitData.type !== 'celebrity_comparison') {
        delete submitData.statsOverlayConfig;
      }
      
      // Format imageConfig for news_collage
      if (submitData.type === 'news_collage') {
        submitData.imageConfig = {
          collageCount: submitData.collageCount,
          layout: submitData.layout,
        };
        delete submitData.collageCount;
        delete submitData.layout;
      } else {
        delete submitData.imageConfig;
        delete submitData.collageCount;
        delete submitData.layout;
      }
      
      if (editingPrompt) {
        await promptsAPI.update(editingPrompt._id, submitData);
      } else {
        await promptsAPI.create(submitData);
      }
      setShowModal(false);
      setEditingPrompt(null);
      resetForm();
      loadData();
    } catch (error) {
      alert('Error saving prompt: ' + error.message);
    }
  };
  
  const updateOverlayConfig = (key, value) => {
    setFormData({
      ...formData,
      statsOverlayConfig: {
        ...formData.statsOverlayConfig,
        [key]: value,
      },
    });
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    const defaultOverlayConfig = {
      tableBgColor: 'rgba(0, 0, 0, 0.88)',
      tableBorderColor: '#FFD700',
      headerBgColor: 'rgba(139, 69, 19, 0.9)',
      rowBgColor1: 'rgba(139, 69, 19, 0.75)',
      rowBgColor2: 'rgba(101, 67, 33, 0.75)',
      nameColor: '#FFD700',
      metricColor: '#FFD700',
      valueColor: '#FFFFFF',
      vsColor: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      nameFontSize: 20,
      metricFontSize: 15,
      valueFontSize: 17,
      vsFontSize: 18,
      tableMargin: 30,
      rowHeight: 50,
      headerHeight: 60,
      borderWidth: 3,
    };
    setFormData({
      name: prompt.name,
      type: prompt.type || 'general',
      promptText: prompt.promptText,
      hashtags: Array.isArray(prompt.hashtags) ? prompt.hashtags.join(', ') : (prompt.hashtags || ''),
      aiProvider: prompt.aiProvider || 'openai',
      language: prompt.language || 'en',
      imageSource: prompt.imageSource || 'real',
      metrics: Array.isArray(prompt.metrics) ? prompt.metrics.join(',') : (prompt.metrics || 'age,height,famous_for,net_worth,spouse'),
      collageCount: prompt.imageConfig?.collageCount || 4,
      layout: prompt.imageConfig?.layout || 'grid',
      isActive: prompt.isActive,
      statsOverlayConfig: prompt.statsOverlayConfig || defaultOverlayConfig,
    });
    setShowModal(true);
  };

  const handleDelete = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await promptsAPI.delete(promptId);
      loadData();
    } catch (error) {
      alert('Error deleting prompt: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'general',
      promptText: '',
      hashtags: '',
      aiProvider: 'openai',
      language: 'en',
      imageSource: 'real',
      metrics: 'age,height,famous_for,net_worth,spouse',
      collageCount: 4,
      layout: 'grid',
      isActive: true,
      statsOverlayConfig: {
        tableBgColor: 'rgba(0, 0, 0, 0.88)',
        tableBorderColor: '#FFD700',
        headerBgColor: 'rgba(139, 69, 19, 0.9)',
        rowBgColor1: 'rgba(139, 69, 19, 0.75)',
        rowBgColor2: 'rgba(101, 67, 33, 0.75)',
        nameColor: '#FFD700',
        metricColor: '#FFD700',
        valueColor: '#FFFFFF',
        vsColor: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        nameFontSize: 20,
        metricFontSize: 15,
        valueFontSize: 17,
        vsFontSize: 18,
        tableMargin: 30,
        rowHeight: 50,
        headerHeight: 60,
        borderWidth: 3,
      },
    });
    setShowOverlayConfig(false);
  };

  const openAddModal = () => {
    setEditingPrompt(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Prompts</h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Prompt
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Config</th>
              <th>Hashtags</th>
              <th>Prompt Text</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!prompts || prompts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No prompts found. Add your first prompt!
                </td>
              </tr>
            ) : (
              prompts.map((prompt) => (
                <tr key={prompt._id}>
                  <td>{prompt.name}</td>
                  <td>
                    <div>
                      <span className={`badge ${
                        prompt.type === 'celebrity_comparison' ? 'badge-success' :
                        prompt.type === 'news_collage' ? 'badge-info' : 'badge-secondary'
                      }`} style={{ fontSize: '0.75rem' }}>
                        {prompt.type === 'celebrity_comparison' ? 'Celebrity' :
                         prompt.type === 'news_collage' ? 'News Collage' : prompt.type || 'General'}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' }}>
                        {prompt.imageSource === 'real' ? '📷 Real' : '🎨 AI'}
                      </div>
                    </div>
                  </td>
                  <td>
                    {prompt.type === 'celebrity_comparison' && (
                      <div style={{ fontSize: '0.75rem' }}>
                        <span style={{ color: '#666' }}>
                          {Array.isArray(prompt.metrics) ? prompt.metrics.length : 0} metrics
                        </span>
                        <div style={{ color: '#999', marginTop: '0.25rem' }}>
                          {Array.isArray(prompt.metrics) ? prompt.metrics.slice(0, 2).join(', ') : 'N/A'}...
                        </div>
                      </div>
                    )}
                    {prompt.type === 'news_collage' && (
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {prompt.imageConfig?.collageCount || 4} images
                      </div>
                    )}
                    {prompt.type === 'general' && (
                      <span style={{ fontSize: '0.75rem', color: '#999' }}>Simple</span>
                    )}
                  </td>
                  <td>
                    {Array.isArray(prompt.hashtags) && prompt.hashtags.length > 0 ? (
                      <div style={{ fontSize: '0.875rem' }}>
                        {prompt.hashtags.slice(0, 2).map((tag, i) => (
                          <span key={i} style={{ marginRight: '0.25rem' }}>{tag}</span>
                        ))}
                        {prompt.hashtags.length > 2 && <span>...</span>}
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.875rem' }}>None</span>
                    )}
                  </td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prompt.promptText.substring(0, 60)}...
                  </td>
                  <td>
                    <span className={`badge ${prompt.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {prompt.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(prompt)}
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(prompt._id)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      Delete
                    </button>
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
                {editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Post Type *</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="general">General (Image + Caption)</option>
                  <option value="celebrity_comparison">Celebrity Comparison (Image + Stats + Caption)</option>
                  <option value="news_collage">News Collage (4-Image Collage + Caption)</option>
                </select>
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Select the type of post you want to generate
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Image Source *</label>
                <select
                  className="form-select"
                  value={formData.imageSource}
                  onChange={(e) => setFormData({ ...formData, imageSource: e.target.value })}
                  required
                >
                  <option value="real">Real Images (Google Search)</option>
                  <option value="ai">AI Generated (DALL-E)</option>
                </select>
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Choose whether to use real images from Google or AI-generated images. Real images work best for celebrities and news.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">User Prompt (What to Generate) *</label>
                <textarea
                  className="form-textarea"
                  value={formData.promptText}
                  onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                  required
                  placeholder={
                    formData.type === 'celebrity_comparison'
                      ? "Compare Virat Kohli and MS Dhoni"
                      : formData.type === 'news_collage'
                      ? "Create a news collage about recent tech developments and AI breakthroughs"
                      : "Generate an engaging post about current trends"
                  }
                  style={{ minHeight: '100px' }}
                />
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  {formData.type === 'celebrity_comparison' ? (
                    <>
                      <strong>Examples:</strong><br/>
                      • "Compare Virat Kohli and MS Dhoni"<br/>
                      • "Compare two Indian cricket team captains"<br/>
                      • "Compare Pankaj Tripathi and Kay Kay Menon"<br/>
                      • "Compare Shah Rukh Khan and Salman Khan"<br/>
                      <br/>
                      <strong>Keep it simple!</strong> Just specify which celebrities to compare. The system will automatically:
                      <br/>- Find real images from Google
                      <br/>- Generate stats for the metrics you specified
                      <br/>- Create an engaging caption
                    </>
                  ) : formData.type === 'news_collage' ? (
                    'Describe the news topic or theme for the collage'
                  ) : (
                    'Describe what content you want to generate'
                  )}
                </small>
              </div>

              {formData.type === 'celebrity_comparison' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Metrics to Compare (comma-separated) *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.metrics}
                      onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                      placeholder="age, height, famous_for, net_worth, spouse"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                      These metrics will be displayed in the comparison table on the image (e.g., age, height, income, house, etc.)
                    </small>
                  </div>

                  {/* Stats Overlay Styling Section */}
                  <div className="form-group" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginTop: '1rem', backgroundColor: '#f9f9f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="form-label" style={{ marginBottom: 0, fontWeight: 'bold' }}>
                        🎨 Stats Overlay Styling
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowOverlayConfig(!showOverlayConfig)}
                        style={{
                          background: 'none',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '0.25rem 0.75rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        {showOverlayConfig ? '▼ Hide' : '▶ Show'}
                      </button>
                    </div>
                    <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                      Customize the appearance of the stats table overlay on comparison images
                    </small>

                    {showOverlayConfig && (
                      <div style={{ marginTop: '1rem' }}>
                        {/* Colors Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333' }}>Colors</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Table Background</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.tableBgColor}
                                onChange={(e) => updateOverlayConfig('tableBgColor', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="rgba(0, 0, 0, 0.88)"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Border Color</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.tableBorderColor}
                                onChange={(e) => updateOverlayConfig('tableBorderColor', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="#FFD700"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Header Background</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.headerBgColor}
                                onChange={(e) => updateOverlayConfig('headerBgColor', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="rgba(139, 69, 19, 0.9)"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Row Color 1</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.rowBgColor1}
                                onChange={(e) => updateOverlayConfig('rowBgColor1', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="rgba(139, 69, 19, 0.75)"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Row Color 2</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.rowBgColor2}
                                onChange={(e) => updateOverlayConfig('rowBgColor2', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="rgba(101, 67, 33, 0.75)"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Name Color</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.nameColor}
                                onChange={(e) => updateOverlayConfig('nameColor', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="#FFD700"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Metric Color</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.metricColor}
                                onChange={(e) => updateOverlayConfig('metricColor', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="#FFD700"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Value Color</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.valueColor}
                                onChange={(e) => updateOverlayConfig('valueColor', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="#FFFFFF"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>VS Color</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.vsColor}
                                onChange={(e) => updateOverlayConfig('vsColor', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="#FFFFFF"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fonts Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333' }}>Fonts</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Font Family</label>
                              <input
                                type="text"
                                value={formData.statsOverlayConfig.fontFamily}
                                onChange={(e) => updateOverlayConfig('fontFamily', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="Arial, sans-serif"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Name Font Size</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.nameFontSize}
                                onChange={(e) => updateOverlayConfig('nameFontSize', parseInt(e.target.value) || 20)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="10"
                                max="40"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Metric Font Size</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.metricFontSize}
                                onChange={(e) => updateOverlayConfig('metricFontSize', parseInt(e.target.value) || 15)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="10"
                                max="30"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Value Font Size</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.valueFontSize}
                                onChange={(e) => updateOverlayConfig('valueFontSize', parseInt(e.target.value) || 17)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="10"
                                max="30"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>VS Font Size</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.vsFontSize}
                                onChange={(e) => updateOverlayConfig('vsFontSize', parseInt(e.target.value) || 18)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="10"
                                max="30"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Sizing Section */}
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333' }}>Sizing</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Table Margin (px)</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.tableMargin}
                                onChange={(e) => updateOverlayConfig('tableMargin', parseInt(e.target.value) || 30)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="10"
                                max="100"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Row Height (px)</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.rowHeight}
                                onChange={(e) => updateOverlayConfig('rowHeight', parseInt(e.target.value) || 50)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="30"
                                max="100"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Header Height (px)</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.headerHeight}
                                onChange={(e) => updateOverlayConfig('headerHeight', parseInt(e.target.value) || 60)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="40"
                                max="120"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Border Width (px)</label>
                              <input
                                type="number"
                                value={formData.statsOverlayConfig.borderWidth}
                                onChange={(e) => updateOverlayConfig('borderWidth', parseInt(e.target.value) || 3)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                min="1"
                                max="10"
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#e8f4f8', borderRadius: '4px', fontSize: '0.8rem', color: '#555' }}>
                          <strong>💡 Tip:</strong> Use rgba() for transparent colors (e.g., rgba(0, 0, 0, 0.88)) or hex codes for solid colors (e.g., #FFD700). Font sizes are in pixels.
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {formData.type === 'news_collage' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Number of Images in Collage</label>
                    <input
                      className="form-input"
                      type="number"
                      min="2"
                      max="9"
                      value={formData.collageCount}
                      onChange={(e) => setFormData({ ...formData, collageCount: parseInt(e.target.value) || 4 })}
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                      Number of images to include in the collage (2-9)
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Layout</label>
                    <select
                      className="form-select"
                      value={formData.layout}
                      onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                    >
                      <option value="grid">Grid</option>
                      <option value="masonry">Masonry</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Language *</label>
                <select
                  className="form-select"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  required
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                </select>
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Select the language for the generated caption. Hindi captions will be in Devanagari script.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">AI Provider *</label>
                <select
                  className="form-select"
                  value={formData.aiProvider}
                  onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value })}
                  required
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="gemini">Google Gemini</option>
                </select>
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Choose which AI to use for content generation. Gemini may produce more realistic celebrity images.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Hashtags (comma-separated)</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                  placeholder="#Bollywood, #ActingLegends, #Mirzapur, #Gulaal"
                />
                <small style={{ color: '#666', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Hashtags will be automatically appended to the caption when posting
                </small>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
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
                  {editingPrompt ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prompts;

