"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, Truck, Clock, Users, Map } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  mobile: string;
  familyMembers: number;
  village: string;
  city: string;
  status: string;
  assignedTo: string | null;
  distributedDate: string | null;
  distributedTime: string | null;
  remarks: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export default function Dashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalCards: 0,
    distributed: 0,
    assigned: 0,
    pending: 0,
    totalGuests: 0,
    totalLocations: 0,
    progressPerc: 0
  });
  const [todayDeliveries, setTodayDeliveries] = useState<Guest[]>([]);

  useEffect(() => {
    // Load mock database from localStorage
    const savedGuests = localStorage.getItem("wedding_guests");
    const savedUsers = localStorage.getItem("wedding_users");

    let loadedGuests: Guest[] = [];
    let loadedUsers: User[] = [];

    if (savedGuests) {
      loadedGuests = JSON.parse(savedGuests);
      setGuests(loadedGuests);
    }
    if (savedUsers) {
      loadedUsers = JSON.parse(savedUsers);
      setUsers(loadedUsers);
    }

    // Calculate metrics
    const totalCards = loadedGuests.length;
    const distributed = loadedGuests.filter(g => g.status === 'Distributed').length;
    const assigned = loadedGuests.filter(g => g.status === 'Assigned').length;
    const pending = loadedGuests.filter(g => g.status === 'Pending').length;
    const totalGuests = loadedGuests.reduce((sum, g) => sum + (g.familyMembers || 1), 0);
    const locations = new Set(loadedGuests.map(g => `${g.city}-${g.village}`));

    setStats({
      totalCards,
      distributed,
      assigned,
      pending,
      totalGuests,
      totalLocations: locations.size,
      progressPerc: totalCards > 0 ? Math.round((distributed / totalCards) * 100) : 0
    });

    // Today's deliveries
    const todayStr = new Date().toISOString().split('T')[0];
    const deliveredToday = loadedGuests.filter(
      g => g.status === 'Distributed' && g.distributedDate === todayStr
    );
    setTodayDeliveries(deliveredToday);

  }, []);

  return (
    <div className="space-y-6">
      {/* Cinematic Banner */}
      <div className="rounded-lg bg-maroon-royal p-6 text-cream relative overflow-hidden border-2 border-gold-foil flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div className="text-center md:text-left z-10 space-y-2">
          <h3 className="font-cinzel text-gold text-2xl md:text-3xl font-bold tracking-widest uppercase">Shubh Vivah Coordinations</h3>
          <p className="font-playfair italic text-gold-light/80 text-sm max-w-xl">
            Track invitation card distribution and manage guests across regions of Andhra Pradesh and Telangana. Delivering joy with traditional grace.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-center border border-gold/40 p-3 rounded-lg bg-maroon-dark/60 backdrop-blur z-10 w-44">
          <span className="text-[9px] uppercase tracking-widest text-gold-light font-cinzel">Overall Completion</span>
          <span className="text-3xl font-bold text-gold my-1">{stats.progressPerc}%</span>
          <div className="w-full bg-maroon-light rounded-full h-1.5">
            <div className="bg-gradient-to-r from-gold to-gold-light h-1.5 rounded-full" style={{ width: `${stats.progressPerc}%` }}></div>
          </div>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { name: "Total Cards", value: stats.totalCards, desc: "Printed invites", icon: Mail, color: "text-maroon-dark" },
          { name: "Distributed", value: stats.distributed, desc: "Delivered successfully", icon: CheckCircle2, color: "text-emerald-700" },
          { name: "Assigned", value: stats.assigned, desc: "With distributors", icon: Truck, color: "text-amber-700" },
          { name: "Pending", value: stats.pending, desc: "Unassigned cards", icon: Clock, color: "text-maroon-light" },
          { name: "Total Guests", value: stats.totalGuests, desc: "Family counts", icon: Users, color: "text-[#553311]" },
          { name: "Total Areas", value: stats.totalLocations, desc: "Cities & villages", icon: Map, color: "text-[#113355]" }
        ].map((c, i) => {
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

      {/* Activities and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Deliveries Feed */}
        <div className="bg-cream-light border border-gold-foil/30 rounded-lg p-5 shadow flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-gold-dark/20 mb-4">
            <h4 className="font-cinzel text-maroon-dark text-xs font-semibold tracking-wider">Today's Distribution</h4>
            <span className="bg-gold/20 text-gold-dark text-[10px] px-2 py-0.5 rounded-full font-bold">{todayDeliveries.length} cards</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {todayDeliveries.length === 0 ? (
              <div className="text-gray-500 text-xs italic text-center py-12">No invitations delivered today.</div>
            ) : (
              todayDeliveries.map((g) => (
                <div key={g.id} className="border-b border-gold-dark/10 py-2.5 flex items-start space-x-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] mt-0.5">✓</div>
                  <div className="flex-1">
                    <div className="font-semibold text-maroon-dark">{g.name}</div>
                    <div className="text-[10px] text-gray-500">{g.village}, {g.city} • By {g.assignedTo || "Distributor"}</div>
                    <div className="text-[9px] font-mono mt-0.5 text-emerald-600">{g.distributedDate} {g.distributedTime}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Distributor Standings */}
        <div className="bg-cream-light border border-gold-foil/30 rounded-lg p-5 shadow lg:col-span-2 flex flex-col h-[400px]">
          <div className="pb-3 border-b border-gold-dark/20 mb-4">
            <h4 className="font-cinzel text-maroon-dark text-xs font-semibold tracking-wider">Distributor Allocation Progress</h4>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-gold-dark/20 text-maroon font-cinzel font-semibold">
                  <th className="py-2">Distributor Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2 text-center">Assigned Cards</th>
                  <th className="py-2 text-center">Distributed</th>
                  <th className="py-2 text-center">Pending</th>
                  <th className="py-2 text-right">Work Done</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const uCards = guests.filter(g => g.assignedTo === u.fullName);
                  const uDelivered = uCards.filter(g => g.status === 'Distributed').length;
                  const uPending = uCards.filter(g => g.status === 'Assigned').length;
                  const uPerc = uCards.length > 0 ? Math.round((uDelivered / uCards.length) * 100) : 0;
                  return (
                    <tr key={u.id} className="border-b border-gold-dark/10 hover:bg-cream-dark/10">
                      <td className="py-2.5 font-semibold text-maroon-dark">{u.fullName}</td>
                      <td className="py-2.5 text-gray-600">{u.role}</td>
                      <td className="py-2.5 text-center font-bold">{uCards.length}</td>
                      <td className="py-2.5 text-center text-emerald-700 font-bold">{uDelivered}</td>
                      <td className="py-2.5 text-center text-amber-700 font-bold">{uPending}</td>
                      <td className="py-2.5 text-right font-semibold text-gold-dark">
                        <div className="inline-flex items-center space-x-1">
                          <span>{uPerc}%</span>
                          <div className="w-10 bg-gray-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-gold h-full" style={{ width: `${uPerc}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
