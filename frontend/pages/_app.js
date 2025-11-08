import '../styles/globals.css'
import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter } from 'next/router'
import { SessionContextProvider, useSession } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import { ThemeProvider } from '../components/ThemeProvider'

const Toaster = dynamic(
  () => import('sonner').then((mod) => mod.Toaster),
  { ssr: false }
)

// Import TestAuth component only in development
const TestAuth = process.env.NODE_ENV === 'development' 
  ? dynamic(() => import('../components/TestAuth'), { ssr: false })
  : () => null;

// List of public paths that don't require authentication
const publicPaths = ['/', '/landing', '/login', '/signup']

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const supabaseClient = supabase

  // Check if the current route is public
  const isPublicPath = publicPaths.includes(router.pathname)

  // Handle auth state changes and visibility changes
  useEffect(() => {
    let mounted = true;
    let subscription;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, refresh the session
        try {
          const { data: { session }, error } = await supabaseClient.auth.getSession();
          if (error) throw error;
          
          if (!session && !isPublicPath) {
            // Only redirect to login if not on a public path
            if (mounted && !publicPaths.includes(router.pathname)) {
              await router.push('/login');
            }
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle auth state changes
    const { data: { subscription: authSubscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          // No automatic redirection on sign in
          // Just update the loading state
          setLoading(false);
        }
      }
    );
    subscription = authSubscription;

    // Initial session check
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        
        // If no session and not on a public path, redirect to login
        if (!session && !isPublicPath && !publicPaths.includes(router.pathname)) {
          await router.push('/login');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        if (!isPublicPath && !publicPaths.includes(router.pathname)) {
          await router.push('/login');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    checkUser();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router, isPublicPath])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const getLayout = Component.getLayout || ((page) => (
    <div className="min-h-screen flex flex-col">
      {page}
    </div>
  ))

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        {getLayout(
          <Component {...pageProps} />
        )}
        <Toaster position="top-right" />
        {process.env.NODE_ENV === 'development' && <TestAuth />}
      </ThemeProvider>
    </SessionContextProvider>
  )
}

export default MyApp