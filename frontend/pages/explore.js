'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, List, Grid, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Mock data for fallback
const MOCK_CLAIMS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Vaccines cause autism',
    summary: 'Multiple studies have shown no link between vaccines and autism.',
    verdict: 'false',
    tags: ['health', 'vaccines', 'myth'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Climate change is a hoax',
    summary: 'Over 97% of climate scientists agree that climate change is real and caused by human activity.',
    verdict: 'false',
    tags: ['environment', 'science', 'politics'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Drinking 8 glasses of water daily is necessary',
    summary: 'Water needs vary by individual, and the 8-glass rule is not based on scientific evidence.',
    verdict: 'misleading',
    tags: ['health', 'nutrition', 'myth'],
    created_at: new Date().toISOString(),
  }
];

function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current theme
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch claims from API
  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      console.log('Fetching claims from:', `${backendUrl}/api/claims`);
      
      const response = await fetch(`${backendUrl}/api/claims`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (Array.isArray(data)) {
        // Process and validate each claim
        const processedClaims = data.map(claim => ({
          id: claim.id || `mock-${Math.random().toString(36).substr(2, 9)}`,
          title: claim.title || 'Untitled Claim',
          summary: claim.summary || 'No summary available',
          verdict: ['true', 'false', 'misleading', 'pending'].includes(claim.verdict?.toLowerCase()) 
            ? claim.verdict.toLowerCase() 
            : 'pending',
          tags: Array.isArray(claim.tags) ? claim.tags : [],
          created_at: claim.created_at || new Date().toISOString(),
          updated_at: claim.updated_at || new Date().toISOString(),
        }));
        
        setClaims(processedClaims);
        
        if (processedClaims.length === 0) {
          console.warn('No claims found in the database');
          setError('No claims found. Using demo data.');
          setClaims(MOCK_CLAIMS);
        }
      } else {
        console.error('Invalid data format received, using mock data');
        setError('Invalid data format received. Using demo data.');
        setClaims(MOCK_CLAIMS);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError(`Failed to load claims: ${err.message}. Using demo data.`);
      setClaims(MOCK_CLAIMS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Filter claims based on search and active filter
  const filteredClaims = claims.filter(claim => {
    if (!claim) return false;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (claim.title || '').toLowerCase().includes(searchLower) ||
      (claim.summary || '').toLowerCase().includes(searchLower) ||
      (claim.tags || []).some(tag => 
        tag.toLowerCase().includes(searchLower)
      );
    
    const matchesFilter = activeFilter === 'all' || 
                         (claim.verdict || '').toLowerCase() === activeFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Handle claim click
  const handleClaimClick = (claimId) => {
    router.push(`/claims/${claimId}`);
  };

  // Get badge color based on verdict - using primary color variants to match landing page
  const getVerdictBadge = (verdict) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    
    switch ((verdict || '').toLowerCase()) {
      case 'true':
        return <span className={`${baseClasses} bg-primary/10 text-primary dark:bg-primary/20`}>True</span>;
      case 'false':
        return <span className={`${baseClasses} bg-destructive/10 text-destructive dark:bg-destructive/20`}>False</span>;
      case 'misleading':
        return <span className={`${baseClasses} bg-accent/20 text-foreground dark:bg-accent/30`}>Misleading</span>;
      default:
        return <span className={`${baseClasses} bg-muted text-muted-foreground`}>Pending</span>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading || !mounted) {
    return (
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl sm:tracking-tight lg:text-6xl">
            Explore Claims
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Search through verified claims and fact-checks from around the web
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-card/50 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm transition-all hover:border-primary/30 focus:border-primary/50"
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                aria-label="Grid view"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['all', 'true', 'false', 'misleading', 'pending'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeFilter === filter
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-foreground/80 hover:bg-muted/80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Claims Grid/List View */}
        {filteredClaims.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4 max-w-4xl mx-auto'
          }>
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => handleClaimClick(claim.id)}
                className={`bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                }`}
              >
                <div className={`p-5 ${viewMode === 'list' ? 'sm:w-2/3' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-foreground line-clamp-2">
                      {claim.title}
                    </h3>
                    {getVerdictBadge(claim.verdict)}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {claim.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {claim.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {formatDate(claim.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No claims found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-4 text-sm font-medium text-primary hover:text-primary/80"
            >
              Clear filters
            </button>
          </div>
        )}
    </div>
  );
}

// Add getLayout function for consistent layout
ExplorePage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ExplorePage;
