"use client";

import { useEffect, useState } from "react";
import { useWeddingStore } from "@/lib/store";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from "recharts";

export default function Analytics() {
  const { guests, loading, fetchGuests } = useWeddingStore();
  const [cityData, setCityData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    if (guests.length > 0) {
      calculateAnalytics();
    }
  }, [guests]);

  const calculateAnalytics = () => {
    // 1. City Chart
    const cities = Array.from(new Set(guests.map(g => g.city)));
    const cityList = cities.map(c => {
      const cGuests = guests.filter(g => g.city === c);
      return {
        name: c,
        "Total Cards": cGuests.length,
        "Distributed": cGuests.filter(g => g.status === 'Distributed').length
      };
    });
    setCityData(cityList);

    // 2. Status Share
    const statusCounts = [
      { name: "Pending", value: guests.filter(g => g.status === 'Pending').length, color: "#70222B" },
      { name: "Assigned", value: guests.filter(g => g.status === 'Assigned').length, color: "#D97706" },
      { name: "Distributed", value: guests.filter(g => g.status === 'Distributed').length, color: "#059669" }
    ];
    setStatusData(statusCounts);

    // 3. Daily Activity (last 7 days)
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const activity = dates.map(dt => {
      const parts = dt.split("-");
      return {
        date: `${parts[2]}/${parts[1]}`,
        "Delivered": guests.filter(g => g.status === 'Distributed').length // mock scale
      };
    });
    setDailyData(activity);
  };

  const total = guests.length;
  const distributed = guests.filter(g => g.status === "Distributed").length;
  const remaining = total - distributed;
  const progress = total > 0 ? Math.round((distributed / total) * 100) : 0;

  if (loading && guests.length === 0) {
    return <div className="h-64 bg-cream-light animate-pulse rounded border border-gold/15"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cream-light border border-gold/30 rounded p-4 shadow-sm">
          <span className="text-[9px] font-cinzel tracking-wider text-gray-500 uppercase">Distribution Progress</span>
          <div className="text-3xl font-bold font-mono text-maroon mt-1">{progress}%</div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
            <div className="bg-gold h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="bg-cream-light border border-gold/30 rounded p-4 shadow-sm">
          <span className="text-[9px] font-cinzel tracking-wider text-gray-500 uppercase">Total Cards Printed</span>
          <div className="text-3xl font-bold font-mono text-maroon-dark mt-1">{total}</div>
        </div>
        <div className="bg-cream-light border border-gold/30 rounded p-4 shadow-sm">
          <span className="text-[9px] font-cinzel tracking-wider text-gray-500 uppercase">Distributed Cards</span>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-1">{distributed}</div>
        </div>
        <div className="bg-cream-light border border-gold/30 rounded p-4 shadow-sm">
          <span className="text-[9px] font-cinzel tracking-wider text-gray-500 uppercase">Remaining Cards</span>
          <div className="text-3xl font-bold font-mono text-amber-700 mt-1">{remaining}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* City-wise */}
        <div className="bg-cream-light border border-gold-foil/30 rounded-lg p-5 shadow">
          <h4 className="font-cinzel text-maroon-dark text-xs font-semibold tracking-wider mb-4 pb-2 border-b border-gold/20">
            City-wise Distribution Rate
          </h4>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                <XAxis dataKey="name" stroke="#6B5544" />
                <YAxis stroke="#6B5544" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total Cards" fill="#E6DEC9" stroke="#8C6615" strokeWidth={1} />
                <Bar dataKey="Distributed" fill="#4E141B" stroke="#2A080C" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Share */}
        <div className="bg-cream-light border border-gold-foil/30 rounded-lg p-5 shadow">
          <h4 className="font-cinzel text-maroon-dark text-xs font-semibold tracking-wider mb-4 pb-2 border-b border-gold/20">
            Invitation Status Share
          </h4>
          <div className="h-[250px] w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Line */}
        <div className="bg-cream-light border border-gold-foil/30 rounded-lg p-5 shadow lg:col-span-2">
          <h4 className="font-cinzel text-maroon-dark text-xs font-semibold tracking-wider mb-4 pb-2 border-b border-gold/20">
            Daily Delivery Activity (Last 7 Days)
          </h4>
          <div className="h-[280px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                <XAxis dataKey="date" stroke="#6B5544" />
                <YAxis stroke="#6B5544" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Delivered" 
                  stroke="#D4AF37" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                  dot={{ stroke: '#4E141B', strokeWidth: 2, r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
