import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '../components/shared/ErrorBoundary'

// Production version - clean interface without test banners
export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* TEST ENVIRONMENT BANNER */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ff6b00',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          🧪 TEST ENVIRONMENT - Changes here won't affect production
        </div>
        <div style={{ paddingTop: '40px' }}>
          <Component {...pageProps} />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#ff4b4b',
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  )
}