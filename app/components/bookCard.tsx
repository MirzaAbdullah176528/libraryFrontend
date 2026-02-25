'use client'
import React, { useEffect, useState } from 'react';
import { User, MapPin, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/service/api';
import { 
  Card, CardMedia, Typography, Box, Stack, Chip, ButtonBase, 
  Dialog, DialogTitle, DialogContent, IconButton, CircularProgress 
} from '@mui/material';

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
  pdfLink?: string;
}

interface Summary {
  name?: string;
  category?: string;
  author?: string;
}

const randomBookCovers: string[] = [
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=800&auto=format&fit=crop"
];

const BookCard = ({ book }: { book: BookProps }) => {
  const [summaryData, setSummaryData] = useState<Summary>();
  const [coverImage, setCoverImage] = useState<string>(randomBookCovers[0]);
  
  // New state variables for the summary popup
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState<string>('');

  useEffect(() => {
    const bookData = {
      name: book.name,
      author: book.author || '',
      category: book.category
    };
    setSummaryData(bookData);

    const randomIndex = Math.floor(Math.random() * randomBookCovers.length);
    setCoverImage(randomBookCovers[randomIndex]);
  }, [book]);

  const getSummary = async () => {
    if (summaryData && summaryData.name && summaryData.category) {
      setIsSummaryOpen(true);
      setIsLoadingSummary(true);
      setSummaryText(''); // Clear previous summary
      
      try {
        const response = await apiService.getSummary({
          name: summaryData.name,
          category: summaryData.category,
          author: summaryData.author || 'Not specified'
        });
        
        // Extracting text from response (adjust this based on your exact API return structure)
        const fetchedSummary = typeof response === 'string' 
          ? response 
          : (response?.summary || response?.data || 'Summary generated successfully, but format is unrecognized.');
          
        setSummaryText(fetchedSummary);
      } catch (error) {
        console.error(error);
        setSummaryText('Failed to generate summary. Please try again later.');
      } finally {
        setIsLoadingSummary(false);
      }
    }    
  };

  return (
    <>
      <Card 
        sx={{ 
          bgcolor: '#0a0a0a',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          height: 380,
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          '&:hover .book-cover': { transform: 'scale(1.04)' }
        }}
      >
        <CardMedia
          component="img"
          className="book-cover"
          image={coverImage}
          alt={book.name}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "/reading books is a key of success.webp";
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
            label={book.category.length < 15 ? book.category : book.category.slice(0, 15) + '...'}
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
          <ButtonBase 
            onClick={getSummary}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'background-color 0.2s',
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(0, 229, 255, 0.2)', // Matches the cyan theme on hover
                borderColor: 'rgba(0, 229, 255, 0.4)'
              }
            }}
          >
            Summary
          </ButtonBase>
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
            href={book.pdfLink || '#'} 
            target='_blank'
            style={{ textDecoration: 'none' }}
          > 
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 700,
                lineHeight: 1.2,
                transition: 'color 0.2s',
                '&:hover': { color: '#00E5FF' } // Shifted to match your cyan theme
              }}
            >
              {book.name.length < 40 ? book.name : book.name.slice(0, 40) + '...'}
            </Typography>
          </Link>

          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <User size={14} color="#a1a1aa" />
                <Typography sx={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 500 }}>
                  {book.Created_By?.username || 'Unknown'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <BookOpen size={14} color="#a1a1aa" />
                <Typography sx={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 500 }}>
                  {book.author && book.author.length < 15 ? book.author : (book.author?.slice(0, 15) + '...') || 'Unknown'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <MapPin size={14} color="#a1a1aa" />
              <Typography sx={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 500 }}>
                {book.library?.name || 'Unassigned'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Card>


      <Dialog 
        open={isSummaryOpen} 
        onClose={() => setIsSummaryOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0A0F14',
            color: '#FFFAFA',
            borderRadius: '24px',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            backgroundImage: 'linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(10, 15, 20, 1) 100%)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          }
        }}
        BackdropProps={{
          sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          p: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>
            Book Summary
          </Typography>
          <IconButton 
            onClick={() => setIsSummaryOpen(false)}
            sx={{ color: '#8b949e', '&:hover': { color: '#ff7b72', bgcolor: 'rgba(248, 81, 73, 0.1)' } }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, minHeight: '150px' }}>
          {isLoadingSummary ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, gap: 2 }}>
              <CircularProgress sx={{ color: '#00E5FF' }} />
              <Typography sx={{ color: '#8b949e', fontSize: '0.9rem' }}>Analyzing text...</Typography>
            </Box>
          ) : (
            <Typography sx={{ color: '#b0b8c1', fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {summaryText}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookCard;