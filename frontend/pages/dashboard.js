import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, Search } from 'lucide-react';

// Lazy load components
const Layout = dynamic(() => import('../components/Layout'), { ssr: false });
const VerificationItem = dynamic(
  () => import('../components/VerificationItem'), 
  { 
    loading: () => <div className="p-4">Loading...</div>,
    ssr: false 
  }
);

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

// Main dashboard component
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Memoized load verifications function
  const loadVerifications = useCallback(async (userId) => {
    try {
      setLoading(true);
      
      // Only fetch the fields we need
      const { data, error } = await supabase
        .from('verifications')
        .select(`
          id,
          status,
          explanation,
          created_at,
          claim:claims!verifications_claim_id_fkey (
            id,
            title,
            content
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20); // Limit the number of items initially loaded

      if (error) throw error;

      const formattedData = data.map(item => ({
        id: item.id,
        status: item.status,
        explanation: item.explanation,
        created_at: item.created_at,
        claim: item.claim?.title || item.claim?.content || 'No title',
        claimId: item.claim?.id
      }));

      setVerifications(prev => {
        // Merge with existing data to avoid UI flicker
        const existingIds = new Set(prev.map(v => v.id));
        const newItems = formattedData.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle authentication state with optimized effect
  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadVerifications(session.user.id);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadVerifications(session.user.id);
        } else {
          setVerifications([]);
        }
      }
    );

    // Use requestIdleCallback to avoid blocking the main thread
    const idleId = requestIdleCallback ? 
      requestIdleCallback(() => getSession()) : 
      setTimeout(getSession, 0);

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      if (idleId && typeof idleId === 'number') {
        cancelIdleCallback?.(idleId);
      } else if (typeof idleId === 'object') {
        clearTimeout(idleId.timeout);
      }
    };
  }, [loadVerifications]);


  // Memoized filtered verifications
  const filteredVerifications = useMemo(() => {
    if (!searchQuery) return verifications;
    
    const query = searchQuery.toLowerCase();
    return verifications.filter(verification => {
      return (
        (verification.claim?.toLowerCase() || '').includes(query) ||
        (verification.status?.toLowerCase() || '').includes(query) ||
        (verification.explanation?.toLowerCase() || '').includes(query)
      );
    });
  }, [verifications, searchQuery]);

  // Memoized view details handler
  const handleViewDetails = useCallback((verificationId) => {
    router.push(`/verify/${verificationId}`, undefined, { shallow: true });
  }, [router]);

  // Loading state with better skeleton loading
  if (loading && verifications.length === 0) {
    return (
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-muted rounded-md mb-2"></div>
              <div className="h-4 w-96 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 w-32 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-48 bg-muted rounded mb-3"></div>
                  <div className="h-3 w-full bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your verification history.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-6 py-2 border border-input rounded-md hover:bg-muted"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <Layout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back, {user.email?.split('@')[0] || 'User'}! Here's your verification history.
            </p>
          </div>

          {/* Search bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Search verifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Verifications list */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {filteredVerifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  {searchQuery ? 'No matching verifications' : 'No verification history'}
                </h3>
                <p className="mt-1 text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query.'
                    : 'Start by verifying your first claim.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90"
                  >
                    Verify a claim
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredVerifications.map((verification) => (
                  <VerificationItem
                    key={verification.id}
                    item={verification}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
