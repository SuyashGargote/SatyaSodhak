"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { Loader2, LogIn } from 'lucide-react';

export default function TestAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Attempt to sign in with test credentials
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@satya.com',
        password: 'Test@1234',
      });

      if (signInError) {
        // If sign in fails, try to sign up first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'test@satya.com',
          password: 'Test@1234',
          options: {
            data: {
              full_name: 'Test User',
              role: 'tester'
            }
          }
        });

        if (signUpError) throw signUpError;
        
        // If sign up was successful, sign in with the new account
        const { error: signInAfterSignUpError } = await supabase.auth.signInWithPassword({
          email: 'test@satya.com',
          password: 'Test@1234',
        });

        if (signInAfterSignUpError) throw signInAfterSignUpError;
      }

    // Redirect to dashboard after successful login
    router.push('/dashboard');
    router.refresh();
  } catch (error) {
    console.error('Test authentication error:', error);
    setError(error.message || 'Failed to sign in with test account');
  } finally {
    setLoading(false);
  }
};

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleTestLogin}
        disabled={loading}
        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        title="Use test account"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>Test Login</span>
          </>
        )}
      </button>
      {error && (
        <div className="mt-2 p-2 text-xs bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
