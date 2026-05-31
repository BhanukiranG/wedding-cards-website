"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FloatingPetals from "@/components/FloatingPetals";
import { UserRound, Lock } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user already logged in
    const user = localStorage.getItem("wedding_user");
    if (user) {
      router.push("/dashboard");
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [router]);

  const handleOpenEnvelope = () => {
    setIsOpen(true);
  };

  const handleEnterApp = () => {
    setShowLogin(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === "admin" && password === "admin") {
      const mockUser = {
        id: 1,
        username: "admin",
        fullName: "Bhanu Prasad",
        role: "Admin",
      };
      localStorage.setItem("wedding_user", JSON.stringify(mockUser));
      router.push("/dashboard");
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
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
        <div className="flex flex-col items-center z-10 w-full max-w-xl">
          <div className="text-center mb-8 px-4">
            <div className="font-vibes text-gold text-4xl mb-2">Sri Rama Prasanna</div>
            <h2 className="font-cinzel text-gold-light text-2xl md:text-3xl tracking-widest leading-relaxed">
              ROYAL WEDDING INVITATION
            </h2>
            <p className="text-cream/70 font-playfair italic text-sm mt-3">
              "Marriage is the union of two souls in sacred matrimony. We invite you to witness this auspicious journey."
            </p>
          </div>

          {/* 3D Envelope */}
          <div 
            onClick={handleOpenEnvelope} 
            className={`envelope-wrapper transition-transform duration-500 ${isOpen ? "open cursor-default" : "hover:scale-[1.02]"}`}
          >
            <div className="envelope">
              <div className="envelope-flap"></div>
              
              <div className="wax-seal">
                <span>S</span>
              </div>
              
              <div className="letter-card bg-parchment border-2 border-double border-gold/60 flex flex-col items-center justify-between p-6">
                <div className="w-full text-center border-b border-gold/30 pb-3">
                  <h4 className="font-cinzel text-maroon text-sm font-semibold tracking-widest">SIVARAMA & LAKSHMI</h4>
                  <p className="font-vibes text-gold-dark text-xl mt-1">Wedding Ceremony</p>
                </div>
                
                <div className="text-center my-4">
                  <p class="text-[10px] text-maroon-light tracking-wide uppercase font-semibold">Join the Auspicious Event</p>
                  <p className="font-playfair font-semibold text-lg text-maroon-dark my-1">August 27, 2026</p>
                  <p className="text-[10px] text-gray-600">M Convention Center, Vijayawada</p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnterApp();
                  }}
                  className="w-full btn-gold text-xs py-2 px-4 rounded tracking-wider uppercase"
                >
                  Access Dashboard
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-cream/40 text-[10px] font-cinzel tracking-widest uppercase animate-pulse">
            {!isOpen ? "Click Wax Seal to Break & Open" : "Click 'Access Dashboard' on the letter"}
          </div>
        </div>
      ) : (
        /* Login Card */
        <div className="w-full max-w-md bg-parchment border-2 border-gold-foil p-8 rounded-lg shadow-2xl relative z-10 glass-panel">
          <div className="text-center mb-6">
            <h2 className="font-cinzel text-maroon-dark text-2xl font-bold tracking-wider">MANGALA LOG-IN</h2>
            <p className="text-gold-dark font-vibes text-2xl mt-1">Welcome to Wedding Management</p>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-2"></div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs mb-4">
              Invalid credentials. Use admin / admin.
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-maroon-dark tracking-wider uppercase mb-1">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gold-dark/40 bg-cream-light/60 focus:outline-none focus:border-gold rounded font-medium text-maroon-dark"
                />
                <UserRound className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/70" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-maroon-dark tracking-wider uppercase mb-1">Pass-code</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gold-dark/40 bg-cream-light/60 focus:outline-none focus:border-gold rounded font-medium text-maroon-dark"
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/70" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 btn-gold rounded text-sm uppercase tracking-widest font-cinzel">
              Enter Auspicious Portal
            </button>
          </form>
          
          <div className="text-center mt-6 text-[10px] text-gray-500 font-cinzel">
            Secured under familial guidance • Admin: admin / admin
          </div>
        </div>
      )}
    </main>
  );
}
