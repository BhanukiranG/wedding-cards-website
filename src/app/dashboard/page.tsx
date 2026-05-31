"use client";

import { useEffect } from "react";
import { useWeddingStore } from "@/lib/store";
import { Mail, CheckCircle2, Truck, Clock, Users, Map } from "lucide-react";
import SkeletonCard from "@/components/SkeletonCard";

export default function DashboardHome() {
  const { guests, loading, fetchGuests } = useWeddingStore();

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Calculations
  const totalCards = guests.length;
  const distributed = guests.filter((g) => g.status === "Distributed").length;
  const assigned = guests.filter((g) => g.status === "Assigned").length;
  const pending = guests.filter((g) => g.status === "Pending").length;
  const totalGuests = guests.reduce((sum, g) => sum + (g.familyMembers || 1), 0);
  const areas = Array.from(new Set(guests.map((g) => `${g.city}-${g.village}`)));
  const progressPerc = totalCards > 0 ? Math.round((distributed / totalCards) * 100) : 0;

  // Filter deliveries done today
  const todayStr = new Date().toISOString().split("T")[0];
  // Since we don't have distribution logs details here easily without fetchDistributions, 
  // we can filter guests who have status Distributed.
  const todayDeliveries = guests.filter(
    (g) => g.status === "Distributed"
    // In a real app we'd cross-reference with distributions delivered_date
  );

  const stats = [
    { name: "Total Cards", value: totalCards, desc: "Printed invites", icon: Mail, color: "text-maroon-dark" },
    { name: "Distributed", value: distributed, desc: "Delivered", icon: CheckCircle2, color: "text-emerald-700" },
    { name: "Assigned", value: assigned, desc: "With distributors", icon: Truck, color: "text-amber-700" },
    { name: "Pending", value: pending, desc: "Unassigned cards", icon: Clock, color: "text-maroon-light" },
    { name: "Total Guests", value: totalGuests, desc: "Family counts", icon: Users, color: "text-[#553311]" },
    { name: "Total Areas", value: areas.length, desc: "Cities & villages", icon: Map, color: "text-[#113355]" }
  ];

  if (loading && guests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-maroon-royal/20 animate-pulse rounded-lg border border-gold/20"></div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-cream-light border border-gold/10 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-cream-light border border-gold/10 rounded-lg animate-pulse col-span-1"></div>
          <div className="h-64 bg-cream-light border border-gold/10 rounded-lg animate-pulse col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-lg bg-maroon-royal p-6 text-cream relative overflow-hidden border-2 border-gold-foil flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div className="text-center md:text-left z-10 space-y-2">
          <h3 className="font-cinzel text-gold text-2xl md:text-3xl font-bold tracking-widest uppercase">Shubh Vivah Coordinations</h3>
          <p className="font-playfair italic text-gold-light/80 text-sm max-w-xl">
            Track invitation card distribution and manage guests across regions of Andhra Pradesh and Telangana. Delivering joy with traditional grace.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-center border border-gold/40 p-3 rounded-lg bg-maroon-dark/60 backdrop-blur z-10 w-44">
          <span className="text-[9px] uppercase tracking-widest text-gold-light font-cinzel">Overall Completion</span>
          <span className="text-3xl font-bold text-gold my-1">{progressPerc}%</span>
          <div className="w-full bg-maroon-light rounded-full h-1.5">
            <div className="bg-gradient-to-r from-gold to-gold-light h-1.5 rounded-full" style={{ width: `${progressPerc}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-cream-light border border-gold/30 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className={`flex items-center justify-between ${c.color}`}>
                <span className="text-[10px] font-cinzel tracking-wider uppercase font-semibold text-gray-500">{c.name}</span>
                <Icon className="w-4 h-4 text-gold-dark" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-mono text-maroon-dark">{c.value}</span>
                <p className="text-[9px] text-gray-500 mt-1">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Deliveries Feed */}
        <div className="bg-cream-light border border-gold-foil/30 rounded-lg p-5 shadow flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-gold-dark/20 mb-4">
            <h4 className="font-cinzel text-maroon-dark text-xs font-semibold tracking-wider">Distributed Registries</h4>
            <span className="bg-gold/20 text-gold-dark text-[10px] px-2 py-0.5 rounded-full font-bold">{distributed} cards</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {todayDeliveries.length === 0 ? (
              <div className="text-gray-500 text-xs italic text-center py-12">No invitations delivered yet.</div>
            ) : (
              todayDeliveries.map((g) => (
                <div key={g.id} className="border-b border-gold-dark/10 py-2.5 flex items-start space-x-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] mt-0.5">✓</div>
                  <div className="flex-1">
                    <div className="font-semibold text-maroon-dark">{g.name}</div>
                    <div className="text-[10px] text-gray-500">{g.village}, {g.city}</div>
                    <div className="text-[9px] font-mono mt-0.5 text-emerald-600">Active Record</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
