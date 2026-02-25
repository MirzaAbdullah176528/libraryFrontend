'use client'

import { useState, useEffect } from 'react';
import { 
  FiEdit2, FiTrash2, FiPlus, FiBook, FiBookOpen, 
  FiUser, FiLayers, FiLogOut 
} from 'react-icons/fi';
import { BsFillBuildingFill } from 'react-icons/bs';
import Link from 'next/link';
import { 
  Box, Typography, Button, IconButton, CircularProgress, Avatar, Stack
} from '@mui/material';

import BookUpdateForm from '../components/BookUpdateForm';
import BookCard from '../components/bookCard';
import BookCreateForm from '../components/BookCreateForm';
import LibraryCard from '../components/libraryCard';
import LibraryUpdateForm from '../components/libraryUpdatefoam';
import UserUpdateForm from '../components/userUpdate';
import Chat from '../components/chat';
import { apiService, authService } from '../../service/api';

interface Book {
  _id: string;
  name: string;
  category: string;
  image?: string;
  author?: string;
  library?: { name: string; _id: string };
  Created_By?: { username: string };
  pdfLink?: string;
}

interface Library {
  _id: string;
  name: string;
  address: string;
  category?: string;
  Created_By?: { username: string; _id?: string; id?: string };
}

interface User {
  _id: string;
  Username: string;
  Password?: string;
  userId?: string;
  username?: string;
  avatar?: string;
}

type TabType = 'books' | 'libraries';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [userLibraries, setUserLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState({ books: true, libraries: true });
  const [showBookUpdateForm, setShowBookUpdateForm] = useState(false);
  const [showLibraryUpdateForm, setShowLibraryUpdateForm] = useState(false);
  const [showUserUpdateForm, setShowUserUpdateForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createType, setCreateType] = useState<'book' | 'library'>('book');
  const [userStats, setUserStats] = useState({ totalBooks: 0, totalLibraries: 0 });

  const [currentUser, setCurrentUser] = useState<User>({ _id: '', userId: '', username: '', Username: '', avatar: '' });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  async function getUser() {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const userId = user.userId || user._id || user.id;
        const username = user.username || user.Username;
        
        if (userId) {
          const userData = await apiService.getProfile(userId);
          if (userData) {
            const normalizedUser = {
              _id: userData._id,
              userId: userData._id,
              username: userData.Username,
              Username: userData.Username,
              avatar: userData.avatar
            };
            setCurrentUser(normalizedUser);
            fetchDashboardData(normalizedUser.userId, normalizedUser.username);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  const fetchDashboardData = async (userId: string, username: string) => {
    try {
      await Promise.all([
        fetchUserBooks(userId),
        fetchUserLibraries(userId, username)
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserBooks = async (userId: string) => {
    setLoading(prev => ({ ...prev, books: true }));
    try {
      const res = await apiService.getBooks({ created_by: userId });
      const books = Array.isArray(res) ? res : (res.result || []);
      setUserBooks(books);
      setUserStats(prev => ({ ...prev, totalBooks: books.length }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, books: false }));
    }
  };

  const fetchUserLibraries = async (userId: string, username: string) => {
    setLoading(prev => ({ ...prev, libraries: true }));
    try {
      const res = await apiService.getLibraries();
      const libraries = Array.isArray(res) ? res : (res.result || []);

      const userLibs = userId
        ? libraries.filter((lib: Library) => {
            const createdBy = lib.Created_By as any;
            if (!createdBy) return false;
            const createdById = createdBy.id || createdBy._id;
            const createdByUsername = createdBy.username || createdBy.Username;
            return (
              String(createdById) === String(userId) ||
              createdByUsername === username
            );
          })
        : libraries;

      setUserLibraries(userLibs);
      setUserStats(prev => ({ ...prev, totalLibraries: userLibs.length }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, libraries: false }));
    }
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setShowBookUpdateForm(true);
  };

  const handleEditLibrary = (library: Library) => {
    setSelectedLibrary(library);
    setShowLibraryUpdateForm(true);
  };

  const handleEditUser = () => {
    const userData: User = {
      avatar: currentUser?.avatar || '',
      _id: currentUser?.userId || '',
      Username: currentUser?.username || 'User'
    };
    setSelectedUser(userData);
    setShowUserUpdateForm(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await apiService.deleteBook(bookId);
      setUserBooks(prev => prev.filter(book => book._id !== bookId));
      setUserStats(prev => ({ ...prev, totalBooks: prev.totalBooks - 1 }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLibrary = async (libraryId: string) => {
    try {
      await apiService.deleteLibrary(libraryId);
      setUserLibraries(prev => prev.filter(lib => lib._id !== libraryId));
      setUserStats(prev => ({ ...prev, totalLibraries: prev.totalLibraries - 1 }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (currentUser.userId) {
        await apiService.deleteUser(currentUser.userId);
        authService.logout();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const handleBookUpdateSuccess = (updatedBook: Book) => {
    setUserBooks(prev =>
      prev.map(book => (book._id === updatedBook._id ? updatedBook : book))
    );
    setShowBookUpdateForm(false);
    setSelectedBook(null);
  };

  const handleLibraryUpdateSuccess = (updatedLibrary: Library) => {
    setUserLibraries(prev =>
      prev.map(lib => (lib._id === updatedLibrary._id ? updatedLibrary : lib))
    );
    setShowLibraryUpdateForm(false);
    setSelectedLibrary(null);
  };

  const handleUserUpdateSuccess = (updatedUser: User) => {
    if (typeof window !== 'undefined') {
      const user = authService.getCurrentUser();
      if (user) {
        user.username = updatedUser.Username;
        if (updatedUser.avatar) user.avatar = updatedUser.avatar;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    setShowUserUpdateForm(false);
    window.location.reload();
  };

  const handleCreateSuccess = (newItem: Book | Library) => {
    if ('category' in newItem && !('address' in newItem)) {
      const book = newItem as Book;
      setUserBooks(prev => [...prev, book]);
      setUserStats(prev => ({ ...prev, totalBooks: prev.totalBooks + 1 }));
    } else {
      const library = newItem as Library;
      setUserLibraries(prev => [...prev, library]);
      setUserStats(prev => ({ ...prev, totalLibraries: prev.totalLibraries + 1 }));
    }
    setShowCreateForm(false);
    setCreateType('book');
  };

  const handleOpenCreateForm = (type: 'book' | 'library') => {
    setCreateType(type);
    setShowCreateForm(true);
  };

  const getSafeBook = (book: Book): Book => ({
    _id: book._id || '',
    name: book.name || 'Unknown',
    category: book.category || 'General',
    image: book.image,
    library: book.library,
    Created_By: book.Created_By,
    author: book.author,
    pdfLink: book.pdfLink
  });

  const getSafeLibrary = (library: Library): Library => ({
    _id: library._id || '',
    name: library.name || 'Unknown',
    address: library.address || 'No address',
    category: library.category || 'General',
    Created_By: library.Created_By
  });

  const getSafeUser = (user: User): User => ({
    _id: user._id || '',
    Username: user.Username || '',
    Password: user.Password || '',
  });

  if (loading.books && loading.libraries) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#0A0F14', backgroundImage: 'linear-gradient(10deg, rgba(0, 229, 255 , 0.1) , #0A0F14)' }}>
        <CircularProgress sx={{ color: '#00E5FF' }} size={48} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0A0F14', backgroundImage: 'linear-gradient(10deg, rgba(0, 229, 255 , 0.03) , #0A0F14)', color: '#FFFAFA', fontFamily: '"Inter", sans-serif' }}>
      <Chat />

      <Box component="aside" sx={{
        width: 280,
        flexShrink: 0,
        bgcolor: '#05080c',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
      }}>
        <Box sx={{ p: 4, pb: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Box sx={{
                width: 36, height: 36,
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0, 229, 255, 0.1)',
                color: '#00E5FF',
                border: '1px solid rgba(0, 229, 255, 0.2)'
              }}>
                <FiLayers size={18} />
              </Box>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFAFA', letterSpacing: '1px' }}>
                Libris
              </Typography>
            </Stack>
          </Link>
        </Box>

        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', px: 2, mt: 2, mb: 2 }}>
            Menu
          </Typography>

          <Button
            onClick={() => setActiveTab('books')}
            startIcon={<FiBook />}
            sx={{
              justifyContent: 'flex-start',
              px: 2, py: 1.5,
              borderRadius: '8px',
              color: activeTab === 'books' ? '#00E5FF' : '#8b949e',
              background: activeTab === 'books' ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, transparent 100%)' : 'transparent',
              borderLeft: activeTab === 'books' ? '3px solid #00E5FF' : '3px solid transparent',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              '&:hover': { 
                background: activeTab === 'books' ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.15) 0%, transparent 100%)' : 'rgba(255,255,255,0.02)', 
                color: activeTab === 'books' ? '#00E5FF' : '#FFFAFA' 
              }
            }}
          >
            My Books
          </Button>

          <Button
            onClick={() => setActiveTab('libraries')}
            startIcon={<FiBookOpen />}
            sx={{
              justifyContent: 'flex-start',
              px: 2, py: 1.5,
              borderRadius: '8px',
              color: activeTab === 'libraries' ? '#00E5FF' : '#8b949e',
              background: activeTab === 'libraries' ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, transparent 100%)' : 'transparent',
              borderLeft: activeTab === 'libraries' ? '3px solid #00E5FF' : '3px solid transparent',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              '&:hover': { 
                background: activeTab === 'libraries' ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.15) 0%, transparent 100%)' : 'rgba(255,255,255,0.02)', 
                color: activeTab === 'libraries' ? '#00E5FF' : '#FFFAFA' 
              }
            }}
          >
            My Libraries
          </Button>
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button
            onClick={handleEditUser}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              p: 1.5,
              borderRadius: '8px',
              color: '#FFFAFA',
              textTransform: 'none',
              '&:hover': { background: 'rgba(255,255,255,0.03)' }
            }}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              {currentUser?.avatar ? (
                <Avatar src={`${API_URL}${currentUser.avatar}`} sx={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.1)' }} />
              ) : (
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.05)', color: '#8b949e' }}>
                  <FiUser size={18} />
                </Avatar>
              )}
              <Box sx={{ textAlign: 'left', overflow: 'hidden' }}>
                <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                  {currentUser?.username || 'User'}
                </Typography>
                <Typography sx={{ color: '#8b949e', fontSize: '0.75rem' }}>Account Settings</Typography>
              </Box>
            </Stack>
          </Button>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        <Box component="header" sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 4, py: 3,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          bgcolor: 'transparent',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(10px)'
        }}>
          <IconButton 
            onClick={handleLogout}
            sx={{ 
              color: '#8b949e', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
              p: 1,
              '&:hover': { color: '#f85149', borderColor: '#f85149', bgcolor: 'rgba(248, 81, 73, 0.1)' } 
            }}
          >
            <FiLogOut size={18} />
          </IconButton>
        </Box>

        <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 1400, mx: 'auto', width: '100%' }}>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, mb: 6, gap: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#FFFAFA', mb: 1, letterSpacing: '-0.5px' }}>
                {activeTab === 'books' ? 'The Collection' : 'Library Network'}
              </Typography>
              <Typography sx={{ color: '#8b949e', fontSize: '1.1rem' }}>
                {activeTab === 'books' ? 'Explore the curated list of available resources.' : 'Find and manage branches in your network.'}
              </Typography>
            </Box>

            <Stack direction="row" gap={2}>
              {activeTab === 'books' ? (
                <Button
                  startIcon={<FiPlus />}
                  onClick={() => handleOpenCreateForm('book')}
                  sx={{
                    background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.9) 0%, rgba(26, 123, 142, 0.9) 100%)',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    color: '#0A0F14',
                    px: 3, py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 700, textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0, 229, 255, 0.2)',
                    '&:hover': { filter: 'brightness(1.1)' }
                  }}
                >
                  Add New Book
                </Button>
              ) : (
                <Button
                  startIcon={<BsFillBuildingFill />}
                  onClick={() => handleOpenCreateForm('library')}
                  sx={{
                    background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.9) 0%, rgba(26, 123, 142, 0.9) 100%)',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    color: '#0A0F14',
                    px: 3, py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 700, textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0, 229, 255, 0.2)',
                    '&:hover': { filter: 'brightness(1.1)' }
                  }}
                >
                  Create Library
                </Button>
              )}
            </Stack>
          </Box>

          <Stack direction="row" gap={3} sx={{ mb: 6 }}>
            <Box sx={{ bgcolor: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', p: 3, flex: 1, maxWidth: 300 }}>
              <Typography sx={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                Total Books
              </Typography>
              <Typography sx={{ color: '#00E5FF', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                {userStats.totalBooks}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', p: 3, flex: 1, maxWidth: 300 }}>
              <Typography sx={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                Libraries
              </Typography>
              <Typography sx={{ color: '#00E5FF', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                {userStats.totalLibraries}
              </Typography>
            </Box>
          </Stack>

          <Box>
            {activeTab === 'books' && (
              <>
                {userBooks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                    <Typography variant="h6" sx={{ color: '#FFFAFA', mb: 1 }}>No books found</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 4 }}>
                    {userBooks.map(book => {
                      const safeBook = getSafeBook(book);
                      return (
                        <Box key={safeBook._id} sx={{ position: 'relative' }}>
                          <BookCard book={safeBook} />
                          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 10 }}>
                            <IconButton 
                              onClick={() => handleEditBook(safeBook)}
                              sx={{ bgcolor: '#0A0F14', color: '#FFFAFA', border: '1px solid rgba(255,255,255,0.1)', width: 34, height: 34, '&:hover': { bgcolor: '#1A7B8E', borderColor: '#1A7B8E' } }}
                            >
                              <FiEdit2 size={14} />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDeleteBook(safeBook._id)}
                              sx={{ bgcolor: '#0A0F14', color: '#f85149', border: '1px solid rgba(255,255,255,0.1)', width: 34, height: 34, '&:hover': { bgcolor: '#da3633', color: '#FFFAFA', borderColor: '#da3633' } }}
                            >
                              <FiTrash2 size={14} />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </>
            )}

            {activeTab === 'libraries' && (
              <>
                {userLibraries.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                    <Typography variant="h6" sx={{ color: '#FFFAFA', mb: 1 }}>No libraries found</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 4 }}>
                    {userLibraries.map(library => {
                      const safeLibrary = getSafeLibrary(library);
                      return (
                        <Box key={safeLibrary._id}>
                          <LibraryCard
                            library={safeLibrary}
                            onEdit={() => handleEditLibrary(safeLibrary)}
                            onDelete={() => handleDeleteLibrary(safeLibrary._id)}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {showBookUpdateForm && selectedBook && (
        <BookUpdateForm book={getSafeBook(selectedBook)} onUpdate={handleBookUpdateSuccess} onClose={() => { setShowBookUpdateForm(false); setSelectedBook(null); }} />
      )}
      {showLibraryUpdateForm && selectedLibrary && (
        <LibraryUpdateForm library={getSafeLibrary(selectedLibrary)} onUpdate={handleLibraryUpdateSuccess} onClose={() => { setShowLibraryUpdateForm(false); setSelectedLibrary(null); }} />
      )}
      {showUserUpdateForm && selectedUser && (
        <UserUpdateForm user={getSafeUser(selectedUser)} onUpdate={handleUserUpdateSuccess} onDelete={handleDeleteAccount} onClose={() => setShowUserUpdateForm(false)} />
      )}
      {showCreateForm && (
        <BookCreateForm onSuccess={handleCreateSuccess} onClose={() => { setShowCreateForm(false); setCreateType('book'); }} category={createType} />
      )}
    </Box>
  );
}