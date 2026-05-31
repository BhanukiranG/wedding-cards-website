"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  mobile: string;
  familyMembers: number;
  village: string;
  city: string;
  status: string;
  fullAddress: string;
}

export default function LocationGroups() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedGuests = localStorage.getItem("wedding_guests");
    if (savedGuests) {
      setGuests(JSON.parse(savedGuests));
    }
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const quickMarkDelivered = (id: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const updated = guests.map(g => {
      if (g.id === id) {
        return {
          ...g,
          status: 'Distributed',
          distributedDate: todayStr,
          distributedTime: timeStr,
          remarks: "Marked delivered from Location Groups view."
        };
      }
      return g;
    });

    setGuests(updated);
    localStorage.setItem("wedding_guests", JSON.stringify(updated));
  };

  // Grouping
  const cities = Array.from(new Set(guests.map(g => g.city)));

  return (
    <div className="space-y-6">
      <div className="bg-cream-light border border-gold-foil/30 p-4 rounded-lg shadow">
        <h3 className="font-cinzel text-maroon-dark text-sm font-semibold tracking-wider mb-2">Location Clustering</h3>
        <p className="text-xs text-gray-600">
          For ease of physical card distribution, guests are clustered by City and Village/Area below. Click a header to expand/collapse.
        </p>
      </div>

      {cities.length === 0 ? (
        <div className="text-gray-500 italic text-center py-6">No locations stored in registry.</div>
      ) : (
        <div className="space-y-4">
          {cities.map(city => {
            const cityGuests = guests.filter(g => g.city === city);
            const cityCount = cityGuests.length;
            const cityDelivered = cityGuests.filter(g => g.status === 'Distributed').length;
            
            const cityId = `city-${city.replace(/\s+/g, '')}`;
            const isCityExpanded = !!expandedItems[cityId];
            
            const villages = Array.from(new Set(cityGuests.map(g => g.village || "General")));

            return (
              <div key={city} className="bg-cream-light border border-gold-foil/30 rounded-lg shadow overflow-hidden">
                <button 
                  onClick={() => toggleExpand(cityId)}
                  className="w-full flex items-center justify-between p-4 font-cinzel font-bold text-sm text-maroon-dark bg-maroon/5 hover:bg-maroon/10 text-left"
                >
                  <span className="flex items-center">
                    <ChevronRight className={`w-4.5 h-4.5 mr-2 transition-transform ${isCityExpanded ? "rotate-90" : ""}`} />
                    {city.toUpperCase()}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                    {cityDelivered} / {cityCount} Cards Done
                  </span>
                </button>

                {isCityExpanded && (
                  <div className="p-4 border-t border-gold-dark/20 space-y-2">
                    {villages.map(village => {
                      const vilGuests = cityGuests.filter(g => (g.village || "General") === village);
                      const vilId = `vil-${cityId}-${village.replace(/\s+/g, '')}`;
                      const isVilExpanded = !!expandedItems[vilId];

                      return (
                        <div key={village} className="border border-gold-dark/20 rounded bg-cream/40 overflow-hidden mb-2">
                          <button 
                            onClick={() => toggleExpand(vilId)}
                            className="w-full flex items-center justify-between p-3 font-semibold text-xs text-maroon hover:bg-cream-dark/25 text-left"
                          >
                            <span className="flex items-center">
                              <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${isVilExpanded ? "rotate-90" : ""}`} />
                              {village}
                            </span>
                            <span className="bg-gold/20 text-gold-dark font-bold px-2 py-0.5 rounded-full text-[10px]">
                              {vilGuests.length} guests
                            </span>
                          </button>

                          {isVilExpanded && (
                            <div className="bg-cream-light p-2 border-t border-gold-dark/10 divide-y divide-gold-dark/5">
                              {vilGuests.map(g => {
                                let statusCol = "text-red-600";
                                if (g.status === 'Assigned') statusCol = "text-amber-600";
                                if (g.status === 'Distributed') statusCol = "text-emerald-600 font-bold";

                                return (
                                  <div key={g.id} className="py-2.5 px-4 flex items-center justify-between text-xs hover:bg-cream-light/60">
                                    <div>
                                      <span className="font-semibold text-maroon-dark">{g.name}</span>
                                      <span className="text-gray-500 text-[10px] ml-2">({g.familyMembers} members)</span>
                                      <div className="text-[10px] text-gray-500 mt-0.5">{g.fullAddress}</div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`${statusCol} text-[10px] uppercase font-semibold`}>{g.status}</span>
                                      <button 
                                        onClick={() => quickMarkDelivered(g.id)}
                                        disabled={g.status === 'Distributed'}
                                        className="text-gold-dark hover:text-gold border border-gold-dark/40 px-2 py-0.5 rounded text-[10px] bg-cream/50 disabled:opacity-50"
                                      >
                                        Delivered
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
