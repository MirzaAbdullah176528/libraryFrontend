'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookCard from '../components/bookCard';
import { apiService } from '../../service/api';
import { Suspense } from 'react';

interface Book {
  _id: string;
  name: string;
  category: string;
  image?: string;
  Created_By?: { username: string };
  library?: { name: string };
}

function LibraryPage() {
  const searchParams = useSearchParams();
  const libraryId = searchParams.get('id');

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      if (!libraryId) return;

      try {
        const res = await apiService.getLibraryBooks(libraryId);
        setBooks(res.books ?? []);
      } catch (error) {
        console.error("Failed to fetch library books", error);
      } finally {
        setLoading(false);
      }
    }

    if (libraryId) {
      fetchBooks();
    } else {
      setLoading(false);
    }
  }, [libraryId]);

  if (loading) {
    return (
      <div className="page-container loading">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
        <style jsx>{`
          .page-container.loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #8b949e;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #58a6ff;
            border-radius: 50%;
            animation: spin 1s infinite linear;
            margin-bottom: 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!libraryId) {
    return (
      <div className="page-container">
        <p>No library specified.</p>
        <style jsx>{`
          .page-container { padding: 40px; color: #fff; text-align: center; }
        `}</style>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="page-container">
        <h2>Library Books</h2>
        <div className="empty-state">
          <p>No books found in this library.</p>
        </div>
        <style jsx>{`
          .page-container { padding: 40px; color: #fff; min-height: 100vh; background: #0f1115; }
          h2 { margin-bottom: 30px; font-size: 2rem; color: #fff; }
          .empty-state {
            padding: 40px;
            background: #161b22;
            border-radius: 16px;
            border: 1px dashed #30363d;
            text-align: center;
            color: #8b949e;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="header">
        <h2>Library Collection</h2>
        <p className="subtitle">Browsing books in this library</p>
      </div>

      <div className="books-grid">
        {books.map(book => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>

      <style jsx>{`
        .page-container {
          padding: 48px;
          min-height: 100vh;
          background: #0f1115;
          color: #fff;
        }

        .header {
          margin-bottom: 40px;
        }

        h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(90deg, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #8b949e;
          margin: 0;
          font-size: 1.1rem;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


export default function LibraryBooksPage() {
  return (
    <Suspense fallback={<div>Loading </div>}>
      <LibraryPage />
    </Suspense>
  );
}