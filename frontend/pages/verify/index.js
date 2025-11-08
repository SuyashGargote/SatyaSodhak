import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { Loader2, AlertCircle, CheckCircle2, XCircle, HelpCircle, ExternalLink } from 'lucide-react';

export default function Verify() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
        } else {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const handleVerify = async () => {
    if (!claim.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to verify claims');
      }
      
      const payload = { 
        claim_text: claim.trim(), 
        user_id: user.id
      };
      
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/verify`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      setResult(data);
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (err) {
      console.error('Verification error:', err);
      setError(
        err.response?.data?.detail || 
        (err.message || 'An error occurred while verifying the claim. Please try again later.')
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'true':
        return 'bg-primary/5 border-primary/20';
      case 'false':
        return 'bg-destructive/5 border-destructive/20';
      case 'misleading':
        return 'bg-accent/10 border-accent/20';
      default:
        return 'bg-muted/50 border-border';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'true':
        return <CheckCircle2 className="h-5 w-5 mr-3 text-primary" />;
      case 'false':
        return <XCircle className="h-5 w-5 mr-3 text-destructive" />;
      case 'misleading':
        return <AlertCircle className="h-5 w-5 mr-3 text-accent-foreground" />;
      default:
        return <HelpCircle className="h-5 w-5 mr-3 text-muted-foreground" />;
    }
  };

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              <span className="block">Verify Claims</span>
              <span className="block text-primary mt-2">With Confidence</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Enter any claim or statement to verify its authenticity using our advanced fact-checking system.
            </p>
          </div>

          <div className="bg-card/50 border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-8 sm:p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="claim" className="block text-sm font-medium text-foreground mb-3">
                    Enter a claim to verify
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="claim"
                      rows={4}
                      className="block w-full border border-border rounded-lg bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm transition-all hover:border-primary/30 focus:border-primary/50"
                      placeholder="Paste the claim you want to verify here..."
                      value={claim}
                      onChange={(e) => setClaim(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Example: "The Earth is flat" or "Vaccines cause autism"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={!claim.trim() || loading}
                    className={`inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/80 transition-all transform hover:scale-[1.02] ${
                      (!claim.trim() || loading) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Claim'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-destructive">Error</h3>
                      <div className="mt-1 text-sm text-destructive/90">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div id="results" className="mt-12 bg-card/50 border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-8 sm:p-8">
                <div className="pb-6 mb-6 border-b border-border">
                  <h2 className="text-2xl font-semibold text-foreground">Verification Results</h2>
                </div>

                <div className="space-y-6">
                  <div className={`flex items-start p-5 rounded-xl ${getVerdictColor(result.verdict)}`}>
                    {getVerdictIcon(result.verdict)}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {result.verdict ? result.verdict.charAt(0).toUpperCase() + result.verdict.slice(1) : 'Inconclusive'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {result.confidence ? (result.confidence * 100).toFixed(0) + '%' : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {result.explanation && (
                    <div className="bg-muted/30 rounded-xl p-5">
                      <h4 className="text-sm font-medium text-foreground mb-3">Explanation</h4>
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <p className="leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
