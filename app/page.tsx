'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, authService } from './service/page';
import Sidebar from './sidebar/page';
import BookCard from './card/page';
import LibraryCard from './libraryCard/page';
import { FiArrowRight } from 'react-icons/fi';

interface Book {
  _id: string;
  name: string;
  category: string;
  image?: string;
  Created_By?: { username: string };
  library?: { name: string };
}

interface Library {
  _id: string;
  name: string;
  address: string;
}

export default function Home() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'books' | 'libraries'>('books');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async (query: string = '') => {
    setLoading(true);
    try {
      if (view === 'books') {
        const filters = query ? { name: query } : {}; 
        const res = await apiService.getBooks(filters);
        setBooks(res.result || []); 
      } else {
        const filters = query ? { name: query } : {};
        const res = await apiService.getLibraries(filters);
        setLibraries(res || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchData(searchQuery);
    }
  }, [router, view, fetchData]); 

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    fetchData(q);
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeSection={view}
        onSectionChange={setView}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <div className="content-header">
          <div className="header-top-row">
            <div>
              <h1 className="section-title">
                {view === 'books' ? 'The Collection' : 'Library Network'}
              </h1>
              <p className="section-subtitle">
                {view === 'books' 
                  ? 'Explore the curated list of available resources.' 
                  : 'Find a branch near you to visit.'}
              </p>
            </div>
            
            <button className="dashboard-link-btn" onClick={() => router.push('/dashboard')}>
              <span>My Dashboard</span>
              <FiArrowRight />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {view === 'books' ? (
              <div className="books-grid">
                {books.length > 0 ? (
                  books.map((book) => (
                    <BookCard key={book._id} book={book} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No books found</h3>
                    <p>Try refining your search criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="libraries-grid">
                {libraries.length > 0 ? (
                  libraries.map((library) => (
                    <LibraryCard key={library._id} library={library} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No libraries found</h3>
                    <p>There are no branches matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .header-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .dashboard-link-btn {
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          border: 1px solid rgba(88, 166, 255, 0.2);
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .dashboard-link-btn:hover {
          background: rgba(88, 166, 255, 0.2);
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}