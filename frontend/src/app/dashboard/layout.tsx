"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Navigation, 
  PieChart, 
  ArrowLeftRight, 
  LogOut, 
  Menu 
} from "lucide-react";

interface User {
  fullName: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("wedding_user");
    if (!savedUser) {
      router.push("/");
    } else {
      setUser(JSON.parse(savedUser));
    }

    // Timer clock
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("wedding_user");
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Guest Management", href: "/dashboard/guests", icon: Users },
    { name: "Location Groups", href: "/dashboard/locations", icon: MapPin },
    { name: "Route Planning", href: "/dashboard/routing", icon: Navigation },
    { name: "Analytics Portal", href: "/dashboard/analytics", icon: PieChart },
    { name: "Import & Export", href: "/dashboard/exchange", icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-parchment">
      
      {/* Sidebar for Desktop / Mobile Menu drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-maroon-royal border-r-2 border-gold/40 text-cream flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          {/* Crest / Brand Header */}
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gold/20">
            <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center bg-maroon-dark text-gold font-vibes text-2xl font-bold">
              K
            </div>
            <div>
              <h1 className="font-cinzel text-gold text-lg tracking-widest leading-none font-bold">Kalyanam</h1>
              <span className="text-[9px] text-gold-light/60 tracking-wider uppercase font-semibold">Royal Coordinator</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
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

        {/* Footer Distributor Info */}
        <div className="mt-8 border-t border-gold/20 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gold-dark text-maroon-dark flex items-center justify-center font-bold text-sm">
              {user?.fullName.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-xs font-semibold text-gold-light">{user?.fullName || "Wedding Guest"}</div>
              <div className="text-[9px] text-cream/60">{user?.role || "Distributor"}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Logout" 
            className="p-1.5 rounded hover:bg-maroon/50 text-gold hover:text-gold-light transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Header bar */}
        <header className="bg-cream-light/60 backdrop-blur-md border-b border-gold-foil/30 px-6 py-4 flex items-center justify-between sticky top-0 z-25">
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-1.5 border border-gold-dark/30 rounded bg-cream" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5 text-maroon-dark" />
            </button>
            <h2 className="font-cinzel text-maroon-dark text-lg font-bold tracking-wider">
              {navItems.find(item => item.href === pathname)?.name || "Wedding Coordinator"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-xs border border-gold/30 rounded-full px-3 py-1 bg-cream-light">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-maroon">Live Coordinator Database Sync</span>
            </div>
            <div className="text-xs font-semibold text-maroon font-cinzel">
              Local Time: <span className="font-mono">{time}</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="p-4 md:p-6 flex-1 bg-parchment">
          {children}
        </main>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
