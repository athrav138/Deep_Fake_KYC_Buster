import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, rtdb, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useToast } from '../context/ToastContext';

export default function Signup() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    if (!auth) {
      showToast('Firebase is not configured. Google Sign-up is unavailable.', 'error');
      return;
    }

    setGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 1. Sign up with local backend
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          password: 'google-auth-placeholder-password',
          fullName: user.displayName 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error !== "Email already exists") {
          throw new Error(data.error || "Failed to sync Google account");
        }
      }

      // 2. Sync with RTDB
      if (rtdb) {
        await set(ref(rtdb, `users/${user.uid}`), {
          fullName: user.displayName,
          email: user.email,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }

      showToast('Account connected successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err: any) {
      console.error("Google Sign-up error:", err);
      let message = err.message;
      if (err.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized for Google Sign-in. Please add the current URL to your Firebase Console 'Authorized domains' list.";
      }
      setError(message);
      showToast(message, 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const trimmedEmail = email.trim().toLowerCase();
      // 1. Sign up with local backend first (Source of Truth)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password, fullName }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === "Email already exists") {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        throw new Error(data.error || "Failed to create account");
      }

      // 2. Optional Firebase Sync (If configured)
      if (auth && rtdb) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await updateProfile(user, { displayName: fullName });
          await set(ref(rtdb, `users/${user.uid}`), {
            fullName,
            email,
            role: 'user',
            createdAt: new Date().toISOString()
          });
        } catch (fbErr) {
          console.warn("Firebase sync failed, continuing with local auth:", fbErr);
        }
      }

      // 3. Navigate to login
      showToast('Account created successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-app-card backdrop-blur-2xl border border-app-border rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
            <p className="opacity-50 text-sm">Join the next-gen identity platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-40 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-app-bg border border-app-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-40 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-app-bg border border-app-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-40 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-app-bg border border-app-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-app-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#050505] px-2 opacity-40">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full bg-white/5 hover:bg-white/10 border border-app-border text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    />
                  </svg>
                  Google
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-app-border text-center">
            <p className="opacity-40 text-sm">
              Already have an account? <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
