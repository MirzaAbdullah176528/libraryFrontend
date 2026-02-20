'use client'

import { useState, useEffect } from 'react';
import { FiX, FiCamera, FiUser, FiTrash2 } from 'react-icons/fi';
import { apiService } from '../../service/api';

interface User {
  _id: string;
  Username: string;
  avatar?: string;
}

interface UserUpdateFormProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onDelete: () => Promise<void>;  // FIX: added onDelete to props interface
  onClose: () => void;
}

const UserUpdateForm = ({ user, onUpdate, onDelete, onClose }: UserUpdateFormProps) => {
  const id = user._id;

  const [formData, setFormData] = useState({
    newUsername: user.Username,
    newPassword: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar || null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== user.avatar) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, user.avatar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();

      if (formData.newUsername && formData.newUsername !== user.Username) {
        data.append('newUsername', formData.newUsername);
      }

      if (formData.newPassword.trim()) {
        data.append('newPassword', formData.newPassword);
      }

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const hasData = Array.from(data.keys()).length > 0;

      if (!hasData) {
        onClose();
        return;
      }

      const updatedUser = await apiService.updateUser(id, data);
      onUpdate(updatedUser.user || updatedUser);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // FIX: wraps onDelete with local loading state so the button shows feedback
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDelete();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update User Profile</h3>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="avatar-upload-container">
            <div className="avatar-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" />
              ) : (
                <FiUser className="default-avatar-icon" />
              )}
            </div>
            <label htmlFor="image-upload" className="upload-btn">
              <FiCamera />
              <span>Change Photo</span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </div>

          <div className="form-group">
            <label htmlFor="newUsername">Username</label>
            <input
              type="text"
              id="newUsername"
              name="newUsername"
              value={formData.newUsername}
              onChange={handleChange}
              placeholder="Enter new username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (leave empty to keep current)"
            />
            <div className="password-note">
              Leave password field empty if you don't want to change it
            </div>
          </div>

          <div className="form-footer">
            <button
              type="button"
              onClick={handleDelete}
              className="delete-btn"
              disabled={deleteLoading || loading}
            >
              <FiTrash2 />
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>

            <div className="footer-right">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading || deleteLoading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #161b22;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h3 {
          margin: 0;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
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

        .user-form { padding: 24px; }

        .avatar-upload-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .avatar-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid #30363d;
          background: #0d1117;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }

        .default-avatar-icon { font-size: 48px; color: #8b949e; }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #58a6ff;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(88, 166, 255, 0.1);
          transition: background 0.2s;
        }

        .upload-btn:hover { background: rgba(88, 166, 255, 0.2); }

        .form-group { margin-bottom: 20px; }

        .form-group label {
          display: block;
          color: #8b949e;
          font-size: 0.85rem;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #58a6ff;
          box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.1);
          background: #161b22;
        }

        .password-note {
          color: #8b949e;
          font-size: 0.75rem;
          margin-top: 4px;
          font-style: italic;
        }

        .form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-right {
          display: flex;
          gap: 12px;
        }

        .delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid rgba(248, 81, 73, 0.2);
          color: #ff7b72;
          padding: 12px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .delete-btn:hover:not(:disabled) {
          background: rgba(248, 81, 73, 0.2);
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #8b949e;
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .submit-btn {
          background: linear-gradient(180deg, #238636, #2ea043);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(46, 160, 67, 0.2);
        }

        .submit-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(46, 160, 67, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(248, 81, 73, 0.1);
          color: #ff7b72;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          border: 1px solid rgba(248, 81, 73, 0.2);
        }
      `}</style>
    </div>
  );
};

export default UserUpdateForm;