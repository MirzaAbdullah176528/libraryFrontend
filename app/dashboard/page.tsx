'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, authService } from '../service/page';
import Sidebar from '../sidebar/page';
import { FiPlus, FiTrash2, FiMapPin, FiX, FiBookOpen } from 'react-icons/fi';

interface Book {
  _id: string;
  name: string;
  category: string;
  image?: string;
  library?: { _id: string, name: string };
}

interface Library {
  _id: string;
  name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    library: '',
    image: ''
  });

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData(userData.userId);
  }, []);

  const fetchDashboardData = async (userId: string) => {
    try {
      const [booksData, libsData] = await Promise.all([
        apiService.getBooks({ created_by: userId }),
        apiService.getLibraries()
      ]);
      setMyBooks(booksData.result || []);
      setLibraries(libsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this book?')) return;
    
    try {
      await apiService.deleteBook(id);
      setMyBooks(prev => prev.filter(b => b._id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiService.createBook(formData);
      if (res.book) {
        setMyBooks(prev => [res.book, ...prev]);
        setIsModalOpen(false);
        setFormData({ name: '', category: '', library: '', image: '' });
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeSection="books"
        onSectionChange={() => {}}
        onSearch={() => {}}
        onLogout={authService.logout}
      />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="header-title">My Contributions</h1>
            <p className="header-subtitle">Manage the books you've added to the network.</p>
          </div>
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            <FiPlus size={20} />
            <span>Add Book</span>
          </button>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="stats-bar">
               <div className="stat-item">
                  <span className="stat-label">Total Books</span>
                  <span className="stat-value">{myBooks.length}</span>
               </div>
               <div className="stat-item">
                  <span className="stat-label">Active Libraries</span>
                  <span className="stat-value">{libraries.length}</span>
               </div>
            </div>

            <div className="books-grid">
                {myBooks.length > 0 ? (
                myBooks.map((book) => (
                    <div key={book._id} className="book-card-dashboard">
                        <div className="card-media">
                            <img 
                            src={book.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'} 
                            alt={book.name} 
                            className="book-cover"
                            onError={(e) => e.currentTarget.src="https://via.placeholder.com/400x300?text=No+Cover"}
                            />
                            <div className="media-overlay">
                                <span className="category-badge">{book.category}</span>
                            </div>
                        </div>
                        
                        <div className="card-content">
                            <h3 className="book-name" title={book.name}>{book.name}</h3>
                            <div className="book-info">
                                <div className="info-row">
                                    <FiMapPin className="info-icon" />
                                    <span>{book.library?.name || 'Unknown Branch'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-actions">
                            <button 
                                onClick={() => handleDelete(book._id)} 
                                className="action-btn delete"
                                title="Delete Book"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))
                ) : (
                <div className="empty-dashboard">
                    <div className="empty-icon"><FiBookOpen /></div>
                    <h3>No contributions yet</h3>
                    <p>Start building your collection by adding a book.</p>
                </div>
                )}
            </div>
          </>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-container">
              <div className="modal-header">
                <h2>Add New Book</h2>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                  <FiX size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="modal-form">
                <div className="input-group">
                  <label>Title</label>
                  <input 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter book title"
                    className="modal-input"
                  />
                </div>
                
                <div className="input-row">
                    <div className="input-group">
                    <label>Category</label>
                    <input 
                        required 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        placeholder="Genre"
                        className="modal-input" 
                    />
                    </div>

                    <div className="input-group">
                    <label>Library</label>
                    <select 
                        required
                        value={formData.library}
                        onChange={e => setFormData({...formData, library: e.target.value})}
                        className="modal-select"
                    >
                        <option value="">Select branch...</option>
                        {libraries.map(lib => (
                        <option key={lib._id} value={lib._id}>{lib.name}</option>
                        ))}
                    </select>
                    </div>
                </div>

                <div className="input-group">
                  <label>Cover Image URL</label>
                  <input 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="modal-input" 
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Add Book'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        /* Header */
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            animation: fadeIn 0.5s ease-out;
        }

        .header-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: white;
            margin: 0 0 8px 0;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
            color: #94a3b8;
            font-size: 1.1rem;
            margin: 0;
        }

        .primary-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .primary-btn:hover {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
        }

        /* Stats */
        .stats-bar {
            display: flex;
            gap: 24px;
            margin-bottom: 40px;
        }

        .stat-item {
            background: #1e293b;
            padding: 16px 24px;
            border-radius: 16px;
            border: 1px solid #334155;
            display: flex;
            flex-direction: column;
            min-width: 140px;
        }

        .stat-label { color: #94a3b8; font-size: 0.85rem; font-weight: 500; margin-bottom: 4px; }
        .stat-value { color: white; font-size: 1.5rem; font-weight: 700; }

        /* Grid & Cards */
        .books-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 24px;
            animation: slideUp 0.6s ease-out;
        }

        .book-card-dashboard {
            background: #1e293b;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #334155;
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .book-card-dashboard:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.3);
            border-color: #475569;
        }

        .card-media {
            height: 180px;
            position: relative;
            overflow: hidden;
        }

        .book-cover {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .book-card-dashboard:hover .book-cover { transform: scale(1.05); }

        .media-overlay {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
        }

        .category-badge {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(4px);
            color: #fff;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }

        .book-name {
            color: white;
            font-size: 1.1rem;
            font-weight: 700;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .book-info { margin-top: auto; }

        .info-row {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #94a3b8;
            font-size: 0.85rem;
        }

        .card-actions {
            padding: 16px 20px;
            border-top: 1px solid #334155;
            display: flex;
            justify-content: flex-end;
            background: #162032;
        }

        .action-btn {
            background: transparent;
            border: none;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .action-btn.delete { color: #ef4444; }
        .action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); }

        /* Empty State */
        .empty-dashboard {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 0;
            color: #64748b;
            background: #161b22;
            border-radius: 24px;
            border: 2px dashed #334155;
        }

        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .empty-dashboard h3 { color: white; margin: 0 0 8px 0; font-size: 1.25rem; }

        /* Modal */
        .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.2s ease-out;
        }

        .modal-container {
            background: #1e293b;
            width: 100%;
            max-width: 500px;
            border-radius: 24px;
            border: 1px solid #334155;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease-out;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }

        .modal-header h2 { margin: 0; color: white; font-size: 1.5rem; font-weight: 700; }
        
        .close-modal {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            transition: color 0.2s;
        }
        .close-modal:hover { color: white; }

        .modal-form { display: flex; flex-direction: column; gap: 24px; }

        .input-group label {
            display: block;
            color: #cbd5e1;
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .modal-input, .modal-select {
            width: 100%;
            background: #0f172a;
            border: 1px solid #334155;
            padding: 14px 16px;
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            transition: all 0.2s;
        }

        .modal-input:focus, .modal-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-row { display: flex; gap: 16px; }
        .input-row .input-group { flex: 1; }

        .modal-footer {
            display: flex;
            gap: 12px;
            margin-top: 12px;
        }

        .btn-cancel {
            flex: 1;
            padding: 14px;
            background: transparent;
            border: 1px solid #334155;
            color: #cbd5e1;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-cancel:hover { background: #334155; color: white; }

        .btn-submit {
            flex: 1;
            padding: 14px;
            background: #3b82f6;
            border: none;
            color: white;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-submit:hover { background: #2563eb; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}