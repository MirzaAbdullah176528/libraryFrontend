'use client'
import React, { useState } from 'react';
import { FiMapPin, FiArrowRight, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { apiService } from '../service/page';
import BookCard from '../card/page';
import Link from 'next/link';
import LibraryBooksPage from '../LibraryBooks/page';

interface LibraryProps {
  _id: string;
  name: string;
  address: string;
  category?: string;
}

interface LibraryCardProps {
  library: LibraryProps;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface Book {
  _id: string;
  name: string;
  category: string;
  image?: string;
  Created_By?: { username: string };
  library?: { name: string };
}

const LibraryCard = ({ library, onEdit, onDelete }: LibraryCardProps) => {

  return (
    <div className="library-card">
      <div className="library-card-header">
        <div className="icon-box">
          <FiMapPin size={24} />
        </div>
        <div className="library-actions">
          {onEdit && (
            <button 
              className="action-btn edit-btn"
              onClick={onEdit}
            >
              <FiEdit2 />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button 
              className="action-btn delete-btn"
              onClick={onDelete}
            >
              <FiTrash2 />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="info">
        <h3 className="lib-name">{library.name}</h3>
        {library.category && (
          <div className="library-category">
            {library.category}
          </div>
        )}
        <p className="lib-address">{library.address}</p>
      </div>

      <Link style={{textDecoration:'none'}} href={`/LibraryBooks?id=${library._id}`}>
        <button
        className="visit-btn">
          <span>View Books</span>
          <FiArrowRight />
        </button>
      </Link>

      <style jsx>{`
        .library-card {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
          transition: transform 0.2s;
        }

        .library-card:hover {
          transform: translateY(-4px);
        }

        .library-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .icon-box {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #1f6feb, #111827);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #58a6ff;
          box-shadow: 0 8px 20px rgba(31, 111, 235, 0.15);
        }

        .library-actions {
          display: flex;
          gap: 8px;
        }

        .info {
          flex: 1;
        }

        .lib-name {
          font-size: 1.25rem;
          margin: 0 0 12px 0;
          color: #fff;
          font-weight: 700;
        }

        .library-category {
          display: inline-block;
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .lib-address {
          margin: 0;
          color: #8b949e;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .visit-btn {
          width: 100%;
          padding: 14px;
          background: #21262d;
          border: 1px solid #30363d;
          color: #fff;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .visit-btn:hover {
          background: #58a6ff;
          color: #fff;
          border-color: #58a6ff;
        }

        .action-btn {
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          font-size: 0.9rem;
          border: none;
        }

        .edit-btn {
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          border: 1px solid rgba(88, 166, 255, 0.2);
        }

        .edit-btn:hover {
          background: rgba(88, 166, 255, 0.2);
          transform: translateY(-1px);
        }

        .delete-btn {
          background: rgba(248, 81, 73, 0.1);
          color: #ff7b72;
          border: 1px solid rgba(248, 81, 73, 0.2);
        }

        .delete-btn:hover {
          background: rgba(248, 81, 73, 0.2);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default LibraryCard;