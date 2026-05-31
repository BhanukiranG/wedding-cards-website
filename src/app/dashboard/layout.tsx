"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Navigation, 
  PieChart, 
  ArrowLeftRight, 
  LogOut, 
  Menu,
  ShieldCheck
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  role: "Admin" | "Distributor";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      // Fetch user profile role from table
      try {
        const { data, error } = await supabase
          .from("users")
          .select("name, email, role")
          .eq("id", session.user.id)
          .single();

        if (error || !data) {
          // Fallback if public.users sync didn't run yet
          const fallbackProfile: UserProfile = {
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Wedding Admin",
            email: session.user.email || "",
            role: "Admin", // default fallback
          };
          setProfile(fallbackProfile);
        } else {
          setProfile(data as UserProfile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAuth(false);
      }
    };

    initSession();

    // Clock
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user_role");
    router.push("/");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold border-t-maroon rounded-full animate-spin mx-auto"></div>
          <p className="font-cinzel text-xs text-maroon tracking-wider font-semibold">Authorizing Entry...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, role: "Distributor" },
    { name: "Guest Management", href: "/dashboard/guests", icon: Users, role: "Distributor" },
    { name: "Location Groups", href: "/dashboard/locations", icon: MapPin, role: "Distributor" },
    { name: "Route Planning", href: "/dashboard/routing", icon: Navigation, role: "Distributor" },
    { name: "Analytics Portal", href: "/dashboard/analytics", icon: PieChart, role: "Admin" },
    { name: "Import & Export", href: "/dashboard/exchange", icon: ArrowLeftRight, role: "Admin" },
  ];

  // Filter routes based on user role
  const visibleNavItems = navItems.filter(
    (item) => profile?.role === "Admin" || item.role === "Distributor"
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-parchment">
      
      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-maroon-royal border-r-2 border-gold/40 text-cream flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gold/20">
            <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center bg-maroon-dark text-gold font-vibes text-2xl font-bold">
              K
            </div>
            <div>
              <h1 className="font-cinzel text-gold text-lg tracking-widest leading-none font-bold">Kalyanam</h1>
              <span className="text-[9px] text-gold-light/60 tracking-wider uppercase font-semibold">Royal Coordinator</span>
            </div>
          </div>

          {/* Navigation links list */}
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm transition-all ${
                    isActive 
                      ? "bg-maroon/50 border-l-2 border-gold text-gold-light" 
                      : "text-cream/70 hover:text-gold-light hover:bg-maroon/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-gold" : ""}`} />
                  <span className="font-cinzel tracking-wider text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile info card */}
        <div className="mt-8 border-t border-gold/20 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gold-dark text-maroon-dark flex items-center justify-center font-bold text-sm">
              {profile?.name.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-xs font-semibold text-gold-light max-w-[120px] truncate">{profile?.name || "Wedding Coordinator"}</div>
              <div className="text-[9px] text-cream/60 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-gold" />
                <span>{profile?.role || "Distributor"}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Sign Out" 
            className="p-1.5 rounded hover:bg-maroon/50 text-gold hover:text-gold-light transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Main dashboard content body */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Navigation top bar */}
        <header className="bg-cream-light/60 backdrop-blur-md border-b border-gold-foil/30 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-1.5 border border-gold-dark/30 rounded bg-cream" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5 text-maroon-dark" />
            </button>
            <h2 className="font-cinzel text-maroon-dark text-lg font-bold tracking-wider">
              {navItems.find(item => item.href === pathname)?.name || "Wedding Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-xs border border-gold/30 rounded-full px-3 py-1 bg-cream-light">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-maroon">Active Supabase Sync</span>
            </div>
            <div className="text-xs font-semibold text-maroon font-cinzel">
              Local Time: <span className="font-mono">{time}</span>
            </div>
          </div>
        </header>

        {/* Child Router Screens */}
        <main className="p-4 md:p-6 flex-1 bg-parchment">
          {children}
        </main>
      </div>

      {/* Mobile background overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
