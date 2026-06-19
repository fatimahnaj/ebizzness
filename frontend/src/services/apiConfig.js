const LOCAL_API_BASE_URL = 'http://localhost:8080/api';
const LOCAL_API_ORIGIN = 'http://localhost:8080';

const isLocalBrowserHost = () => {
    if (typeof window === 'undefined') return true;

    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || LOCAL_API_BASE_URL;
const configuredApiOrigin =
    import.meta.env.VITE_API_ORIGIN || configuredApiBaseUrl.replace(/\/api\/?$/, '');

export const API_BASE_URL = isLocalBrowserHost() ? configuredApiBaseUrl : '/api';
export const API_ORIGIN = isLocalBrowserHost() ? configuredApiOrigin || LOCAL_API_ORIGIN : '';

export const withApiOrigin = (path) => {
    if (!path) return null;
    if (/^(https?:|data:|blob:)/i.test(path)) return path;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_ORIGIN}${normalizedPath}`;
};
