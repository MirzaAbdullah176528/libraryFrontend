const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestOptions {
    method?: string;
    body?: any;
    params?: Record<string, string>;
}

const request = async (endpoint: string, options: RequestOptions = {}) => {
    const { method = 'GET', body, params } = options;
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
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
        body: body ? JSON.stringify(body) : undefined
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 && typeof window !== 'undefined') {
                
            }
            throw new Error(data.error || 'API Request Failed');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const authService = {
    login: (credentials: any) => request('/auth/login', { method: 'POST', body: credentials }),
    
    signup: (userData: any) => request('/auth/signup', { method: 'POST', body: userData }),
    
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    },

    getCurrentUser: () => {
        if (typeof window !== 'undefined') {
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
                console.error("Error parsing token", e);
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
        
    createBook: (bookData: any) => request('/books', { method: 'POST', body: bookData }),
    
    updateBook: (id: string, bookData: any) => request(`/books/${id}`, { method: 'PATCH', body: bookData }),
    
    deleteBook: (id: string) => request(`/books/${id}`, { method: 'DELETE' }),
};