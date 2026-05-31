"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FloatingPetals from "@/components/FloatingPetals";
import Envelope from "@/components/Envelope";
import { supabase } from "@/lib/supabase";
import { UserRound, Lock, Chrome } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if session exists
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Retrieve local details and direct to dashboard
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        // Query user metadata profile
        const { data: userProfile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        localStorage.setItem("user_role", userProfile?.role || "Distributor");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check credentials.");
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Google Authentication failed.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-maroon-royal z-[9999] flex flex-col items-center justify-center">
        <div className="text-center relative">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-gold/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
            <svg className="w-44 h-44 md:w-56 md:h-56 text-gold opacity-80" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2,2"/>
              <path d="M50 5 C55 35, 45 35, 50 5 Z M50 95 C55 65, 45 65, 50 95 Z M5 50 C35 55, 35 45, 5 50 Z M95 50 C65 55, 65 45, 95 50 Z" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="#D4AF37" strokeWidth="1"/>
              <circle cx="50" cy="50" r="5" fill="#D4AF37"/>
            </svg>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
            <h1 className="font-vibes text-gold text-5xl md:text-6xl gold-shimmer-text">Kalyanam</h1>
            <span className="text-gold-light font-cinzel text-xs tracking-[0.3em] uppercase">Invitation Manager</span>
          </div>
        </div>
        <div className="mt-8 text-gold-light/60 font-cinzel tracking-wider text-xs animate-pulse">
          Adorned with blessings...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-maroon-royal flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FloatingPetals />

      {/* Royal Corner Ornaments */}
      <div className="absolute top-4 left-4 border-t-2 border-l-2 border-gold/40 w-16 h-16 pointer-events-none"></div>
      <div className="absolute top-4 right-4 border-t-2 border-r-2 border-gold/40 w-16 h-16 pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-gold/40 w-16 h-16 pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-gold/40 w-16 h-16 pointer-events-none"></div>

      {!showLogin ? (
        <Envelope onEnter={() => setShowLogin(true)} />
      ) : (
        /* Login Card */
        <div className="w-full max-w-md bg-parchment border-2 border-gold-foil p-8 rounded-lg shadow-2xl relative z-10 glass-panel">
          <div className="text-center mb-6">
            <h2 className="font-cinzel text-maroon-dark text-2xl font-bold tracking-wider">MANGALA LOG-IN</h2>
            <p className="text-gold-dark font-vibes text-2xl mt-1">Welcome to Wedding Management</p>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-2"></div>
          </div>

          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-maroon-dark tracking-wider uppercase mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  placeholder="name@wedding.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gold-dark/40 bg-cream-light/60 focus:outline-none focus:border-gold rounded font-medium text-maroon-dark"
                />
                <UserRound className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/70" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-maroon-dark tracking-wider uppercase">Pass-code</label>
                <Link href="/forgot-password" class="text-[10px] text-maroon hover:text-gold-dark font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gold-dark/40 bg-cream-light/60 focus:outline-none focus:border-gold rounded font-medium text-maroon-dark"
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/70" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-3 btn-gold rounded text-sm uppercase tracking-widest font-cinzel disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Enter Auspicious Portal"}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gold-dark/20"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-cinzel">Or Connect Via</span>
            <div className="flex-grow border-t border-gold-dark/20"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-2.5 border border-gold-dark/50 text-maroon-dark hover:bg-cream-dark/20 rounded text-xs tracking-wider uppercase font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Chrome className="w-4 h-4 text-maroon" />
            <span>Continue with Google</span>
          </button>
          
          <div className="text-center mt-6 text-[10px] text-gray-500 font-cinzel">
            Secured under familial guidance
          </div>
        </div>
      )}
    </main>
  );
}
