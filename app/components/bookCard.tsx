'use client'
import React from 'react';
import { User, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Url } from 'node:url';

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
  author?: string;
  pdfLink?: Url;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const BookCard = ({ book }: { book: BookProps }) => {
  
  const getImageUrl = (imagePath?: string) => {
    
    if (!imagePath) return "/reading books is a key of success.webp";
    
    if (imagePath.startsWith('http')) return imagePath;
    
    return `${BASE_URL}${imagePath}`;
  };

  return (
    <div className="book-card">
      <div className="book-image-container">
        <div className="book-overlay" />
        <img 
          src={getImageUrl(book.image)} 
          alt={book.name} 
          className="book-image"
          onError={(e) => {
            e.currentTarget.src = "/reading books is a key of success.webp";
          }}
        />
        <span className="book-category">{ book.category.length < 20 ? book.category : book.category.slice(0,20)+'...' }</span>
      </div>
      
      <div className="book-details">
        <Link href={book.pdfLink || 'https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf'} target='_blank'> 
          <button className="book-title">{book.name.length < 25 ? book.name : book.name.slice(0, 25)}</button>
        </Link>
        
        <div className="book-meta">
          <div className="meta-item">
            <div style={{display:'flex' , alignItems:'center' , justifyContent:'center'}}>
              <User size={14} />
              <span>{"By " + book.Created_By?.username || 'User'}</span>
            </div>
            <span>{book.author || 'No spacified'}</span>
          </div>
          <div className="meta-item">
            <div style={{display:'flex' , alignItems:'center' , justifyContent:'center'}}>
              <MapPin size={14} />
              <span>Location</span>
            </div>
            <span>{book.library?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .book-image-container {
          height: 220px;
          position: relative;
          overflow: hidden;
          background: #0d1117;
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
          left: 16px;
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
        .book-title { margin: 0 0 16px 0; color: #fff; font-size: 1.1rem; background-color: transparent; border:none; cursor:pointer }
        .book-meta { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #30363d; padding-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #8b949e; font-size: 0.85rem; justify-content:space-between}
      `}</style>
    </div>
  );
};

export default BookCard;