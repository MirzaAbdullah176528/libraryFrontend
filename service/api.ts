const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions {
  method?: string;
  body?: any;
  params?: Record<string, string>;
}

const request = async (endpoint: string, options: RequestOptions = {}) => {
  const { method = 'GET', body, params } = options;
  
  const headers: Record<string, string> = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API Request Failed');
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: credentials }),

  // FIX: signup now sends FormData so multer can parse it correctly.
  // Previously sent JSON, but the backend signup route uses multer middleware
  // which prevents express.json() from populating req.body — causing Username
  // and password to arrive as undefined, storing a hash of undefined.
  signup: (userData: { Username: string; password: string; image?: File }) => {
    const formData = new FormData();
    formData.append('Username', userData.Username);
    formData.append('password', userData.password);
    if (userData.image) {
      formData.append('image', userData.image);
    }
    return request('/auth/signup', { method: 'POST', body: formData });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
      
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

export const apiService = {
  getBooks: (filters: { name?: string; category?: string; created_by?: string } = {}) => 
    request('/books', { params: filters as Record<string, string> }),
  
  getLibraries: (filters: { name?: string; address?: string } = {}) => 
    request('/libraries', { params: filters as Record<string, string> }),

  createLibrary: (data: { name?: string; address?: string }) =>
    request('/libraries', { method: 'POST', body: data }),

  deleteLibrary: (id: string) => request(`/libraries/${id}`, { method: 'DELETE' }),

  updateLibrary: (id: string, libraryData: any) => request(`/libraries/${id}`, { method: 'PATCH', body: libraryData }),
      
  createBook: (bookData: any) => request('/books', { method: 'POST', body: bookData }),
  
  updateBook: (id: string, bookData: any) => request(`/books/${id}`, { method: 'PATCH', body: bookData }),
  
  deleteBook: (id: string) => request(`/books/${id}`, { method: 'DELETE' }),

  updateUser: (id: string, userData: any) => request(`/auth/update/${id}`, { method: 'PATCH', body: userData }),

  deleteUser: (id: string) => request(`/auth/delete/${id}`, { method: 'DELETE' }),

  getLibraryBooks: (id: string) => request(`/libraries/${id}/books`, { method: 'GET' }),

  getProfile: (id: string) => request(`/auth/profile/${id}`, { method: 'GET' }),

  getRes: (prompt: { name: string; category: string; topic: string }) =>
    request('/chat', { method: 'POST', body: prompt }),
};