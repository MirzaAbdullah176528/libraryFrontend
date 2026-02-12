'use client'

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { apiService , authService } from '../service/page';

interface BookCreateFormProps {
  onSuccess: (item: any) => void;
  onClose: () => void;
  category: string;
}

const BookCreateForm = ({ onSuccess, onClose, category }: BookCreateFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    library: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [libraryData, setLibraryData] = useState({
    name: '',
    address: ''
  });
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchLibraries();
    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
    }
    
    
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const fetchLibraries = async () => {
    try {
      const res = await apiService.getLibraries();
      setLibraries(Array.isArray(res) ? res : res.result || []);
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (category === 'book') {
      setFormData({ ...formData, [name]: value });
    } else {
      setLibraryData({ ...libraryData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (category === 'book' && !formData.library) {
      setError('Please select a library');
      setLoading(false);
      return;
    }

    if (category !== 'book' && (!libraryData.name || !libraryData.address)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (category === 'book') {
        const formDataPayload = new FormData();
        formDataPayload.append('name', formData.name);
        formDataPayload.append('category', formData.category);
        formDataPayload.append('library', formData.library);
        
        if (selectedFile) {
          formDataPayload.append('image', selectedFile);
        }
        
        const newBook = await apiService.createBook(formDataPayload);
        onSuccess(newBook.book || newBook);
      } else {
        const libraryDataWithUser = {
          ...libraryData,
          Created_By: {
            id: currentUser?.userId || currentUser?._id,
            username: currentUser?.username
          }
        };
        
        const newLibrary = await apiService.createLibrary(libraryDataWithUser);
        onSuccess(newLibrary.library || newLibrary);
      }
    } catch (err: any) {
      console.error('Error creating item:', err);
      setError(err.message || `Failed to create ${category === 'book' ? 'book' : 'library'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{category === 'book' ? 'Add New Book' : 'Add New Library'}</h3>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {category === 'book' ? (
            <>
              <div className="form-group">
                <label htmlFor="name">Book Title *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Fiction, Science, History"
                />
              </div>

              <div className="form-group">
                <label htmlFor="library">Library *</label>
                <select
                  id="library"
                  name="library"
                  value={formData.library}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a library</option>
                  {libraries.map((library) => (
                    <option key={library._id} value={library._id}>
                      {library.name} - {library.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="image">Cover Image</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <div className="file-label">
                    <Upload size={20} />
                    <span>{selectedFile ? selectedFile.name : "Choose an image file..."}</span>
                  </div>
                </div>
                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="name">Library Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={libraryData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter library name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={libraryData.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter library address"
                />
              </div>
            </>
          )}

          <div className="form-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading 
                ? (category === 'book' ? 'Creating...' : 'Adding...')
                : (category === 'book' ? 'Create Book' : 'Add Library')
              }
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
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #161b22;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          max-height: 90vh;
          overflow-y: auto;
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

        .book-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: #8b949e;
          font-size: 0.85rem;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input[type="text"],
        .form-group select {
          width: 100%;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #58a6ff;
          box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.1);
          background: #161b22;
        }

        .form-group select option {
          background: #161b22;
          color: white;
        }
        
        .file-input-wrapper {
          position: relative;
          width: 100%;
          height: 50px;
          background: #0d1117;
          border: 1px dashed #30363d;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .file-input-wrapper:hover {
          border-color: #58a6ff;
          background: rgba(88, 166, 255, 0.05);
        }
        
        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }
        
        .file-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #8b949e;
          font-size: 0.9rem;
        }
        
        .image-preview {
          margin-top: 12px;
          width: 100%;
          height: 150px;
          border-radius: 12px;
          overflow: hidden;
          background: #0d1117;
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .form-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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

export default BookCreateForm;