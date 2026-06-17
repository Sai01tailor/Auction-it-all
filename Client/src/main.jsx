import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GOOGLE_CLIENT_ID from '../Config/GoogleClient.jsx'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './Context/AuthContext.jsx'

// Bootstrap Axios interceptors (auth token attachment + 401 handler)
import '../Config/interceptor.js'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <StrictMode>
          <App />
        </StrictMode>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </AuthProvider>,
)
