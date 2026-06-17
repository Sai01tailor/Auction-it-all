import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCookie, deleteCookie } from '../Components/Global/CookieIT';
import api from '../../Config/interceptor';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Prevents a flash of the login screen while the app validates the session
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const token = getCookie('auth_token');

        if (!token) {
            // No token at all — skip the network call
            setIsInitializing(false);
            return;
        }

        // Token exists — validate it server-side and fetch the user profile
        api.get('/me')
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                // Token is expired / tampered — clear it so the app stays clean
                deleteCookie('auth_token');
                setUser(null);
            })
            .finally(() => {
                setIsInitializing(false);
            });
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isInitializing }}>
            {/* Hold rendering until we know the auth state to avoid flicker */}
            {!isInitializing && children}
        </AuthContext.Provider>
    );
};

/* ─────────────────────────────────────────────
   useAuth — clean custom hook, use this in every
   component instead of importing AuthContext directly.
   ───────────────────────────────────────────── */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an <AuthProvider>');
    }
    return context;
};