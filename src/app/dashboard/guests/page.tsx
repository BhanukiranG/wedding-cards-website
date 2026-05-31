"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestSchema, type GuestFormData } from "@/lib/validation";
import { useWeddingStore, type Guest } from "@/lib/store";
import { Search, Plus, Trash2, Edit3, MessageSquare, QrCode, X } from "lucide-react";

export default function GuestManagement() {
  const { guests, users, loading, fetchGuests, fetchUsers, addGuest, updateGuest, deleteGuest } = useWeddingStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      state: "Andhra Pradesh",
      status: "Pending"
    }
  });

  useEffect(() => {
    fetchGuests();
    fetchUsers();
  }, [fetchGuests, fetchUsers]);

  const openAddModal = () => {
    setEditingGuestId(null);
    reset({
      name: "",
      phone: "",
      address: "",
      village: "",
      city: "",
      state: "Andhra Pradesh",
      pincode: "",
      status: "Pending",
      notes: "",
      latitude: 16.5062 + (Math.random() - 0.5) * 0.1,
      longitude: 80.6480 + (Math.random() - 0.5) * 0.1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuestId(guest.id);
    reset({
      name: guest.name,
      phone: guest.phone,
      address: guest.address,
      village: guest.village,
      city: guest.city,
      state: guest.state,
      pincode: guest.pincode,
      status: guest.status,
      notes: guest.notes,
      latitude: guest.latitude || 16.5062,
      longitude: guest.longitude || 80.6480
    });
    setIsModalOpen(true);
  };

  const onFormSubmit = async (data: GuestFormData) => {
    if (editingGuestId) {
      await updateGuest(editingGuestId, data);
    } else {
      await addGuest(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      await deleteGuest(id);
    }
  };

  // Filters
  const cities = Array.from(new Set(guests.map(g => g.city)));

  const filteredGuests = guests.filter((g) => {
    const term = search.toLowerCase();
    const matchesSearch = 
      g.name.toLowerCase().includes(term) ||
      g.phone.includes(term) ||
      g.village.toLowerCase().includes(term) ||
      g.city.toLowerCase().includes(term);
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
            placeholder="Search name, phone, village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gold-dark/40 rounded text-sm focus:outline-none focus:border-gold bg-cream/30 text-maroon-dark font-medium"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/80" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gold-dark/40 px-3 py-2 rounded text-xs bg-cream/40 text-maroon-dark focus:outline-none focus:border-gold font-medium"
          >
            <option value="ALL">All Statuses</option>
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

      {/* Guest list */}
      <div className="bg-cream-light border border-gold/30 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-maroon/5 border-b-2 border-gold/20 text-maroon font-cinzel font-semibold uppercase tracking-wider">
                <th className="p-3 pl-4">Guest Info</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Location (Area, City)</th>
                <th className="p-3">Invitation Status</th>
                <th className="p-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-playfair italic">
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
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.address)}`;

                  const waText = encodeURIComponent(
                    `Namaskaram! 🌸\nWe cordially invite you to the wedding ceremony of SIVARAMA & LAKSHMI on August 27, 2026.\n\nInvitation details for: *${g.name}*\nAddress: ${g.address}\nInvitation Card Status: ${g.status}\n\nWe look forward to seeking your blessings!`
                  );

                  return (
                    <tr key={g.id} className="border-b border-gold-dark/10 hover:bg-cream-dark/10 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-bold text-maroon-dark">{g.name}</div>
                        <div className="text-[10px] text-gray-500">{g.notes || "No special notes"}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{g.phone}</div>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <a 
                            href={`https://api.whatsapp.com/send?phone=91${g.phone}&text=${waText}`} 
                            target="_blank" 
                            className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Invite</span>
                          </a>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => alert(`Digital Registry QR Code (UUID: ${g.id})`)}
                            className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-0.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR</span>
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#553311]">{g.village}, {g.city} ({g.pincode})</div>
                        <a href={mapsUrl} target="_blank" className="text-blue-600 hover:text-blue-700 flex items-center space-x-0.5 mt-0.5">
                          <span>Google Maps</span>
                        </a>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                          {g.status}
                        </span>
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
          <div className="text-[10px] text-gray-500 font-normal">Active sync with Supabase PostgreSQL</div>
        </div>
      </div>

      {/* Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-maroon-dark/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-parchment border-2 border-gold-foil rounded-lg shadow-2xl overflow-hidden glass-panel flex flex-col max-h-[90vh]">
            
            <div className="bg-maroon-royal text-cream px-6 py-4 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></div>
                <h3 className="font-cinzel text-gold text-sm font-semibold tracking-wider">
                  {editingGuestId ? "Edit Guest Details" : "Add Auspicious Guest"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-gold-light">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-xs">
              <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">GUEST NAME *</label>
                  <input 
                    type="text" 
                    {...register("name")}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none focus:border-gold"
                  />
                  {errors.name && <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">PHONE NUMBER *</label>
                  <input 
                    type="tel" 
                    {...register("phone")}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none focus:border-gold"
                  />
                  {errors.phone && <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">VILLAGE / LOCAL AREA *</label>
                  <input 
                    type="text" 
                    {...register("village")}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none focus:border-gold"
                  />
                  {errors.village && <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.village.message}</p>}
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">CITY *</label>
                  <input 
                    type="text" 
                    {...register("city")}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none focus:border-gold"
                  />
                  {errors.city && <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">STATE</label>
                  <input 
                    type="text" 
                    {...register("state")}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">PINCODE *</label>
                  <input 
                    type="text" 
                    {...register("pincode")}
                    maxLength={6}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none focus:border-gold"
                  />
                  {errors.pincode && <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.pincode.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">FULL HOME ADDRESS *</label>
                  <textarea 
                    {...register("address")}
                    rows={2} 
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none focus:border-gold"
                  />
                  {errors.address && <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.address.message}</p>}
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">MAPS LATITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    {...register("latitude", { valueAsNumber: true })}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">MAPS LONGITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    {...register("longitude", { valueAsNumber: true })}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-cinzel font-semibold text-maroon-dark mb-1">SPECIAL NOTES</label>
                  <input 
                    type="text" 
                    {...register("notes")}
                    className="w-full p-2 border border-gold-dark/40 bg-cream/30 rounded text-maroon-dark font-medium focus:outline-none"
                  />
                </div>
                
                <input type="submit" className="hidden" id="form-submit-btn" />
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
                <label 
                  htmlFor="form-submit-btn" 
                  className="btn-gold px-5 py-2 rounded font-cinzel tracking-wider uppercase cursor-pointer"
                >
                  Record Registry
                </label>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
