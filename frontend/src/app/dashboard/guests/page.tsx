"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit3, MessageSquare, QrCode, X } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  mobile: string;
  familyMembers: number;
  village: string;
  city: string;
  state: string;
  status: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  assignedTo: string | null;
  distributedDate: string | null;
  distributedTime: string | null;
  remarks: string;
  notes: string;
}

export default function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [distributors, setDistributors] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [cities, setCities] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGuestId, setModalGuestId] = useState<number | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formFamily, setFormFamily] = useState(1);
  const [formVillage, setFormVillage] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("Andhra Pradesh");
  const [formStatus, setFormStatus] = useState("Pending");
  const [formAddress, setFormAddress] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");
  const [formAssigned, setFormAssigned] = useState("");
  const [formRemarks, setFormRemarks] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    loadDatabase();
  }, []);

  const loadDatabase = () => {
    const savedGuests = localStorage.getItem("wedding_guests");
    const savedUsers = localStorage.getItem("wedding_users");
    
    if (savedGuests) {
      const gList: Guest[] = JSON.parse(savedGuests);
      setGuests(gList);
      
      // Load cities
      const uniqueCities = Array.from(new Set(gList.map(g => g.city)));
      setCities(uniqueCities);
    }
    
    if (savedUsers) {
      const uList = JSON.parse(savedUsers);
      setDistributors(uList.map((u: any) => u.fullName));
    }
  };

  const handleSaveGuests = (updatedList: Guest[]) => {
    setGuests(updatedList);
    localStorage.setItem("wedding_guests", JSON.stringify(updatedList));
    // Update unique cities list
    setCities(Array.from(new Set(updatedList.map(g => g.city))));
  };

  const openAddModal = () => {
    setModalGuestId(null);
    setFormName("");
    setFormMobile("");
    setFormFamily(1);
    setFormVillage("");
    setFormCity("");
    setFormState("Andhra Pradesh");
    setFormStatus("Pending");
    setFormAddress("");
    setFormLat(String(17.4325 + (Math.random() - 0.5) * 0.1));
    setFormLng(String(78.4074 + (Math.random() - 0.5) * 0.1));
    setFormAssigned("");
    setFormRemarks("");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setModalGuestId(guest.id);
    setFormName(guest.name);
    setFormMobile(guest.mobile);
    setFormFamily(guest.familyMembers);
    setFormVillage(guest.village);
    setFormCity(guest.city);
    setFormState(guest.state);
    setFormStatus(guest.status);
    setFormAddress(guest.fullAddress);
    setFormLat(guest.latitude ? String(guest.latitude) : "");
    setFormLng(guest.longitude ? String(guest.longitude) : "");
    setFormAssigned(guest.assignedTo || "");
    setFormRemarks(guest.remarks);
    setFormNotes(guest.notes);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      const updated = guests.filter(g => g.id !== id);
      handleSaveGuests(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formMobile || !formCity || !formAddress) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    let updatedGuests = [...guests];

    if (modalGuestId !== null) {
      // Edit
      updatedGuests = updatedGuests.map(g => {
        if (g.id === modalGuestId) {
          const wasDistributed = g.status === 'Distributed';
          return {
            ...g,
            name: formName,
            mobile: formMobile,
            familyMembers: formFamily,
            village: formVillage,
            city: formCity,
            state: formState,
            status: formStatus,
            fullAddress: formAddress,
            latitude: formLat ? parseFloat(formLat) : null,
            longitude: formLng ? parseFloat(formLng) : null,
            assignedTo: formAssigned || null,
            remarks: formRemarks,
            notes: formNotes,
            distributedDate: formStatus === 'Distributed' ? (wasDistributed ? g.distributedDate : todayStr) : null,
            distributedTime: formStatus === 'Distributed' ? (wasDistributed ? g.distributedTime : timeStr) : null,
          };
        }
        return g;
      });
    } else {
      // Add
      const newGuest: Guest = {
        id: Date.now(),
        name: formName,
        mobile: formMobile,
        familyMembers: formFamily,
        village: formVillage,
        city: formCity,
        state: formState,
        status: formStatus,
        fullAddress: formAddress,
        latitude: formLat ? parseFloat(formLat) : null,
        longitude: formLng ? parseFloat(formLng) : null,
        assignedTo: formAssigned || null,
        remarks: formRemarks,
        notes: formNotes,
        distributedDate: formStatus === 'Distributed' ? todayStr : null,
        distributedTime: formStatus === 'Distributed' ? timeStr : null,
      };
      updatedGuests.push(newGuest);
    }

    handleSaveGuests(updatedGuests);
    setIsModalOpen(false);
  };

  const filteredGuests = guests.filter(g => {
    const term = search.toLowerCase();
    const matchesSearch = 
      g.name.toLowerCase().includes(term) ||
      g.mobile.includes(term) ||
      g.village.toLowerCase().includes(term) ||
      g.city.toLowerCase().includes(term) ||
      g.remarks.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "ALL" || g.status === statusFilter;
    const matchesCity = cityFilter === "ALL" || g.city === cityFilter;

    return matchesSearch && matchesStatus && matchesCity;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-cream-light border border-gold-foil/30 p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <input 
            type="text" 
            placeholder="Fuzzy search name, area, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gold-dark/40 rounded text-sm focus:outline-none focus:border-gold bg-cream/30 text-maroon-dark font-medium"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/80" />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gold-dark/40 px-3 py-2 rounded text-xs bg-cream/40 text-maroon-dark focus:outline-none focus:border-gold font-medium"
          >
            <option value="ALL">All Invitation Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Distributed">Distributed</option>
          </select>

          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-gold-dark/40 px-3 py-2 rounded text-xs bg-cream/40 text-maroon-dark focus:outline-none focus:border-gold font-medium"
          >
            <option value="ALL">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button 
            onClick={openAddModal}
            className="btn-gold text-xs px-4 py-2 rounded flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-cinzel tracking-wider">Add New Guest</span>
          </button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-cream-light border border-gold/30 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-maroon/5 border-b-2 border-gold/20 text-maroon font-cinzel font-semibold uppercase tracking-wider">
                <th className="p-3 pl-4">Guest Info</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-center">Family Count</th>
                <th className="p-3">Location (Area, City)</th>
                <th className="p-3">Invitation Status</th>
                <th className="p-3">Allocation / Remarks</th>
                <th className="p-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-playfair italic">
                    No matching wedding guests found.
                  </td>
                </tr>
              ) : (
                filteredGuests.map(g => {
                  let badge = "bg-red-50 text-red-700 border border-red-200";
                  if (g.status === 'Assigned') badge = "bg-amber-50 text-amber-700 border border-amber-200";
                  if (g.status === 'Distributed') badge = "bg-emerald-50 text-emerald-700 border border-emerald-200";

                  const mapsUrl = g.latitude && g.longitude
                    ? `https://www.google.com/maps/search/?api=1&query=${g.latitude},${g.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.fullAddress)}`;

                  const waText = encodeURIComponent(
                    `Namaskaram! 🌸\nWe cordially invite you to the wedding ceremony of SIVARAMA & LAKSHMI on August 27, 2026.\n\nInvitation details for: *${g.name}*\nFamily Members: ${g.familyMembers}\nAddress: ${g.fullAddress}\nInvitation Card Status: ${g.status}\n\nWe look forward to seeking your blessings!\nLocate Venue: https://maps.app.goo.gl/MConventionVijayawada`
                  );

                  return (
                    <tr key={g.id} className="border-b border-gold-dark/10 hover:bg-cream-dark/10 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-bold text-maroon-dark">{g.name}</div>
                        <div className="text-[10px] text-gray-500">{g.notes || "No special notes"}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{g.mobile}</div>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <a 
                            href={`https://api.whatsapp.com/send?phone=91${g.mobile}&text=${waText}`} 
                            target="_blank" 
                            className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Invite</span>
                          </a>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => alert(`Registry barcode details:\nGuest UID: ${g.id}\nStatus: ${g.status}`)}
                            className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-0.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR</span>
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-maroon">{g.familyMembers}</td>
                      <td className="p-3">
                        <div className="font-semibold text-[#553311]">{g.village}, {g.city}</div>
                        <a href={mapsUrl} target="_blank" className="text-blue-600 hover:text-blue-700 flex items-center space-x-0.5 mt-0.5">
                          <span>Google Maps</span>
                        </a>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-700">{g.assignedTo || "Unassigned"}</div>
                        <div className="text-[9px] text-gray-500 max-w-[150px] truncate">{g.remarks || "-"}</div>
                      </td>
                      <td className="p-3 text-right pr-4">
                        <div className="inline-flex space-x-1">
                          <button 
                            onClick={() => openEditModal(g)}
                            className="p-1 border border-gold-dark/40 rounded text-gold-dark hover:bg-gold/10"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(g.id)}
                            className="p-1 border border-red-200 rounded text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-gold/20 bg-cream/50 flex justify-between items-center text-xs text-maroon font-semibold">
          <div>Total matches: {filteredGuests.length} guests</div>
          <div className="text-[10px] text-gray-500 font-normal">Active sync with localized data schema</div>
        </div>
      </div>

      {/* Guest Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-maroon-dark/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-parchment border-2 border-gold-foil rounded-lg shadow-2xl overflow-hidden glass-panel flex flex-col max-h-[90vh]">
            
            <div className="bg-maroon-royal text-cream px-6 py-4 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></div>
                <h3 className="font-cinzel text-gold text-sm font-semibold tracking-wider">
                  {modalGuestId ? "Edit Guest Details" : "Add Auspicious Guest"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-gold-light">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-xs">
              <form onSubmit={handleSaveForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">GUEST NAME *</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    required 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">MOBILE NUMBER *</label>
                  <input 
                    type="tel" 
                    value={formMobile} 
                    onChange={e => setFormMobile(e.target.value)} 
                    required 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">FAMILY MEMBERS COUNT</label>
                  <input 
                    type="number" 
                    value={formFamily} 
                    onChange={e => setFormFamily(parseInt(e.target.value) || 1)} 
                    min={1} 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">VILLAGE / LOCAL AREA *</label>
                  <input 
                    type="text" 
                    value={formVillage} 
                    onChange={e => setFormVillage(e.target.value)} 
                    required 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">CITY *</label>
                  <input 
                    type="text" 
                    value={formCity} 
                    onChange={e => setFormCity(e.target.value)} 
                    required 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">STATE</label>
                  <input 
                    type="text" 
                    value={formState} 
                    onChange={e => setFormState(e.target.value)} 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">INVITEE STATUS</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value)} 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Distributed">Distributed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">FULL HOME ADDRESS *</label>
                  <textarea 
                    value={formAddress} 
                    onChange={e => setFormAddress(e.target.value)} 
                    required 
                    rows={2} 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">MAPS LATITUDE</label>
                  <input 
                    type="number" 
                    value={formLat} 
                    onChange={e => setFormLat(e.target.value)} 
                    step="any" 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">MAPS LONGITUDE</label>
                  <input 
                    type="number" 
                    value={formLng} 
                    onChange={e => setFormLng(e.target.value)} 
                    step="any" 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>

                {(formStatus === "Assigned" || formStatus === "Distributed") && (
                  <div>
                    <label className="block font-cinzel font-semibold text-maroon-dark mb-1">ASSIGNED DISTRIBUTOR</label>
                    <select 
                      value={formAssigned} 
                      onChange={e => setFormAssigned(e.target.value)} 
                      className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                    >
                      <option value="">Choose distributor...</option>
                      {distributors.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                {formStatus === "Distributed" && (
                  <div>
                    <label className="block font-cinzel font-semibold text-maroon-dark mb-1">DISTRIBUTION REMARKS</label>
                    <input 
                      type="text" 
                      value={formRemarks} 
                      onChange={e => setFormRemarks(e.target.value)} 
                      className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">SPECIAL NOTES</label>
                  <input 
                    type="text" 
                    value={formNotes} 
                    onChange={e => setFormNotes(e.target.value)} 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium"
                  />
                </div>
              </form>
            </div>

            <div className="bg-cream border-t border-gold/20 px-6 py-4 flex justify-between items-center">
              <span className="text-[10px] text-gray-500">* Required fields</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="border border-gold-dark/60 text-maroon-dark px-4 py-2 rounded font-cinzel tracking-wider uppercase hover:bg-cream-dark/20 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveForm}
                  className="btn-gold px-5 py-2 rounded font-cinzel tracking-wider uppercase"
                >
                  Record Registry
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
