'use client'

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiBook, FiBookOpen, FiUser, FiLogOut } from 'react-icons/fi';
import BookUpdateForm from '../components/BookUpdateForm';
import BookCard from '../components/bookCard';
import BookCreateForm from '../components/BookCreateForm';
import LibraryCard from '../components/libraryCard';
import LibraryUpdateForm from '../components/libraryUpdatefoam';
import UserUpdateForm from '../components/userUpdate';
import { apiService } from '../../service/api';
import { authService } from '../../service/api';
import Link from 'next/link';
import Chat from '../components/chat';
import { FiEye, FiEyeOff, FiLock, FiArrowRight, FiLayers } from 'react-icons/fi';
import { BsFillBuildingFill } from 'react-icons/bs';

interface Book {
  _id: string;
  name: string;
  category: string;
  image?: string;
  library?: { name: string; _id: string };
  Created_By?: { username: string };
}

interface Library {
  _id: string;
  name: string;
  address: string;
  category?: string;
  Created_By?: { username: string; _id?: string; id?: string };
}

interface User {
  _id: string;
  Username: string;
  Password?: string;
  userId?: string;
  username?: string;
  avatar?: string;
}

type TabType = 'books' | 'libraries';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [userLibraries, setUserLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState({ books: true, libraries: true });
  const [showBookUpdateForm, setShowBookUpdateForm] = useState(false);
  const [showLibraryUpdateForm, setShowLibraryUpdateForm] = useState(false);
  const [showUserUpdateForm, setShowUserUpdateForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createType, setCreateType] = useState<'book' | 'library'>('book');
  const [userStats, setUserStats] = useState({
    totalBooks: 0,
    totalLibraries: 0
  });
  const [chatOpen, SetChatOpen] = useState(false)

  const [currentUser, setCurrentUser] = useState<any>({ userId: '', username: '', avatar: '' });

  const API_URL = 'http://localhost:5000';

  async function getUser() {
    let user = await authService.getCurrentUser();

    if (user) {
      const userMetaData = {
        userId: user.userId || user._id || user.id,
        username: user.username || user.Username
      };
      let userData = await apiService.getProfile(userMetaData.userId)
      if (userData) {
        const normalizedUser = {
          userId: userData._id,
          username: userData.Username,
          avatar: userData.avatar
        }

        setCurrentUser(normalizedUser);
        fetchDashboardData(normalizedUser.userId);
        console.log(user, currentUser, normalizedUser)
      }
    }
  }

  useEffect(() => {
    getUser()

  }, []);

  const fetchDashboardData = async (userId: string) => {
    try {
      await Promise.all([
        fetchUserBooks(userId),
        fetchUserLibraries(userId)
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserBooks = async (userId: string) => {
    setLoading(prev => ({ ...prev, books: true }));
    try {
      const res = await apiService.getBooks({ created_by: userId });
      const books = Array.isArray(res) ? res : (res.result || []);
      setUserBooks(books);

      setUserStats(prev => ({
        ...prev,
        totalBooks: books.length,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, books: false }));
    }
  };

  const fetchUserLibraries = async (userId: string) => {
    setLoading(prev => ({ ...prev, libraries: true }));
    try {
      const res = await apiService.getLibraries();

      const libraries = Array.isArray(res) ? res : (res.result || []);

      const userLibs = userId
        ? libraries.filter((lib: Library) => {
          const createdBy = lib.Created_By as any;
          if (!createdBy) return false;

          const createdById = createdBy.id || createdBy._id;
          const createdByUsername = createdBy.username || createdBy.Username;

          return (
            String(createdById) === String(userId) ||
            createdByUsername === currentUser.username
          );
        })
        : libraries;

      setUserLibraries(userLibs);
      setUserStats(prev => ({
        ...prev,
        totalLibraries: userLibs.length
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, libraries: false }));
    }
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setShowBookUpdateForm(true);
  };

  const handleEditLibrary = (library: Library) => {
    setSelectedLibrary(library);
    setShowLibraryUpdateForm(true);
  };

  const handleEditUser = () => {
    const userData: User = {
      avatar: currentUser?.avatar || 'no image',
      _id: currentUser?.userId || '1',
      Username: currentUser?.username || 'Demo User'
    };
    setSelectedUser(userData);
    setShowUserUpdateForm(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await apiService.deleteBook(bookId);
      setUserBooks(prev => prev.filter(book => book._id !== bookId));

      setUserStats(prev => ({
        ...prev,
        totalBooks: prev.totalBooks - 1,
      }));

      alert('Book deleted successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to delete book');
    }
  };

  const handleDeleteLibrary = async (libraryId: string) => {
    if (!confirm('Are you sure you want to delete this library?')) return;

    try {
      await apiService.deleteLibrary(libraryId);
      setUserLibraries(prev => prev.filter(lib => lib._id !== libraryId));

      setUserStats(prev => ({
        ...prev,
        totalLibraries: prev.totalLibraries - 1
      }));

      alert('Library deleted successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to delete library');
    }
  };

  const handleBookUpdateSuccess = (updatedBook: Book) => {
    setUserBooks(prev => prev.map(book =>
      book._id === updatedBook._id ? updatedBook : book
    ));
    setShowBookUpdateForm(false);
    setSelectedBook(null);
  };

  const handleLibraryUpdateSuccess = (updatedLibrary: Library) => {
    setUserLibraries(prev => prev.map(lib =>
      lib._id === updatedLibrary._id ? updatedLibrary : lib
    ));
    setShowLibraryUpdateForm(false);
    setSelectedLibrary(null);
  };

  const handleUserUpdateSuccess = (updatedUser: User) => {
    if (typeof window !== 'undefined') {
      const user = authService.getCurrentUser();
      if (user) {
        user.username = updatedUser.Username;

        if (updatedUser.avatar) {
          user.avatar = updatedUser.avatar;
        }

        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    setShowUserUpdateForm(false);

    alert('User details updated successfully!');
    window.location.reload();
  };

  const handleCreateSuccess = (newItem: Book | Library) => {
    if ('category' in newItem && !('address' in newItem)) {

      const book = newItem as Book;
      setUserBooks(prev => [...prev, book]);

      setUserStats(prev => ({
        ...prev,
        totalBooks: prev.totalBooks + 1,
      }));
    } else {

      const library = newItem as Library;
      setUserLibraries(prev => [...prev, library]);

      setUserStats(prev => ({
        ...prev,
        totalLibraries: prev.totalLibraries + 1
      }));
    }
    setShowCreateForm(false);
    setCreateType('book');
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleOpenCreateForm = (type: 'book' | 'library') => {
    setCreateType(type);
    setShowCreateForm(true);
  };

  const getSafeBook = (book: Book): Book => {
    return {
      _id: book._id || '',
      name: book.name || 'Unknown Book',
      category: book.category || 'Uncategorized',
      image: book.image,
      library: book.library,
      Created_By: book.Created_By
    };
  };

  const getSafeLibrary = (library: Library): Library => {
    return {
      _id: library._id || '',
      name: library.name || 'Unknown Library',
      address: library.address || 'No address provided',
      category: library.category || 'General',
      Created_By: library.Created_By
    };
  };

  function ChatwithAi() {
    return (
      < Chat />
    )
  }

  const getSafeUser = (user: User): User => {
    return {
      _id: user._id || '',
      Username: user.Username || '',
      Password: user.Password || '',
    };
  };

  if (loading.books && loading.libraries) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
        <style jsx>{`
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0d1117;
          color: #fff;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: #58a6ff;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', height: '100%' }}>
            <Link style={{textDecoration:'none'}} href={'/'}>
              <div className="brand-header">
                  <div className="logo-icon">
                      <FiLayers />
                  </div>
                  <span className="brand-name">Libris</span>
              </div>
            </Link>
          </div>
        </div>
        

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h4 className="section-title">Dashboard</h4>
            <button
              className={`nav-btn ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              <FiBook />
              <span>My Books</span>
              <span className="nav-count">{userBooks.length}</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'libraries' ? 'active' : ''}`}
              onClick={() => setActiveTab('libraries')}
            >
              <FiBookOpen />
              <span>My Libraries</span>
              <span className="nav-count">{userLibraries.length}</span>
            </button>
          </div>

          <div className="nav-section">
            <h4 className="section-title">Quick Actions</h4>
            <button
              className="nav-btn create-btn"
              onClick={() => handleOpenCreateForm('book')}
            >
              <FiBook />
              <span>Add New Book</span>
            </button>
            <button
              className="nav-btn create-btn"
              onClick={() => handleOpenCreateForm('library')}
            >
              <BsFillBuildingFill />
              <span>Add New Library</span>
            </button>
            <h4 className="section-title-profile">Update Profile</h4>
            <button
            className="nav-btn create-btn"
            onClick={handleEditUser}
          >
            <span>Update details</span>
          </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          {/* <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button> */}

          <div className="user-info">
            <div className="user-avatar">
              <Link href={'/profile'}>

                {currentUser?.avatar ? (
                  <img
                    src={`${API_URL}${currentUser.avatar}`}
                    alt="Profile"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  />
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <FiUser size={24} />
                  </span>
                )}
              </Link>
            </div>
            <div>
              <h3>{currentUser?.username || 'User'}</h3>
              <p className="user-email">{ currentUser.userId.slice(0,5)+'.......'+currentUser.userId.slice(18,-1) }</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Chat />

        <header className="main-header">
          <div>
            <h1>{activeTab === 'books' ? 'My Books' : 'My Libraries'}</h1>
            <p className="subtitle">
              {activeTab === 'books'
                ? 'Manage and organize your contributed books'
                : 'Manage your library collections'}
            </p>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FiBook />
            </div>
            <div className="stat-content">
              <h3>Total Books</h3>
              <p className="stat-number">{userStats.totalBooks}</p>
              <p className="stat-desc">Books you've contributed</p>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-icon">
              <FiBookOpen />
            </div>
            <div className="stat-content">
              <h3>Total Libraries</h3>
              <p className="stat-number">{userStats.totalLibraries}</p>
              <p className="stat-desc">Libraries you manage</p>
            </div>
          </div>
        </div>

        <section className="content-section">
          <div className="section-header">
            <div>
              <h2>
                {activeTab === 'books' ? 'Book Collection' : 'Library Collection'}
              </h2>
              <p>
                {activeTab === 'books'
                  ? 'All books you have added to the system'
                  : 'All libraries you have created'}
              </p>
            </div>

            <button
              className="add-btn"
              onClick={() => handleOpenCreateForm(activeTab === 'books' ? 'book' : 'library')}
            >
              <FiPlus />
              Add {activeTab === 'books' ? 'Book' : 'Library'}
            </button>
          </div>

          {activeTab === 'books' && (
            <div className="content-grid">
              {loading.books ? (
                <div className="loading-content">
                  <div className="spinner small"></div>
                  <p>Loading books...</p>
                </div>
              ) : userBooks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No Books Yet</h3>
                  <p>Start by adding your first book to the collection</p>
                  <button
                    className="cta-btn"
                    onClick={() => handleOpenCreateForm('book')}
                  >
                    <FiPlus />
                    Add Your First Book
                  </button>
                </div>
              ) : (
                <div className="books-grid">
                  {userBooks.map((book) => {
                    const safeBook = getSafeBook(book);
                    return (
                      <div key={safeBook._id} className="book-item">
                        <BookCard book={safeBook} />
                        <div className="item-actions">
                          <button
                            className="action-btn edit"
                            onClick={() => handleEditBook(safeBook)}
                            title="Edit book"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeleteBook(safeBook._id)}
                            title="Delete book"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'libraries' && (
            <div className="content-grid">
              {loading.libraries ? (
                <div className="loading-content">
                  <div className="spinner small"></div>
                  <p>Loading libraries...</p>
                </div>
              ) : userLibraries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏛️</div>
                  <h3>No Libraries Yet</h3>
                  <p>Create your first library to organize books</p>
                  <button
                    className="cta-btn"
                    onClick={() => handleOpenCreateForm('library')}
                  >
                    <FiPlus />
                    Create Your First Library
                  </button>
                </div>
              ) : (
                <div className="libraries-grid">
                  {userLibraries.map((library) => {
                    const safeLibrary = getSafeLibrary(library);
                    return (
                      <div key={safeLibrary._id} className="library-item">
                        <LibraryCard
                          library={{
                            _id: safeLibrary._id,
                            name: safeLibrary.name,
                            address: safeLibrary.address,
                            category: safeLibrary.category
                          }}
                          onEdit={() => handleEditLibrary(safeLibrary)}
                          onDelete={() => handleDeleteLibrary(safeLibrary._id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {showBookUpdateForm && selectedBook && (
        <BookUpdateForm
          book={getSafeBook(selectedBook)}
          onUpdate={handleBookUpdateSuccess}
          onClose={() => {
            setShowBookUpdateForm(false);
            setSelectedBook(null);
          }}
        />
      )}

      {showLibraryUpdateForm && selectedLibrary && (
        <LibraryUpdateForm
          library={getSafeLibrary(selectedLibrary)}
          onUpdate={handleLibraryUpdateSuccess}
          onClose={() => {
            setShowLibraryUpdateForm(false);
            setSelectedLibrary(null);
          }}
        />
      )}

      {showUserUpdateForm && selectedUser && (
        <UserUpdateForm
          user={getSafeUser(selectedUser)}
          onUpdate={handleUserUpdateSuccess}
          onClose={() => {
            setShowUserUpdateForm(false);
          }}
        />
      )}

      {showCreateForm && (
        <BookCreateForm
          onSuccess={handleCreateSuccess}
          onClose={() => {
            setShowCreateForm(false);
            setCreateType('book');
          }}
          category={createType}
        />
      )}

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #0d1117;
          color: #fff;
          align-item:center;
          justify-content:center
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #161b22 0%, #0d1117 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          padding: 24px 0 0 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-header {
          padding: 0 24px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top:5px;
          width:100%;
          justify-content:flex-start
        }
        .sidebar-nav {
          flex: 1;
          padding: 24px 0;
          overflow-y: auto;
          
          /* Add these lines to style the scrollbar */
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent; /* Firefox */
        }

        /* Webkit browsers (Chrome, Safari, Edge) */
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .user-avatar {
          // width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          // width:100%
        }

        .user-info h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .user-email {
          margin: 4px 0 0;
          color: #8b949e;
          font-size: 0.85rem;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 0;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 32px;
          padding: 0 24px;
        }

        .section-title {
          color: #8b949e;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 16px;
          font-weight: 600;
        }
        .section-title-profile {
          color: #8b949e;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 20px 0 10px;
          font-weight: 600;
        }
        .brand-header {
            display: flex;
            align-items: center;
            gap: 12px;
            justify-content:flex-start;
            width:100%;
        }
        
        .brand-name {
            font-size: 1.7rem;
            font-weight: 700;
            color: #fff;
            letter-spacing: 2px;
            margin-bottom:10px
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #58a6ff, #238636);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom:10px
        }


        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #c9d1d9;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 4px;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .nav-btn.active {
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          border-left: 3px solid #58a6ff;
        }

        .nav-count {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        .create-btn {
          background: rgba(46, 160, 67, 0.1);
          color: #2ea043;
          border: 1px solid rgba(46, 160, 67, 0.2);
        }

        .create-btn:hover {
          background: rgba(46, 160, 67, 0.2);
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display:flex;
          align-item:center;
          justify-content:center;
          flex-direction:column;
          gap:10px
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid rgba(248, 81, 73, 0.2);
          border-radius: 8px;
          color: #ff7b72;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(248, 81, 73, 0.2);
        }

        .main-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          margin-left:0px
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .main-header h1 {
          margin: 0 0 8px;
          font-size: 2.25rem;
          font-weight: 700;
          background: linear-gradient(90deg, #58a6ff, #1f6feb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: #8b949e;
          margin: 0;
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.2s, border-color 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(88, 166, 255, 0.3);
        }

        .stat-card.primary {
          border-left: 4px solid #58a6ff;
        }

        .stat-card.secondary {
          border-left: 4px solid #2ea043;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-card.primary .stat-icon {
          background: rgba(88, 166, 255, 0.2);
          color: #58a6ff;
        }

        .stat-card.secondary .stat-icon {
          background: rgba(46, 160, 67, 0.2);
          color: #2ea043;
        }

        .stat-content {
          flex: 1;
        }

        .stat-content h3 {
          margin: 0 0 8px;
          font-size: 0.9rem;
          color: #8b949e;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-number {
          margin: 0 0 4px;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-desc {
          margin: 0;
          color: #8b949e;
          font-size: 0.9rem;
        }

        .content-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .section-header h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
        }

        .section-header p {
          margin: 0;
          color: #8b949e;
          font-size: 0.95rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(90deg, #58a6ff, #1f6feb);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }

        .content-grid {
          min-height: 300px;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .loading-content p {
          margin-top: 16px;
          color: #8b949e;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          margin: 0 0 12px;
          font-size: 1.5rem;
          color: #fff;
        }

        .empty-state p {
          margin: 0 0 24px;
          color: #8b949e;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(90deg, #58a6ff, #1f6feb);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          margin: 0 auto;
          transition: all 0.2s;
        }

        .cta-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .book-item {
          position: relative;
        }

        .item-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .action-btn.edit {
          background: rgba(88, 166, 255, 0.2);
          color: #58a6ff;
        }

        .action-btn.edit:hover {
          background: rgba(88, 166, 255, 0.3);
          transform: scale(1.1);
        }

        .action-btn.delete {
          background: rgba(248, 81, 73, 0.2);
          color: #ff7b72;
        }

        .action-btn.delete:hover {
          background: rgba(248, 81, 73, 0.3);
          transform: scale(1.1);
        }

        .libraries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .library-item {
          transition: transform 0.2s;
        }

        .library-item:hover {
          transform: translateY(-4px);
        }

        @media (max-width: 1024px) {
          .dashboard-container {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            padding: 16px;
          }

          .sidebar-nav {
            padding: 16px 0;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 20px;
          }

          .main-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .section-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
            text-align: center;
          }

          .add-btn {
            justify-content: center;
          }

          .books-grid,
          .libraries-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
          .chat-with-ai {
            position: absolute;
            bottom: 0;
            z-index: 1;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
}