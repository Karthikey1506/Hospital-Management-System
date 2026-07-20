import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X, CheckCircle } from 'lucide-react';

export default function FileUploadModal({ title, endpoint, extraData = {}, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // 10MB limit check
    if (selected.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit.');
      return;
    }

    setError(null);
    setFile(selected);

    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append(extraData.fieldName || 'file', file);
    Object.keys(extraData).forEach(key => {
      if (key !== 'fieldName') formData.append(key, extraData[key]);
    });

    try {
      const token = localStorage.getItem('medpulse_token');
      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{title || 'Upload Medical Document'}</h3>
          <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleUpload}>
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.01)',
            marginBottom: '16px',
            cursor: 'pointer'
          }} onClick={() => document.getElementById('file-input-modal').click()}>
            <input 
              type="file" 
              id="file-input-modal" 
              style={{ display: 'none' }}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ maxHeight: '140px', borderRadius: '8px', marginBottom: '8px' }} />
            ) : file ? (
              <FileText size={42} color="var(--primary-cyan)" style={{ marginBottom: '8px' }} />
            ) : (
              <Upload size={38} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            )}

            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {file ? file.name : 'Click to Browse PDF Reports, X-Rays, Scans'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supported: PDF, JPEG, PNG, WEBP (Max 10MB)
            </div>
          </div>

          {error && (
            <div style={{ color: '#FCA5A5', fontSize: '0.85rem', marginBottom: '12px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
