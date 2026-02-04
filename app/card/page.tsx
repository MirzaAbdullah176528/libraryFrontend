'use client'
import React from 'react';
import { FiUser, FiMapPin } from 'react-icons/fi';

interface BookProps {
  _id: string;
  name: string;
  category: string;
  image?: string;
  Created_By?: {
    username: string;
  };
  library?: {
    name: string;
  };
}

const BookCard = ({ book }: { book: BookProps }) => {
  return (
    <div className="book-card">
      <div className="book-image-container">
        <div className="book-overlay" />
        <img 
          src={'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'} 
          alt={book.name} 
          className="book-image"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Cover";
          }}
        />
        <span className="book-category">{book.category}</span>
      </div>
      
      <div className="book-details">
        <h3 className="book-title">{book.name}</h3>
        
        <div className="book-meta">
          <div className="meta-item">
            <FiUser size={14} />
            <span>{book.Created_By?.username || 'System'}</span>
          </div>
          <div className="meta-item">
            <FiMapPin size={14} />
            <span>{book.library?.name || 'Main Vault'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .book-image-container {
          height: 220px;
          position: relative;
          overflow: hidden;
        }
        .book-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .book-card:hover .book-image { transform: scale(1.1); }
        .book-category {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          color: white;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .book-details { padding: 24px; }
        .book-title { margin: 0 0 16px 0; color: #fff; font-size: 1.1rem; }
        .book-meta { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #30363d; padding-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #8b949e; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default BookCard;