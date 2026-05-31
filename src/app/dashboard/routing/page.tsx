"use client";

import { useEffect, useState, useRef } from "react";
import { useWeddingStore, type Guest } from "@/lib/store";
import { Navigation } from "lucide-react";

export default function RoutePlanning() {
  const { guests, loading, fetchGuests, markDelivered } = useWeddingStore();
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [statusFilter, setStatusFilter] = useState("NOT_DISTRIBUTED");
  
  // Stats
  const [areaGuestsCount, setAreaGuestsCount] = useState(0);
  const [estDistance, setEstDistance] = useState("0.0 km");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLineRef = useRef<any>(null);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    if (guests.length > 0) {
      const uniqueAreas = Array.from(new Set(guests.map(g => `${g.city} - ${g.village || "General"}`)));
      setAreas(uniqueAreas);
      if (!selectedArea && uniqueAreas.length > 0) {
        setSelectedArea(uniqueAreas[0]);
      }
    }
  }, [guests, selectedArea]);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedArea) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([16.5062, 80.6480], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap'
        }).addTo(mapRef.current);
      }

      loadMarkers(L);
    };

    initMap();

    return () => {
      if (markersRef.current && mapRef.current) {
        markersRef.current.forEach(m => mapRef.current.removeLayer(m));
        markersRef.current = [];
      }
      if (routeLineRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
    };
  }, [selectedArea, statusFilter, guests]);

  const loadMarkers = (L: any) => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const [city, village] = selectedArea.split(" - ");
    const areaGuests = guests.filter(g => {
      const matchesArea = g.city === city && (g.village || "General") === village;
      if (!matchesArea) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "NOT_DISTRIBUTED") return g.status !== "Distributed";
      return g.status === "Distributed";
    });

    setAreaGuestsCount(areaGuests.length);
    setEstDistance("0.0 km");

    const bounds: any[] = [];

    areaGuests.forEach(g => {
      if (!g.latitude || !g.longitude) return;

      bounds.push([g.latitude, g.longitude]);

      let pinColor = "#DC2626";
      if (g.status === "Assigned") pinColor = "#D97706";
      if (g.status === "Distributed") pinColor = "#059669";

      const pinSVG = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C7.03 0 3 4.03 3 9C3 14.25 12 24 12 24C12 24 21 14.25 21 9C21 4.03 16.97 0 12 0ZM12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12Z" fill="${pinColor}" stroke="#D4AF37" stroke-width="1.5"/>
        </svg>
      `;

      const icon = L.divIcon({
        html: pinSVG,
        className: 'custom-leaflet-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      });

      const marker = L.marker([g.latitude, g.longitude], { icon }).addTo(map);

      // Bind window callback
      (window as any).deliverFromMapPin = async (id: number) => {
        await markDelivered(id, "Delivered via map pin popup action.");
        alert("Marked delivered!");
      };

      const popupHtml = `
        <div class="p-2 text-xs font-montserrat space-y-1.5" style="min-width: 180px;">
          <div class="font-bold text-maroon-dark text-sm border-b border-gold/30 pb-1">${g.name}</div>
          <div><b>Phone:</b> ${g.phone}</div>
          <div><b>Address:</b> ${g.address}</div>
          <div><b>Status:</b> <span class="font-semibold text-maroon">${g.status}</span></div>
          ${g.status !== 'Distributed' ? `
            <button onclick="window.deliverFromMapPin(${g.id})" class="w-full btn-gold py-1.5 rounded mt-2 text-[10px] font-semibold text-center uppercase tracking-wider">
              Mark Delivered
            </button>
          ` : `<div class='text-emerald-700 font-bold text-[10px] mt-1'>✓ Delivered</div>`}
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersRef.current.push(marker);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const handleOptimizeRoute = async () => {
    if (typeof window === "undefined" || guests.length <= 1) return;
    const L = (await import("leaflet")).default;
    const map = mapRef.current;
    if (!map) return;

    const [city, village] = selectedArea.split(" - ");
    const areaGuests = guests.filter(g => {
      const matchesArea = g.city === city && (g.village || "General") === village;
      if (!matchesArea) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "NOT_DISTRIBUTED") return g.status !== "Distributed";
      return g.status === "Distributed";
    }).filter(g => g.latitude && g.longitude);

    if (areaGuests.length <= 1) {
      alert("Need at least 2 coordinate points in the area to optimize route.");
      return;
    }

    const unvisited = [...areaGuests];
    const route: Guest[] = [];
    let current = unvisited.shift()!;
    route.push(current);

    while (unvisited.length > 0) {
      let bestIdx = 0;
      let bestDist = calcDistance(current.latitude!, current.longitude!, unvisited[0].latitude!, unvisited[0].longitude!);

      for (let i = 1; i < unvisited.length; i++) {
        const d = calcDistance(current.latitude!, current.longitude!, unvisited[i].latitude!, unvisited[i].longitude!);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      current = unvisited.splice(bestIdx, 1)[0];
      route.push(current);
    }

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    const latlngs: any[] = route.map(r => [r.latitude, r.longitude]);
    routeLineRef.current = L.polyline(latlngs, {
      color: "#AA7C11",
      weight: 4,
      opacity: 0.85,
      dashArray: "10, 8",
    }).addTo(map);

    let totalDist = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDist += calcDistance(route[i].latitude!, route[i].longitude!, route[i+1].latitude!, route[i+1].longitude!);
    }
    setEstDistance(`${totalDist.toFixed(2)} km`);
  };

  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Controls */}
      <div className="bg-cream-light border border-gold-foil/30 p-5 rounded-lg shadow flex flex-col justify-between space-y-4 lg:col-span-1">
        <div>
          <h4 className="font-cinzel text-maroon-dark text-xs font-semibold tracking-wider border-b border-gold-dark/20 pb-2 mb-4">Route Planner</h4>
          
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-cinzel font-semibold uppercase text-gray-600 mb-1">Select Distribution Area</label>
              <select 
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                className="w-full border border-gold-dark/40 px-3 py-2 rounded bg-cream/40 text-maroon-dark focus:outline-none"
              >
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-cinzel font-semibold uppercase text-gray-600 mb-1">Filter by Status</label>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full border border-gold-dark/40 px-3 py-2 rounded bg-cream/40 text-maroon-dark focus:outline-none"
              >
                <option value="ALL">All (Pending, Assigned, Distributed)</option>
                <option value="NOT_DISTRIBUTED">Needs Visit (Pending & Assigned)</option>
                <option value="Distributed">Distributed Only</option>
              </select>
            </div>

            <div className="bg-maroon/5 border border-gold/20 p-3 rounded space-y-2 mt-4 font-semibold text-maroon">
              <div className="font-cinzel text-[10px] font-bold text-maroon-dark">Area Statistics</div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-normal">Guests in Area:</span>
                <span>{areaGuestsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-normal">Estimated Distance:</span>
                <span className="text-gold-dark">{estDistance}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={handleOptimizeRoute}
            className="w-full btn-gold py-2 px-3 rounded text-xs font-cinzel tracking-wider uppercase flex items-center justify-center space-x-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Optimize Visiting Route</span>
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-3 bg-cream-light border border-gold-foil/30 rounded-lg shadow overflow-hidden flex flex-col h-[500px]">
        <div ref={mapContainerRef} className="w-full flex-1 z-10"></div>
        <div className="bg-cream border-t border-gold/20 p-2.5 flex flex-wrap items-center justify-between text-[10px] text-maroon-dark">
          <div className="flex space-x-4">
            <span className="flex items-center"><span class="w-3 h-3 rounded-full bg-red-600 border border-white mr-1 shadow"></span> Pending</span>
            <span className="flex items-center"><span class="w-3 h-3 rounded-full bg-amber-500 border border-white mr-1 shadow"></span> Assigned</span>
            <span className="flex items-center"><span class="w-3 h-3 rounded-full bg-emerald-600 border border-white mr-1 shadow"></span> Distributed</span>
          </div>
          <div>
            <span className="italic">Tip: Tap marker to see address and log status.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
