import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowLeft, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink,
  Clock,
  User,
  AlertTriangle
} from 'lucide-react';

const Comment = ({ comment, onVote }) => {
  const [voteCount, setVoteCount] = useState(comment.vote_count || 0);
  const [userVote, setUserVote] = useState(comment.user_vote || 0);

  const handleVote = async (value) => {
    const newVote = userVote === value ? 0 : value;
    const voteDiff = newVote - userVote;
    
    setVoteCount(voteCount + voteDiff);
    setUserVote(newVote);
    
    try {
      await onVote(comment.id, newVote);
    } catch (err) {
      // Revert on error
      setVoteCount(voteCount);
      setUserVote(userVote);
      console.error('Failed to submit vote:', err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm font-medium text-foreground">
                {comment.user_email?.split('@')[0] || 'Anonymous'}
              </p>
              <span className="mx-2 text-muted-foreground">·</span>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="mt-1 text-sm text-foreground">{comment.text}</p>
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => handleVote(1)}
              className={`flex items-center text-xs ${userVote === 1 ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'} transition-colors`}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{voteCount > 0 ? voteCount : ''}</span>
            </button>
            <button
              onClick={() => handleVote(-1)}
              className={`flex items-center text-xs ${userVote === -1 ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'} transition-colors`}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VerifyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [verification, setVerification] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      // Unsubscribe when component unmounts
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load verification data
        const { data: verificationData, error: verificationError } = await supabase
          .from('verifications')
          .select('*')
          .eq('id', id)
          .single();
          
        if (verificationError) throw verificationError;
        
        // Load related claim
        const { data: claimData, error: claimError } = await supabase
          .from('claims')
          .select('*')
          .eq('id', verificationData.claim_id)
          .single();
          
        if (claimError) throw claimError;
        
        // Load evidence
        const { data: evidenceData, error: evidenceError } = await supabase
          .from('verification_evidence')
          .select(`
            id,
            stance,
            rationale,
            evidence_docs (
              id,
              url,
              title,
              snippet,
              source
            )
          `)
          .eq('verification_id', id);
          
        if (evidenceError) throw evidenceError;
        
        // Load comments with vote information
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            comment_votes (
              user_id,
              value
            )
          `)
          .eq('verification_id', id)
          .order('created_at', { ascending: false });
          
        if (commentsError) throw commentsError;
        
        // Process comments to include vote counts and user's vote
        const processedComments = commentsData.map(comment => {
          const votes = comment.comment_votes || [];
          const voteCount = votes.reduce((sum, vote) => sum + (vote.value || 0), 0);
          const userVote = votes.find(v => v.user_id === user?.id)?.value || 0;
          
          return {
            ...comment,
            vote_count: voteCount,
            user_vote: userVote
          };
        });
        
        setVerification({
          ...verificationData,
          claim: claimData,
          evidence: evidenceData.map(ev => ({
            ...ev,
            evidence: ev.evidence_docs
          }))
        });
        
        setComments(processedComments);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load verification details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, user?.id]);
  
  const getVerdictColor = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'true':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'false':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };
  
  const getVerdictIcon = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'true':
        return <CheckCircle2 className="h-5 w-5 mr-2" />;
      case 'false':
        return <XCircle className="h-5 w-5 mr-2" />;
      default:
        return <HelpCircle className="h-5 w-5 mr-2" />;
    }
  };
  
  const handleVote = async (commentId, value) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }
    
    try {
      const { error } = await supabase.rpc('handle_comment_vote', {
        p_comment_id: commentId,
        p_user_id: user.id,
        p_value: value
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error voting:', err);
      throw err;
    }
  };
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to comment');
      return;
    }
    
    if (!text.trim()) return;
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          verification_id: id,
          user_id: user.id,
          user_email: user.email,
          text: text.trim()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new comment to the list
      setComments(prev => [
        {
          ...data,
          vote_count: 0,
          user_vote: 0,
          comment_votes: []
        },
        ...prev
      ]);
      
      setText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading verification details...</span>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go back
          </button>
        </div>
      </Layout>
    );
  }
  
  if (!verification) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">Verification not found</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to results
          </button>
          
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verification Details</h1>
                <p className="text-muted-foreground mt-1">
                  Verified on {new Date(verification.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className={`mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getVerdictColor(verification.verdict)}`}>
                {getVerdictIcon(verification.verdict)}
                {verification.verdict || 'Unknown'}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Original Claim</h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-foreground">{verification.claim?.text || 'No claim text available'}</p>
                  {verification.claim?.source && (
                    <a 
                      href={verification.claim.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mt-2"
                    >
                      Source <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Analysis</h2>
                <div className="space-y-4">
                  {verification.evidence?.length > 0 ? (
                    verification.evidence.map((evidence, index) => (
                      <div key={evidence.id} className="border rounded-lg overflow-hidden">
                        <div className={`p-3 ${evidence.stance === 'supports' ? 'bg-green-50' : evidence.stance === 'refutes' ? 'bg-red-50' : 'bg-amber-50'}`}>
                          <div className="flex items-center">
                            {evidence.stance === 'supports' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                            ) : evidence.stance === 'refutes' ? (
                              <XCircle className="h-5 w-5 text-red-600 mr-2" />
                            ) : (
                              <HelpCircle className="h-5 w-5 text-amber-600 mr-2" />
                            )}
                            <span className="font-medium capitalize">{evidence.stance || 'neutral'}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-foreground mb-3">{evidence.rationale}</p>
                          
                          {evidence.evidence?.length > 0 && (
                            <div className="mt-3 space-y-3">
                              <h4 className="text-sm font-medium text-muted-foreground">Supporting Evidence:</h4>
                              {evidence.evidence.map((doc, docIndex) => (
                                <a
                                  key={docIndex}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-3 border rounded hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-start">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{doc.title || 'Untitled Document'}</p>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.snippet}</p>
                                      <div className="mt-1 text-xs text-muted-foreground flex items-center">
                                        {doc.source && (
                                          <span className="truncate">{new URL(doc.source).hostname.replace('www.', '')}</span>
                                        )}
                                        <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No analysis available for this verification</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Discussion</h2>
                  <span className="text-sm text-muted-foreground">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
                </div>

                {user ? (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Add to the discussion..."
                          className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] text-sm"
                          disabled={submitting}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={!text.trim() || submitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              'Post Comment'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6 bg-muted/30 rounded-lg mb-6">
                    <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-3">Sign in to join the discussion</p>
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <Comment key={comment.id} comment={comment} onVote={handleVote} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
