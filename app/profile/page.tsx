'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../service/api';
import { authService } from '../../service/auth';
import { FiUser, FiHash, FiLock, FiLogOut, FiCamera } from 'react-icons/fi';

interface UserProfile {
  _id: string;
  Username: string;
  avatar: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);

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
          _id: userData._id,
          Username: userData.Username,
          avatar: userData.avatar
        }

        setUser(normalizedUser);
      }
    }
  }

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const initProfile = async () => {
      try {
        const localUser = authService.getCurrentUser();

        const userId = localUser?.userId || localUser?._id || localUser?.id;


        if (!userId) {
          return;
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [router]);

  useEffect(() => {
    getUser()
    console.log(user)
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
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

        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> <span>Sign Out</span>
        </button>
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
          align-items: center; justify-content: center;
        }
        .avatar-wrapper img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder { font-size: 40px; color: #58a6ff; }
        .edit-avatar-btn {
          position: absolute; bottom: 0; right: 0; background: #238636;
          border: none; color: white; width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
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
        .logout-btn {
          margin-top: auto; background: rgba(248, 81, 73, 0.1); color: #f85149;
          border: 1px solid rgba(248, 81, 73, 0.4); padding: 12px; border-radius: 12px;
          font-weight: 600; cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px;
        }
      `}</style>
    </div>
  );
}