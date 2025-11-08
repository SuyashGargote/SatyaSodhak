'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Menu, X, Sun, Moon, Search, User, LogOut, Home, CheckCircle, BarChart2, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const supabase = useSupabaseClient();
  const user = useUser();
  const pathname = usePathname();

  // Only show the component on the client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Navigation items
  const mainNavItems = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4 mr-2" /> },
    { name: 'Verify', path: '/verify', icon: <CheckCircle className="w-4 h-4 mr-2" /> },
    { name: 'Explore', path: '/explore', icon: <Search className="w-4 h-4 mr-2" /> },
  ];

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 className="w-4 h-4 mr-2" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-4 h-4 mr-2" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4 mr-2" /> },
  ];

  if (!mounted) {
    return null; // Don't render anything on the server
  }

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SatyaShodhak
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                  } transition-colors`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mounted && resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5 text-accent" />
              ) : (
                <Moon className="h-5 w-5 text-foreground/80" />
              )}
            </button>
            
            {user ? (
              <div className="relative group ml-2">
                <button 
                  className="flex items-center space-x-2 bg-foreground/5 hover:bg-foreground/10 rounded-full px-3 py-1.5 transition-colors"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
                
                <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border border-border overflow-hidden transition-all duration-200 ${
                  isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
                }`}>
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-foreground/70 border-b border-border">
                      <p className="font-medium">{user.email}</p>
                    </div>
                    {userNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        className="flex items-center px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-foreground/5 focus:outline-none transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-200 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={`mobile-${item.name}`}
              href={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <>
              <div className="border-t border-border my-2"></div>
              {userNavItems.map((item) => (
                <Link
                  key={`mobile-user-${item.name}`}
                  href={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
          
          <div className="pt-4 border-t border-border mt-4">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5 mr-2 text-accent" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-2" />
                  Switch to Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
