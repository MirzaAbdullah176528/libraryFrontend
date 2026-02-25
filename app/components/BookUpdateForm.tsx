'use client'

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { apiService } from '../../service/api';
import { Upload } from 'lucide-react';

interface Book {
  _id: string;
  name: string;
  category: string;
  image?: string;
  author?: string;
  library?: { name: string; _id: string };
  Created_By?: { username: string };
}

interface BookUpdateFormProps {
  book: Book;
  onUpdate: (updatedBook: Book) => void;
  onClose: () => void;
}

const BookUpdateForm = ({ book, onUpdate, onClose }: BookUpdateFormProps) => {
  const [formValues, setFormValues] = useState({
    name: book.name,
    category: book.category,
    author: book.author || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(book.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      if (previewUrl && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formValues.name);
      submitData.append('category', formValues.category);
      submitData.append('author', formValues.author);
      
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      const updatedBook = await apiService.updateBook(book._id, submitData as any);
      onUpdate(updatedBook);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update book');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update Book</h3>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Book Title *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formValues.name}
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
              value={formValues.category}
              onChange={handleChange}
              required
              placeholder="e.g., Fiction, Science, History"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formValues.author}
              onChange={handleChange}
              required
              placeholder="George Orwell, Franz Kafka"
            />
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

          <div className="form-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Book'}
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
          position: sticky;
          top: 0;
          background: #161b22;
          z-index: 10;
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

        .form-group input[type="text"] {
          width: 100%;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-group input[type="text"]:focus {
          outline: none;
          border-color: #58a6ff;
          box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.1);
          background: #161b22;
        }

        .file-input-wrapper {
          position: relative;
          background: #0d1117;
          border: 1px dashed #30363d;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }

        .file-input-wrapper:hover {
          border-color: #58a6ff;
          background: #161b22;
        }

        .file-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .file-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #8b949e;
          font-size: 0.9rem;
        }

        .image-preview {
          margin-top: 16px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #30363d;
          display: flex;
          justify-content: center;
          background: #0d1117;
          padding: 8px;
        }

        .image-preview img {
          max-width: 100%;
          height: 160px;
          object-fit: contain;
          border-radius: 8px;
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

export default BookUpdateForm;