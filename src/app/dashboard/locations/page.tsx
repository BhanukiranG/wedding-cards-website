"use client";

import { useEffect, useState } from "react";
import { useWeddingStore, type Guest } from "@/lib/store";
import { ChevronRight, MapPin } from "lucide-react";

export default function LocationGroups() {
  const { guests, loading, fetchGuests, markDelivered } = useWeddingStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeliver = async (id: number) => {
    await markDelivered(id, "Delivered from Area Accordion list.");
  };

  // Grouping
  const cities = Array.from(new Set(guests.map(g => g.city)));

  if (loading && guests.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-cream-light border border-gold/15 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-cream-light border border-gold-foil/30 p-4 rounded-lg shadow">
        <h3 className="font-cinzel text-maroon-dark text-sm font-semibold tracking-wider mb-2">Location Clustering</h3>
        <p className="text-xs text-gray-600">
          Guests are grouped by City and Village/Area below. Tap on headers to expand category lists.
        </p>
      </div>

      {cities.length === 0 ? (
        <div className="text-gray-500 italic text-center py-12">No locations recorded in database.</div>
      ) : (
        <div className="space-y-4">
          {cities.map((city) => {
            const cityGuests = guests.filter(g => g.city === city);
            const cityDelivered = cityGuests.filter(g => g.status === 'Distributed').length;
            const cityId = `city-${city.replace(/\s+/g, '')}`;
            const isCityExpanded = !!expanded[cityId];
            
            const villages = Array.from(new Set(cityGuests.map(g => g.village)));

            return (
              <div key={city} className="bg-cream-light border border-gold-foil/30 rounded-lg shadow overflow-hidden">
                <button 
                  onClick={() => toggleExpand(cityId)}
                  className="w-full flex items-center justify-between p-4 font-cinzel font-bold text-sm text-maroon-dark bg-maroon/5 hover:bg-maroon/10 text-left transition-colors"
                >
                  <span className="flex items-center">
                    <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${isCityExpanded ? "rotate-90" : ""}`} />
                    <span className="tracking-widest">{city.toUpperCase()}</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                    {cityDelivered} / {cityGuests.length} Delivered
                  </span>
                </button>

                {isCityExpanded && (
                  <div className="p-4 border-t border-gold-dark/20 space-y-3">
                    {villages.map((village) => {
                      const vilGuests = cityGuests.filter(g => g.village === village);
                      const vilId = `vil-${cityId}-${village.replace(/\s+/g, '')}`;
                      const isVilExpanded = !!expanded[vilId];

                      return (
                        <div key={village} className="border border-gold-dark/20 rounded bg-cream/30 overflow-hidden">
                          <button 
                            onClick={() => toggleExpand(vilId)}
                            className="w-full flex items-center justify-between p-3 font-semibold text-xs text-maroon hover:bg-cream-dark/20 text-left transition-colors"
                          >
                            <span className="flex items-center">
                              <ChevronRight className={`w-3.5 h-3.5 mr-2 transition-transform ${isVilExpanded ? "rotate-90" : ""}`} />
                              <span>{village}</span>
                            </span>
                            <span className="bg-gold/20 text-gold-dark font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                              {vilGuests.length} Guests
                            </span>
                          </button>

                          {isVilExpanded && (
                            <div className="bg-cream-light p-2 border-t border-gold-dark/10 divide-y divide-gold-dark/5">
                              {vilGuests.map((g) => {
                                let statusCol = "text-red-600";
                                if (g.status === 'Assigned') statusCol = "text-amber-600";
                                if (g.status === 'Distributed') statusCol = "text-emerald-600 font-bold";

                                return (
                                  <div key={g.id} className="py-2.5 px-4 flex items-center justify-between text-xs hover:bg-cream-light/60">
                                    <div>
                                      <span className="font-semibold text-maroon-dark">{g.name}</span>
                                      <div className="text-[10px] text-gray-500 mt-0.5">{g.address}</div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`${statusCol} text-[10px] uppercase font-semibold`}>{g.status}</span>
                                      <button 
                                        onClick={() => handleDeliver(g.id)}
                                        disabled={g.status === 'Distributed'}
                                        className="text-gold-dark hover:text-gold border border-gold-dark/40 px-2 py-0.5 rounded text-[10px] bg-cream/50 disabled:opacity-50 transition-all"
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
