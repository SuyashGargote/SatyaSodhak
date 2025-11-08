import Head from 'next/head';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  const [mounted, setMounted] = useState(false);

  // Only show the component on the client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head>
        <title>SatyaShodhak — Instant Fact Verifier</title>
        <meta name="description" content="Verify facts with evidence-based analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />
      <Toaster position="top-right" richColors />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
