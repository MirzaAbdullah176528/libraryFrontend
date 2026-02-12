'use client'
import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { apiService } from '../service/page';

interface Library {
  _id: string;
  name: string;
  address: string;
  category?: string;
}

interface LibraryUpdateFormProps {
  library: Library;
  onUpdate: (updatedLibrary: Library) => void;
  onClose: () => void;
}

const LibraryUpdateForm: React.FC<LibraryUpdateFormProps> = ({ library, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: library.name || '',
    address: library.address || '',
    category: library.category || 'General'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.updateLibrary(library._id, formData);
      
      // Debug: Log the response to see what the API returns
      console.log('Update library response:', response);
      
      // Handle different response structures
      if (response.success || response._id || response.library) {
        // Extract the updated library from different possible response structures
        const updatedLibrary = response.library || response.result || response;
        
        // Make sure we have the required fields
        if (updatedLibrary && updatedLibrary._id) {
          onUpdate(updatedLibrary);
          onClose();
        } else {
          setError('Invalid response format from server');
        }
      } else {
        setError(response.message || response.error || 'Failed to update library');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      setError(error.message || 'Failed to update library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'General',
    'Academic',
    'Public',
    'School',
    'University',
    'Special',
    'Digital',
    'Private'
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Update Library</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Library Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter library name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Enter library address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Library'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: #161b22;
          border-radius: 20px;
          padding: 30px;
          width: 90%;
          max-width: 500px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .modal-header h2 {
          color: white;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: #c9d1d9;
          margin-bottom: 8px;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          background: #0d1117;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #58a6ff;
          box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-group select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%238b949e' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 40px;
        }

        .error-message {
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid rgba(248, 81, 73, 0.2);
          color: #ff7b72;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        .cancel-btn,
        .submit-btn {
          flex: 1;
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-btn {
          background: linear-gradient(180deg, #58a6ff, #1f6feb);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default LibraryUpdateForm;