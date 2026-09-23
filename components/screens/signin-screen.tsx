'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Plane, Hotel, Home, Car, Sailboat } from 'lucide-react';

export function SignInScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Hotel className="absolute top-[12%] left-[10%] h-8 w-8 text-white/10 animate-float" />
        <Plane className="absolute top-[20%] right-[12%] h-10 w-10 text-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
        <Home className="absolute bottom-[25%] left-[15%] h-9 w-9 text-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <Car className="absolute bottom-[15%] right-[10%] h-8 w-8 text-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
        <Sailboat className="absolute top-[45%] left-[8%] h-7 w-7 text-white/10 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Waymark</h1>
        </div>
        <p className="text-white/60 text-sm max-w-xs mx-auto">
          Book flights, hotels, homes, cars, and yachts. Your journey starts here.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white text-center mb-2">Welcome</h2>
          <p className="text-white/50 text-sm text-center mb-8">
            Sign in to start booking your next adventure
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white text-slate-900 font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/40 text-xs text-center leading-relaxed">
              By continuing, you agree to Waymark's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <p className="relative z-10 text-white/30 text-xs mt-8">Waymark Atlas 2025</p>
    </div>
  );
}
