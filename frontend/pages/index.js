import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the landing page
    router.replace('/landing');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

// Use server-side redirection
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/landing',
      permanent: false,
    },
  };
}
