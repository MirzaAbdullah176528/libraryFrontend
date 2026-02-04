'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiEye, FiEyeOff, FiLock, FiArrowRight, FiLayers } from 'react-icons/fi';
import { authService } from '../service/page';

type props = { 
    headerText?: string; 
    apiUrl?: string; 
    btnTextLoading?: string; 
    btnText?: string;
}

const LoginPage = ({ 
    headerText = 'Welcome Back', 
    apiUrl = '/login', 
    btnTextLoading = 'Processing...', 
    btnText = 'Log In' 
}: props) => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isSignup = apiUrl.includes('signup');
    
    const [formData, setFormData] = useState({
        Username: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if(error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const action = isSignup ? authService.signup : authService.login;
            const data = await action(formData);

            if (data?.token) {
                localStorage.setItem('token', data.token);
            }
            if (isSignup && !data.token) {
                 router.push('/login');
            } else {
                 router.push('/');
            }

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="form-side">
                    <div className="brand-header">
                        <div className="logo-icon">
                            <FiLayers />
                        </div>
                        <span className="brand-name">Libris</span>
                    </div>

                    <div className="auth-content">
                        <header>
                            <h1 className="title">{headerText}</h1>
                            <p className="subtitle">
                                {isSignup ? 'Already a member?' : 'New to Libris?'}
                                <Link href={isSignup ? "/login" : "/signup"} className="auth-link">
                                    {isSignup ? 'Log in' : 'Create account'}
                                </Link>
                            </p>
                        </header>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label>Username</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        name="Username"
                                        placeholder="Enter your username"
                                        value={formData.Username}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                <span>{loading ? btnTextLoading : btnText}</span>
                                {!loading && <FiArrowRight />}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="visual-side">
                    <div className="visual-content">
                        <h2>Curated Knowledge.</h2>
                        <p>Access thousands of resources from our distributed library network.</p>
                    </div>
                    <div className="visual-overlay" />
                    <img 
                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2828" 
                        alt="Library" 
                        className="visual-bg"
                    />
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0f1115;
                    padding: 24px;
                }

                .auth-card {
                    width: 100%;
                    max-width: 1000px;
                    height: 600px;
                    background: #161b22;
                    border-radius: 32px;
                    overflow: hidden;
                    display: flex;
                    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .form-side {
                    flex: 1;
                    padding: 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .brand-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
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
                }

                .brand-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.5px;
                }

                .auth-content {
                    width: 100%;
                    max-width: 360px;
                    margin: 0 auto;
                }

                .title {
                    font-size: 2rem;
                    color: white;
                    margin: 0 0 8px 0;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                .subtitle {
                    color: #8b949e;
                    margin: 0 0 32px 0;
                    font-size: 0.95rem;
                }

                .auth-link {
                    color: #58a6ff;
                    text-decoration: none;
                    margin-left: 6px;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .auth-link:hover { color: #79c0ff; }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .input-group label {
                    display: block;
                    color: #8b949e;
                    font-size: 0.85rem;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #8b949e;
                    font-size: 18px;
                    z-index: 2;
                }

                .form-input {
                    width: 100%;
                    background: #0d1117;
                    border: 1px solid #30363d;
                    border-radius: 12px;
                    padding: 14px 16px 14px 48px;
                    color: white;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #58a6ff;
                    box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.1);
                    background: #161b22;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    background: none;
                    border: none;
                    color: #8b949e;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    transition: color 0.2s;
                }

                .password-toggle:hover { color: white; }

                .submit-btn {
                    margin-top: 8px;
                    width: 100%;
                    background: linear-gradient(180deg, #238636, #2ea043);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(46, 160, 67, 0.2);
                }

                .submit-btn:hover:not(:disabled) {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(46, 160, 67, 0.3);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    filter: grayscale(0.5);
                }

                .error-message {
                    background: rgba(248, 81, 73, 0.1);
                    color: #ff7b72;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    margin-bottom: 24px;
                    border: 1px solid rgba(248, 81, 73, 0.2);
                }

                .footer-meta {
                    color: #484f58;
                    font-size: 0.8rem;
                    text-align: center;
                }

                .visual-side {
                    flex: 1;
                    position: relative;
                    display: none;
                }

                .visual-bg {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .visual-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(15, 17, 21, 0.9), rgba(15, 17, 21, 0.2));
                }

                .visual-content {
                    position: absolute;
                    bottom: 48px;
                    left: 48px;
                    right: 48px;
                    z-index: 10;
                }

                .visual-content h2 {
                    font-size: 2.5rem;
                    color: white;
                    margin: 0 0 16px 0;
                    line-height: 1.1;
                }

                .visual-content p {
                    color: rgba(255,255,255,0.8);
                    font-size: 1.1rem;
                    line-height: 1.5;
                }

                @media (min-width: 900px) {
                    .visual-side { display: block; }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;