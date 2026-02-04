import React from 'react';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';

interface LibraryProps {
  _id: string;
  name: string;
  address: string;
}

const LibraryCard = ({ library }: { library: LibraryProps }) => {
  return (
    <div className="library-card">
      <div className="icon-box">
        <FiMapPin size={24} />
      </div>
      
      <div className="info">
        <h3 className="lib-name">{library.name}</h3>
        <p className="lib-address">{library.address}</p>
      </div>

      <button className="visit-btn">
        <span>Visit Branch</span>
        <FiArrowRight />
      </button>

      <style jsx>{`
        .library-card { padding: 32px; display: flex; flex-direction: column; align-items: flex-start; gap: 24px; height: 100%; }
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
        .info { flex: 1; }
        .lib-name { font-size: 1.25rem; margin: 0 0 8px 0; color: #fff; font-weight: 700; }
        .lib-address { margin: 0; color: #8b949e; line-height: 1.5; font-size: 0.95rem; }
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
        .visit-btn:hover { background: #58a6ff; color: #fff; border-color: #58a6ff; }
      `}</style>
    </div>
  );
};

export default LibraryCard;