'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, authService } from '../service/api';
import BookCard from './components/bookCard';
import LibraryCard from './components/libraryCard';
import { FiLogOut, FiLayers } from 'react-icons/fi';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';

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

type Stage = 'typing' | 'transitioning' | 'completed';

interface AnimatedNavbarProps {
  stage: Stage;
  setStage: React.Dispatch<React.SetStateAction<Stage>>;
  activeSection: 'books' | 'libraries';
  onSectionChange: (section: 'books' | 'libraries') => void;
  onLogout: () => void;
  router: any;
}

const AnimatedNavbar = ({
  stage,
  setStage,
  activeSection,
  onSectionChange,
  onLogout,
  router
}: AnimatedNavbarProps) => {
  const [charIndex, setCharIndex] = useState(0);
  const targetWord = "Libris";
  const typingSpeed = 150;
  const pauseDuration = 800;

  useEffect(() => {
    if (stage !== 'typing') return;

    let timer: NodeJS.Timeout;
    if (charIndex < targetWord.length) {
      timer = setTimeout(() => setCharIndex(prev => prev + 1), typingSpeed);
    } else {
      timer = setTimeout(() => setStage('transitioning'), pauseDuration);
    }

    return () => clearTimeout(timer);
  }, [charIndex, stage, targetWord.length, setStage]);

  useEffect(() => {
    if (stage === 'transitioning') {
      const timer = setTimeout(() => setStage('completed'), 1000);
      return () => clearTimeout(timer);
    }
  }, [stage, setStage]);

  const typedPart = targetWord.substring(0, charIndex);
  const untypedPart = targetWord.substring(charIndex);
  const progressPercentage = (charIndex / targetWord.length) * 100;
  const isNavbar = stage === 'transitioning' || stage === 'completed';
  const showNavItems = stage === 'completed';

  const navButtonStyle = (isActive: boolean) => ({
    color: isActive ? '#ffffff' : '#8b949e',
    background: 'transparent',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minWidth: 'auto',
    p: 0,
    pb: 0.5,
    borderRadius: 0,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: isActive ? '100%' : '0%',
      height: '2px',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      bgcolor: '#1A7B8E',
      transition: 'width 0.3s ease',
    },
    '&:hover': {
      background: 'transparent',
      color: '#ffffff',
    },
    '&:hover::after': {
      width: '100%',
    }
  });

  return (
    <Box sx={{
      position: 'fixed',
      top: isNavbar ? 0 : '50%',
      left: isNavbar ? 0 : '50%',
      transform: isNavbar ? 'translate(0, 0)' : 'translate(-50%, -50%)',
      width: isNavbar ? '100%' : '450px',
      height: isNavbar ? '72px' : '337px',
      backgroundImage: 'linear-gradient(180deg, rgba(0, 229, 255, 0.3 ) , #161b22)', 
      borderRadius: isNavbar ? 0 : '16px',
      border: isNavbar ? 'none' : '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: isNavbar ? '0 4px 20px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.5)',
      transition: 'all 1s cubic-bezier(0.85, 0, 0.15, 1)',
      zIndex: 1100,
    }}>
      
      <Stack direction="row" gap={4} sx={{
        position: 'absolute',
        left: '32px',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: showNavItems ? 1 : 0,
        pointerEvents: showNavItems ? 'auto' : 'none',
        transition: 'opacity 0.5s ease 0.2s',
      }}>
        <Button
          onClick={() => onSectionChange('books')}
          sx={navButtonStyle(activeSection === 'books')}
          disableRipple
        >
          Books
        </Button>
        <Button
          onClick={() => onSectionChange('libraries')}
          sx={navButtonStyle(activeSection === 'libraries')}
          disableRipple
        >
          Libraries
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          sx={navButtonStyle(false)}
          disableRipple
        >
          Dashboard
        </Button>
      </Stack>

      <Box sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'all 1s cubic-bezier(0.85, 0, 0.15, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        <Stack 
          direction="row" 
          alignItems="center" 
          gap={isNavbar ? "12px" : "20px"}
          sx={{ transition: 'gap 1s cubic-bezier(0.85, 0, 0.15, 1)' }}
        >
          <Box sx={{
            width: isNavbar ? 32 : 64, 
            height: isNavbar ? 32 : 64,
            bgcolor: '#8b949e',
            borderRadius: isNavbar ? '8px' : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'all 1s cubic-bezier(0.85, 0, 0.15, 1)',
            fontSize: isNavbar ? '1.2rem' : '2.5rem'
          }}>
            <FiLayers />
          </Box>
          <Typography sx={{
            fontSize: isNavbar ? '1.7rem' : '3.5rem',
            fontWeight: 800,
            color: '#8b949e',
            letterSpacing: '2px',
            transition: 'font-size 1s cubic-bezier(0.85, 0, 0.15, 1)',
            display: 'flex',
          }}>
            <span>{typedPart}</span>
            {!isNavbar && (
              <span style={{ opacity: 0, userSelect: 'none' , color:'#58a6ff' }}>
                {untypedPart}
              </span>
            )}
          </Typography>
        </Stack>

        <Box sx={{
          width: '100%',
          height: '3px',
          bgcolor: '#2a2a2a',
          position: 'absolute',
          bottom: isNavbar ? -16 : -24,
          left: 0,
          borderRadius: '2px',
          overflow: 'hidden',
          opacity: isNavbar ? 0 : 1,
          transition: 'all 0.4s ease',
        }}>
          <Box sx={{
            width: `${progressPercentage}%`,
            height: '100%',
            bgcolor: '#58a6ff',
            transition: 'width 0.1s linear'
          }} />
        </Box>
      </Box>

      <Box sx={{
        position: 'absolute',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: showNavItems ? 1 : 0,
        pointerEvents: showNavItems ? 'auto' : 'none',
        transition: 'opacity 0.5s ease 0.2s',
        display: 'flex',
        alignItems: 'center',
      }}>
        <IconButton
          onClick={onLogout}
          sx={{
            color: '#f85149',
            bgcolor: 'rgba(248, 81, 73, 0.1)',
            borderRadius: '8px',
            '&:hover': { bgcolor: 'rgba(248, 81, 73, 0.2)' }
          }}
        >
          <FiLogOut />
        </IconButton>
      </Box>
    </Box>
  );
};

export default function Home() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [view, setView] = useState<'books' | 'libraries'>('books');
  const [navbarStage, setNavbarStage] = useState<Stage>('typing');

  const fetchData = useCallback(async () => {
    try {
      if (view === 'books') {
        const res = await apiService.getBooks({});
        setBooks(res.result || []);
      } else {
        const res = await apiService.getLibraries({});
        setLibraries(res || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, [view]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [router, view, fetchData]);

  const handleLogout = () => {
    authService.logout();
  };

  const isReady = navbarStage === 'completed';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <AnimatedNavbar
        stage={navbarStage}
        setStage={setNavbarStage}
        activeSection={view}
        onSectionChange={setView}
        onLogout={handleLogout}
        router={router}
      />

      <Box
        component="main"
        sx={{
          pt: '100px',
          pb: 5,
          px: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          opacity: isReady ? 1 : 0,
          pointerEvents: isReady ? 'auto' : 'none',
          transition: 'opacity 0.8s ease 0.2s',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            {view === 'books' ? 'The Collection' : 'Library Network'}
          </Typography>
          <Typography sx={{ color: '#8b949e', fontSize: '1rem' }}>
            {view === 'books'
              ? 'Explore the curated list of available resources.'
              : 'Find a branch near you to visit.'}
          </Typography>
        </Box>

        {view === 'books' ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 3
          }}>
            {books.length > 0 ? (
              books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 10, bgcolor: '#161b22', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>No books found</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 3
          }}>
            {libraries.length > 0 ? (
              libraries.map((library) => (
                <LibraryCard key={library._id} library={library} />
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 10, bgcolor: '#161b22', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>No libraries found</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}