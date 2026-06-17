/**
 * Sets a secure cookie in the browser.
 * * @param {string} name - The name of the cookie.
 * @param {string} value - The value to store (will be stringified if it's an object).
 * @param {Object} options - Configuration options for the cookie.
 * @param {number} [options.days=7] - Number of days until the cookie expires.
 * @param {string} [options.path='/'] - The path where the cookie is accessible.
 * @param {string} [options.sameSite='Lax'] - Cross-site request routing ('Lax', 'Strict', or 'None').
 * @param {boolean} [options.secure=true] - Whether the cookie requires HTTPS.
 */
export const setCookie = (name, value, options = {}) => {
    // Set default options
    const {
        days = 7,
        path = '/',
        sameSite = 'Lax',
        // Automatically set to true if running on HTTPS
        secure = window.location.protocol === 'https:' 
    } = options;

    // Handle the expiration timespan
    let expires = '';
    if (days) {
        const date = new Date();
        // Convert days to milliseconds (days * 24h * 60m * 60s * 1000ms)
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }

    // Safely encode the value (handles strings or objects)
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const encodedValue = encodeURIComponent(stringValue);

    // Build the cookie string
    let cookieString = `${name}=${encodedValue}${expires}; path=${path}; SameSite=${sameSite}`;

    // Append secure flag if required
    if (secure) {
        cookieString += '; Secure';
    }

    // Set the cookie
    document.cookie = cookieString;
};
/**
 * Retrieves and decodes a cookie by its name.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|Object|null} - The cookie value (parsed JSON if applicable), or null if not found.
 */
export const getCookie = (name) => {
    // Prefix with a semicolon to ensure we don't accidentally match a substring of another cookie name
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    // If we found the cookie name, extract its value
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        const decodedValue = decodeURIComponent(cookieValue);

        // Safely attempt to parse it as JSON (in case you stored an object like preferences)
        try {
            return JSON.parse(decodedValue);
        } catch (e) {
            // If it's a standard string (like a JWT token), return it as-is
            return decodedValue;
        }
    }

    return null; // Cookie does not exist
};

/**
 * Helper to delete a cookie securely.
 * Mirrors the same flags used by setCookie (path, SameSite, Secure)
 * so the browser correctly matches and removes it even on HTTPS.
 * @param {string} name - The name of the cookie to delete
 */
export const deleteCookie = (name) => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${secure}`;
};