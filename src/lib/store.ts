import { create } from "zustand";
import { supabase } from "./supabase";

export interface Guest {
  id: number;
  name: string;
  phone: string;
  address: string;
  village: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
  status: "Pending" | "Assigned" | "Distributed";
  created_at: string;
  familyMembers?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Distributor";
  created_at: string;
}

export interface Distribution {
  id: number;
  guest_id: number;
  assigned_to: string | null;
  assigned_date: string;
  delivered_date: string | null;
  remarks: string;
}

interface WeddingStore {
  guests: Guest[];
  users: User[];
  distributions: Distribution[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchGuests: () => Promise<void>;
  addGuest: (guest: Omit<Guest, "id" | "created_at">) => Promise<void>;
  updateGuest: (id: number, guest: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: number) => Promise<void>;
  
  fetchUsers: () => Promise<void>;
  fetchDistributions: () => Promise<void>;
  assignDistribution: (guestId: number, userId: string | null) => Promise<void>;
  markDelivered: (guestId: number, remarks: string) => Promise<void>;
}

export const useWeddingStore = create<WeddingStore>((set, get) => ({
  guests: [],
  users: [],
  distributions: [],
  loading: false,
  error: null,

  fetchGuests: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("name", { ascending: true });
        
      if (error) throw error;
      set({ guests: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addGuest: async (guest) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("guests")
        .insert([guest])
        .select();
        
      if (error) throw error;
      if (data) {
        set((state) => ({ guests: [...state.guests, data[0]].sort((a,b) => a.name.localeCompare(b.name)), loading: false }));
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateGuest: async (id, guest) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("guests")
        .update(guest)
        .eq("id", id)
        .select();
        
      if (error) throw error;
      if (data) {
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? data[0] : g)),
          loading: false
        }));
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteGuest: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("guests")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      set((state) => ({
        guests: state.guests.filter((g) => g.id !== id),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchUsers: async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name");
        
      if (error) throw error;
      set({ users: data || [] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchDistributions: async () => {
    try {
      const { data, error } = await supabase
        .from("distributions")
        .select("*");
        
      if (error) throw error;
      set({ distributions: data || [] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  assignDistribution: async (guestId, userId) => {
    try {
      // 1. Check if distribution log already exists
      const { data: existing } = await supabase
        .from("distributions")
        .select("id")
        .eq("guest_id", guestId)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from("distributions")
          .update({ 
            assigned_to: userId,
            assigned_date: new Date().toISOString().split("T")[0]
          })
          .eq("guest_id", guestId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("distributions")
          .insert([{ 
            guest_id: guestId, 
            assigned_to: userId,
            assigned_date: new Date().toISOString().split("T")[0]
          }]);
        if (error) throw error;
      }

      // 2. Update guest status to Assigned (or Pending if userId is null)
      const newStatus = userId ? "Assigned" : "Pending";
      await get().updateGuest(guestId, { status: newStatus });
      await get().fetchDistributions();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  markDelivered: async (guestId, remarks) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const { error: distErr } = await supabase
        .from("distributions")
        .update({
          delivered_date: todayStr,
          remarks: remarks || "Hand-delivered successfully."
        })
        .eq("guest_id", guestId);
      if (distErr) throw distErr;

      // Update guest status
      await get().updateGuest(guestId, { status: "Distributed" });
      await get().fetchDistributions();
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
