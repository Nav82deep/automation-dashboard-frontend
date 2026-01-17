import React, { useState, useEffect } from 'react';
import { manualAPI } from '../api';

const ManualPostModal = ({ isOpen, onClose, pageId }) => {
    const [manualData, setManualData] = useState({
        pageId: '',
        celebrityA: '',
        urlA: '',
        celebrityB: '',
        urlB: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pageId) {
            setManualData(prev => ({ ...prev, pageId }));
        }
    }, [pageId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await manualAPI.create(manualData);
            alert('✅ Manual Post Created! It will appear on Facebook shortly.');
            setManualData({ ...manualData, celebrityA: '', urlA: '', celebrityB: '', urlB: '' });
            onClose(); // Close modal on success
        } catch (error) {
            alert('Error creating post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">⚡ Create Manual Comparison Post</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Celebrity A Name</label>
                            <input required type="text" className="form-input"
                                value={manualData.celebrityA}
                                onChange={(e) => setManualData({ ...manualData, celebrityA: e.target.value })}
                                placeholder="e.g. Virat Kohli"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Image URL for A</label>
                            <input required type="url" className="form-input"
                                value={manualData.urlA}
                                onChange={(e) => setManualData({ ...manualData, urlA: e.target.value })}
                                placeholder="Direct Image Link"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Celebrity B Name</label>
                            <input required type="text" className="form-input"
                                value={manualData.celebrityB}
                                onChange={(e) => setManualData({ ...manualData, celebrityB: e.target.value })}
                                placeholder="e.g. MS Dhoni"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Image URL for B</label>
                            <input required type="url" className="form-input"
                                value={manualData.urlB}
                                onChange={(e) => setManualData({ ...manualData, urlB: e.target.value })}
                                placeholder="Direct Image Link"
                            />
                        </div>
                    </div>

                    <div style={{ background: '#fffbeb', padding: '0.5rem', fontSize: '0.8rem', color: '#92400e', borderRadius: '4px', marginBottom: '1rem' }}>
            💡 Tip: Right-click image -> "Copy Image Address". Link should end in .jpg, .png or .webp
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn" onClick={onClose} style={{ background: '#ddd' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ background: '#8b5cf6' }}>
                            {loading ? 'Generating...' : '🚀 Post Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualPostModal;
