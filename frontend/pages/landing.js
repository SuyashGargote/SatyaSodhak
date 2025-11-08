import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import Layout from '../components/Layout';

// Lazy load heavy components
const Shield = dynamic(() => import('lucide-react').then(mod => mod.Shield), { 
  ssr: false,
  loading: () => <div className="h-8 w-8 bg-muted rounded-md" />
});

const BarChart2 = dynamic(() => import('lucide-react').then(mod => mod.BarChart2), { 
  ssr: false,
  loading: () => <div className="h-8 w-8 bg-muted rounded-md" />
});

const Users = dynamic(() => import('lucide-react').then(mod => mod.Users), { 
  ssr: false,
  loading: () => <div className="h-8 w-8 bg-muted rounded-md" />
});

const ArrowRight = dynamic(() => import('lucide-react').then(mod => mod.ArrowRight), { 
  ssr: false,
  loading: () => <div className="h-4 w-4 bg-muted rounded-md" />
});

// Lazy load sections
const FeaturesSection = dynamic(() => import('../components/landing/FeaturesSection'), { 
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false 
});

const CTASection = dynamic(() => import('../components/landing/CTASection'), { 
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false 
});

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error 
    };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error in ErrorBoundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              We're sorry, but an unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const HeroSection = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight">
              <span className="block">Truth in a World of</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 mt-2">Misinformation</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              SatyaShodhak empowers you to verify news and claims with cutting-edge AI and trusted sources. Join our community committed to truth and accuracy.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-105"
              >
                Get Started for Free
              </Link>
              <Link 
                href="/about" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Navigation = () => (
  <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          SatyaShodhak
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  </nav>
);


const LandingPage = () => {
  return (
    <ErrorBoundary>
      <div className="flex-1">
        <HeroSection />
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <FeaturesSection />
          <CTASection />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

// Add getLayout function for consistent layout
LandingPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default LandingPage;
