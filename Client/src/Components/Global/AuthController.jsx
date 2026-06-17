import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'

/**
 * Drop this component into any page/layout that requires authentication.
 * It reads the shared auth state (already validated by AuthContext on startup)
 * and redirects to /login if no user session is found.
 */
const AuthController = () => {
    const { user, isInitializing } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        // Wait until AuthContext has finished checking the token before acting
        if (!isInitializing && !user) {
            navigate('/login', { replace: true })
        }
    }, [user, isInitializing, navigate])

    return null
}

export default AuthController