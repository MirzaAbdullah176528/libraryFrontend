'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../service/api';
import { authService } from '../../service/auth';
import { FiUser, FiHash, FiLogOut, FiTrash2 } from 'react-icons/fi';

interface UserProfile {
  _id: string;
  Username: string;
  avatar: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function getUser() {
    let currentUser = await authService.getCurrentUser();

    if (currentUser) {
      const userId = currentUser.userId || currentUser._id || currentUser.id;
      try {
        let userData = await apiService.getProfile(userId)
        if (userData) {
          const normalizedUser = {
            _id: userData._id,
            Username: userData.Username,
            avatar: userData.avatar
          }
          setUser(normalizedUser);
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    getUser();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/auth/delete/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        authService.logout();
        router.push('/login');
      } else {
        const data = await response.json();
        alert(data.message || data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while trying to delete the account.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '20px', color: '#58a6ff' }}>Loading Profile...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #0d1117;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(88, 166, 255, 0.3);
            border-radius: 50%;
            border-top-color: #58a6ff;
            animation: spin 1s ease-in-out infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="glass-panel side-form">
        <div className="avatar-section">
            <div className="avatar-wrapper">
             {user?.avatar ? (
                <img 
                    src={`${BASE_URL}${user.avatar}`} 
                    alt="Profile" 
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150/0d1117/58a6ff?text=User"}} 
                />
             ) : (
                <div className="avatar-placeholder"><FiUser /></div>
             )}
            </div>
          <h2 className="user-greeting">Welcome, {user?.Username || 'User'}</h2>
        </div>

        <div className="form-content">
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input type="text" value={user?.Username || ''} readOnly className="glass-input" />
            </div>
          </div>

          <div className="input-group">
            <label>User ID</label>
            <div className="input-wrapper">
              <FiHash className="input-icon" />
              <input type="text" value={user?._id || ''} readOnly className="glass-input mono" />
            </div>
          </div>
        </div>

        <div className="actions-section">
            <button onClick={handleLogout} className="action-btn logout-btn">
                <FiLogOut /> <span>Sign Out</span>
            </button>

            <button 
                onClick={handleDeleteAccount} 
                className="action-btn delete-btn"
                disabled={deleteLoading}
            >
                {deleteLoading ? <span className="spinner-sm"></span> : <FiTrash2 />} 
                <span>{deleteLoading ? 'Deleting...' : 'Delete Account'}</span>
            </button>
        </div>
      </div>
      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background-color: #0d1117;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .side-form {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          border-radius: 24px;
          background: rgba(22, 27, 34, 0.8);
          border: 1px solid rgba(88, 166, 255, 0.2);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .avatar-section { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .avatar-wrapper {
          position: relative; width: 100px; height: 100px; border-radius: 50%;
          background: #0d1117; border: 2px solid #58a6ff; display: flex;
          align-items: center; justify-content: center; overflow: hidden;
        }
        .avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { font-size: 40px; color: #58a6ff; display: flex; align-items: center; justify-content: center; }
        
        .user-greeting { color: #e6edf3; font-size: 20px; font-weight: 600; margin: 0; }
        .form-content { display: flex; flex-direction: column; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { color: #8b949e; font-size: 13px; font-weight: 500; margin-left: 4px; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: #58a6ff; font-size: 18px; z-index: 1; }
        .glass-input {
          width: 100%; background: rgba(13, 17, 23, 0.6);
          border: 1px solid rgba(48, 54, 61, 0.8); border-radius: 12px;
          padding: 12px 16px 12px 42px; color: #c9d1d9; font-size: 14px; outline: none;
        }
        .mono { font-family: monospace; color: #79c0ff; }
        
        .actions-section {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .action-btn {
          padding: 12px; border-radius: 12px;
          font-weight: 600; cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px; border: 1px solid transparent;
          transition: all 0.2s;
        }

        .logout-btn {
          background: rgba(88, 166, 255, 0.1); color: #58a6ff;
          border-color: rgba(88, 166, 255, 0.2);
        }
        .logout-btn:hover {
            background: rgba(88, 166, 255, 0.2);
        }

        .delete-btn {
          background: rgba(248, 81, 73, 0.1); color: #f85149;
          border-color: rgba(248, 81, 73, 0.2);
        }
        .delete-btn:hover:not(:disabled) {
           background: rgba(248, 81, 73, 0.2);
           transform: translateY(-1px);
        }
        .delete-btn:disabled {
            opacity: 0.7; cursor: not-allowed;
        }

        .spinner-sm {
            width: 16px; height: 16px; border: 2px solid currentColor;
            border-top-color: transparent; border-radius: 50%;
            animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}