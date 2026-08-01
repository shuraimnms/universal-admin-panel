'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import DynamicSEO from '@/components/DynamicSEO';
import type { Session } from 'next-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Session establishment logic moved to dashboard for instant login feeling

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Starting login process for:', email);
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.error('SignIn error:', result.error);
        setError('Invalid email or password');
        setIsLoading(false);
      } else if (result?.ok) {
        console.log('Login: SignIn successful, instantly redirecting to dashboard...');
        
        try {
          sessionStorage.setItem('login_success', 'true');
          sessionStorage.setItem('login_timestamp', Date.now().toString());
        } catch (error) {
          console.warn('Failed to store login metadata:', error);
        }
        
        // Let the /dashboard page handle role-based routing
        router.push('/dashboard');
        router.refresh(); // Ensure the layout picks up the new session
      } else {
        console.error('Unexpected signIn result:', result);
        setError('Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <DynamicSEO
        title="Login - IJARCM"
        description="Sign in to your International Journal of Academic Research account."
        keywords={["login", "sign in", "IJARCM", "academic journal"]}
        canonicalUrl="/auth/login"
      />
      
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Side: Branding & Value Prop */}
          <div className="flex-1 text-center md:text-left space-y-8 hidden md:block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4 backdrop-blur-sm border border-blue-200 dark:border-blue-800/50">
              <ShieldCheck className="w-4 h-4" />
              Secure Portal
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
              Welcome back to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                IJARCM
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
              Sign in to manage your submissions, review manuscripts, and access the universal publisher dashboard.
            </p>
            
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800/60 max-w-md">
              <div className="flex -space-x-3 opacity-80 hover:opacity-100 transition-opacity">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    A{i}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                  +2k
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-500">
                Join thousands of researchers and academics worldwide.
              </p>
            </div>
          </div>

          {/* Right Side: Login Form Card */}
          <div className="flex-1 w-full max-w-md mx-auto relative group">
            
            {/* Ambient Card Shadow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden">
              
              <div className="p-8">
                <div className="text-center mb-8 md:hidden">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Sign in to your account</p>
                </div>

                <div 
                  className="space-y-5"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                >
                  {error && (
                    <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/50">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-1.5 group/input">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@institution.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 group/input">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group/cb">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 border border-slate-300 dark:border-slate-600 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-all"
                        />
                        <ShieldCheck className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400 group-hover/cb:text-slate-900 dark:group-hover/cb:text-slate-200 transition-colors">
                        Remember me
                      </span>
                    </label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In Securely
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Footer Section of Card */}
              <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-all">
                    Register as Author
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Global styles for pulse animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </>
  );
}