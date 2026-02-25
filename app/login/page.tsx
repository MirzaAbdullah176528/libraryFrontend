'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiEye, FiEyeOff, FiLock, FiArrowRight, FiLayers } from 'react-icons/fi';
import { authService } from '../../service/api';
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
    InputAdornment,
} from '@mui/material';

import AOS from 'aos';
import 'aos/dist/aos.css';

type Props = {
    headerText?: string;
    apiUrl?: string;
    btnTextLoading?: string;
    btnText?: string;
}

const LoginPage = ({
    headerText = 'Login',
    apiUrl = '/login',
    btnTextLoading = 'Processing...',
    btnText = 'Log In'
}: Props) => {
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
        if (error) setError('');
    };

    const triggerExitAnimationAndNavigate = (path: string) => {
        const elements = document.querySelectorAll('[data-aos]');
        elements.forEach(el => el.classList.remove('aos-animate'));

        setTimeout(() => {
            router.push(path);
        }, 800);
    };

    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        triggerExitAnimationAndNavigate(path);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const action = isSignup ? authService.signup : authService.login;
            if(formData.password.length >= 6 && formData.Username.length >= 6){
                const data =await action(formData);
                if (data?.token) {
                    localStorage.setItem('token', data.token);
                }
            const nextPath = (isSignup && !data.token) ? '/login' : '/';
            triggerExitAnimationAndNavigate(nextPath);
            }
            setError('UserName and password should be longer then 6')
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
            backgroundImage: 'linear-gradient(180deg, rgb(0, 229, 255) , #0A0F14)',            
        }}>
            <Box sx={{
                width: '100%',
                maxWidth: '1000px',
                height: '600px',
                background: '#0A0F14',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 10px 20px 0px #00E5FF',
                border: '1px solid rgba(255,255,255,0.05)',
                zIndex: 50,
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '0.85fr 1fr' },
                    width: '100%',
                    height: '100%',
                }}>
                    <Box
                    data-aos="fade-right"
                    sx={{
                        padding: '48px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor:'#0A0F14',
                        clipPath: 'polygon(0 0, 85% 0, 90% 100%, 0 100%)',
                    }}>
                        <Box sx={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>

                            <Box component="header">
                                <Typography sx={{
                                    fontSize: '1.84rem',
                                    color: 'white',
                                    fontWeight: 800,
                                    letterSpacing: '0.10rem',
                                    display:'flex',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    mb:'30px'
                                }}>
                                    {headerText}
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{
                                    background: 'rgba(248, 81, 73, 0.1)',
                                    color: '#ff7b72',
                                    border: '1px solid rgba(248, 81, 73, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    mb: '24px',
                                }}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: '50px' }}>
                                <Stack gap="10px">
                                    <TextField
                                        type="text"
                                        name="Username"
                                        placeholder="Enter your username"
                                        value={formData.Username}
                                        onChange={handleChange}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiUser color="#8b949e" size={18} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '0.95rem',
                                                borderTop:'none',
                                                '& fieldset': {
                                                    boxShadow: '0 5px 3px -2px rgb(160, 170, 178)' ,
                                                    borderTop: 'none',
                                                    borderLeft: 'none',
                                                    borderRight: 'none',
                                                    borderRadius: 0,
                                                },
                                            },
                                            '& input::placeholder': { color: '#8b949e', opacity: 1 },
                                        }}
                                    />
                                </Stack>

                                <Stack gap="10px">
                                    <TextField
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiLock color="#8b949e" size={18} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: '#8b949e', '&:hover': { color: 'white' } }}
                                                    >
                                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '0.95rem',
                                                '& fieldset': { 
                                                    boxShadow: '0 5px 3px -2px rgb(160, 170, 178)' ,
                                                    borderTop: 'none',
                                                    borderLeft: 'none',
                                                    borderRight: 'none',
                                                    borderRadius: 0,
                                                },
                                                '&:hover fieldset': { borderColor: '#58a6ff' },
                                                '&.Mui-focused fieldset': { borderColor: '#58a6ff', boxShadow: '0 0 0 4px rgba(88,166,255,0.1)' },
                                                '&.Mui-focused': { background: '#161b22' },
                                            },
                                            '& input::placeholder': { color: '#8b949e', opacity: 1 },
                                        }}
                                    />
                                </Stack>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    endIcon={!loading ? <FiArrowRight /> : undefined}
                                    sx={{
                                        mt: '10px',
                                        width: '100%',
                                        backgroundImage: 'linear-gradient(10deg, rgb(0, 229, 255 ) , #0A0F14)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '14px',
                                        borderRadius: '50px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(46,160,67,0.2)',
                                        '&:hover:not(:disabled)': {
                                            filter: 'brightness(1.1)',
                                            transform: 'translateY(-1px)',
                                            backgroundImage: 'linear-gradient(10deg, rgba(0, 229, 255 , 0.1) , #0A0F14)',
                                        },
                                        '&:disabled': {
                                            opacity: 0.7,
                                            cursor: 'not-allowed',
                                            filter: 'grayscale(0.5)',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    {loading ? btnTextLoading : btnText}
                                </Button>

                                <Stack direction="column" gap="15px" sx={{ 
                                    color: '#8b949e', 
                                    fontSize: '0.95rem',
                                    display:'flex',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    flexDirection:'column',
                                    mt:'-20px'
                                    }}>
                                    <Typography sx={{ 
                                        color: '#8b949e', 
                                        fontSize: '0.95rem', 
                                        width:'100%',
                                        display:'flex',
                                        alignItems:'center',
                                        justifyContent:'center', 
                                    }}>
                                        {isSignup ? 'Already a member?' : 'New to Libris? Create account here'}
                                    </Typography>
                                    <Typography 
                                        component="a" 
                                        href={isSignup ? "/login" : "/signup"}
                                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavigation(e, isSignup ? "/login" : "/signup")}
                                        sx={{
                                            color: '#58a6ff',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            width:'100%',
                                            display:'flex',
                                            alignItems:'center',
                                            justifyContent:'center',
                                            cursor: 'pointer',
                                    }}>
                                        {isSignup ? 'Log in' : 'Create account'}
                                    </Typography>
                                </Stack>

                            </Box>
                        </Box>
                    </Box>

                    <Box
                    data-aos="fade-left"
                    sx={{
                        position: 'relative',
                        display: { xs: 'none', md: 'flex' },
                        clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 20% 100%)', 
                        alignItems:'center',
                        justifyContent:'center',
                        bgcolor:'#1A7B8E'                    
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            left: '78px',
                            zIndex: 10,
                            p:'5px'
                        }}>
                            <Stack direction="row" alignItems="center" gap="12px" >
                                <Box sx={{
                                    width: 32, height: 32,
                                    background: 'linear-gradient(to top, rgba(15,17,21,0.9), #58a6ff )',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    mb: '10px',
                                    m:'5px'
                                }}>
                                    <FiLayers />
                                </Box>
                                <Typography sx={{
                                    fontSize: '1.7rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                    letterSpacing: '2px',
                                    mb: '10px',
                                }}>
                                    Libris
                                </Typography>
                            </Stack>

                            <Typography variant="h2" sx={{
                                fontSize: '2.5rem',
                                color: 'white',
                                margin: '0 0 16px 0',
                                lineHeight: 1.1,
                            }}>
                                Curated Knowledge.
                            </Typography>
                            <Typography sx={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '1.1rem',
                                lineHeight: 1.5
                            }}>
                                Access thousands of research papers from our distributed library network.
                            </Typography>
                        </Box>

                        <Box sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(15,17,21,0.9), rgba(15,17,21,0.2))',
                            zIndex: 1,
                        }} />
                    </Box>

                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;