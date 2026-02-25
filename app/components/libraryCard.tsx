'use client'
import React, { useEffect, useState } from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardMedia, Typography, Box, Stack, Chip, ButtonBase } from '@mui/material';

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

const randomLibraryCovers: string[] = [
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop"
];

const LibraryCard = ({ library, onEdit, onDelete }: LibraryCardProps) => {
  const [coverImage, setCoverImage] = useState<string>(randomLibraryCovers[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * randomLibraryCovers.length);
    setCoverImage(randomLibraryCovers[randomIndex]);
  }, []);

  return (
    <Card 
      sx={{ 
        bgcolor: '#0a0a0a',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        height: 380,
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        '&:hover .library-cover': { transform: 'scale(1.04)' }
      }}
    >
      <CardMedia
        component="img"
        className="library-cover"
        image={coverImage}
        alt={library.name}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = "/default-library.webp";
        }}
        sx={{ 
          position: 'absolute',
          inset: 0,
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          transition: 'transform 0.5s ease-out',
        }}
      />

      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.95) 100%)',
        }} 
      />

      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          right: 16, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Chip 
          label={library.category ? (library.category.length < 15 ? library.category : library.category.slice(0, 15) + '...') : 'LIBRARY'}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            height: '26px',
            border: 'none'
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <ButtonBase 
              onClick={onEdit}
              sx={{
                bgcolor: 'rgba(88, 166, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#58a6ff',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(88, 166, 255, 0.3)',
                }
              }}
            >
              <Edit2 size={16} />
            </ButtonBase>
          )}
          {onDelete && (
            <ButtonBase 
              onClick={onDelete}
              sx={{
                bgcolor: 'rgba(248, 81, 73, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#ff7b72',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(248, 81, 73, 0.3)',
                }
              }}
            >
              <Trash2 size={16} />
            </ButtonBase>
          )}
        </Box>
      </Box>

      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        <Link 
          href={`/LibraryBooks?id=${library._id}`}
          style={{ textDecoration: 'none' }}
        > 
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 700,
              lineHeight: 1.2,
              transition: 'color 0.2s',
              '&:hover': { color: '#e2e2e2' }
            }}
          >
            {library.name.length < 40 ? library.name : library.name.slice(0, 40) + '...'}
          </Typography>
        </Link>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <MapPin size={14} color="#a1a1aa" />
            <Typography sx={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 500 }}>
              {library.address.length < 45 ? library.address : library.address.slice(0, 45) + '...'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
};

export default LibraryCard;