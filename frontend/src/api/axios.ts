import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
    withCredentials: true, // Enable sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get CSRF token from cookie
function getCsrfToken(): string | null {
    const name = 'csrftoken';
    let cookieValue: string | null = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Add CSRF token to requests
api.interceptors.request.use(
    (config) => {
        // Add CSRF token for unsafe methods
        if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
        }
        
        // Remove Content-Type header for FormData to let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;