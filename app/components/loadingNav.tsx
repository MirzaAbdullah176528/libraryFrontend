'use client'

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, IconButton } from '@mui/material';
import { FiLogOut } from 'react-icons/fi';

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
  const targetWord = "LIBRIS";
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
  const progressPercentage = (charIndex / targetWord.length) * 100;
  const isNavbar = stage === 'transitioning' || stage === 'completed';

  const navButtonStyle = (isActive: boolean) => ({
    color: isActive ? '#ffffff' : '#8b949e',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    minWidth: 'auto',
    p: 0,
    position: 'relative',
    backgroundColor: 'transparent',
    transition: 'color 0.3s ease',
    '&:after': {
      content: '""',
      position: 'absolute',
      width: isActive ? '100%' : '0%',
      height: '2px',
      bottom: -4,
      left: 0,
      backgroundColor: '#ffffff',
      transition: 'width 0.3s ease',
    },
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#ffffff',
      '&:after': {
        width: '100%',
      }
    }
  });

  return (
    <Box sx={{
      position: 'fixed',
      top: isNavbar ? 0 : '50%',
      left: isNavbar ? 0 : '50%',
      transform: isNavbar ? 'none' : 'translate(-50%, -50%)',
      width: isNavbar ? '100%' : '450px',
      height: isNavbar ? '72px' : '337px',
      bgcolor: isNavbar ? '#0A0F14' : '#050505',
      borderRadius: isNavbar ? 0 : '16px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      transition: 'all 1s cubic-bezier(0.85, 0, 0.15, 1)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      px: 4
    }}>
      
      {/* Left Section: Navigation Buttons */}
      <Stack 
        direction="row" 
        spacing={4} 
        sx={{ 
          flex: 1,
          opacity: isNavbar ? 1 : 0,
          transition: 'opacity 0.5s ease 0.8s',
          display: isNavbar ? 'flex' : 'none'
        }}
      >
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

      {/* Center Section: Logo */}
      <Box sx={{
        position: isNavbar ? 'absolute' : 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <Typography sx={{
          fontSize: isNavbar ? '1.4rem' : '3rem',
          fontWeight: 800,
          letterSpacing: '0.2em',
          color: '#ffffff',
          transition: 'font-size 1s cubic-bezier(0.85, 0, 0.15, 1)',
        }}>
          {typedPart}
        </Typography>

        {/* Loading Bar - only visible during typing stage */}
        {!isNavbar && (
          <Box sx={{
            width: '100%',
            height: '3px',
            bgcolor: '#2a2a2a',
            mt: 2,
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <Box sx={{
              width: `${progressPercentage}%`,
              height: '100%',
              bgcolor: '#ffffff',
              transition: 'width 0.1s linear'
            }} />
          </Box>
        )}
      </Box>

      {/* Right Section: Logout */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'flex-end',
        opacity: isNavbar ? 1 : 0,
        transition: 'opacity 0.5s ease 0.8s'
      }}>
        {isNavbar && (
          <IconButton
            onClick={onLogout}
            sx={{
              color: '#f85149',
              p: 1,
              '&:hover': { bgcolor: 'rgba(248, 81, 73, 0.1)' }
            }}
          >
            <FiLogOut size={20} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default AnimatedNavbar;