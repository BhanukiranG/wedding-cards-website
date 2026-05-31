"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import FloatingPetals from "@/components/FloatingPetals";

export default function ResetPassword() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update your password credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-maroon-royal flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingPetals />
      
      <div className="w-full max-w-md bg-parchment border-2 border-gold-foil p-8 rounded-lg shadow-2xl relative z-10 glass-panel">
        <div className="text-center mb-6">
          <h2 className="font-cinzel text-maroon-dark text-xl font-bold tracking-wider">RESET PASSWORD</h2>
          <p className="text-gold-dark font-playfair italic text-xs mt-1">Configure your new credentials</p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-2"></div>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded text-xs text-center space-y-4">
            <p className="font-bold">✓ Password Configured Successfully</p>
            <p className="text-gray-600">Your portal access details are active. Proceed back to the portal to authenticate.</p>
            <button 
              onClick={() => router.push("/")}
              className="w-full btn-gold py-2 rounded flex items-center justify-center space-x-1"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-maroon-dark tracking-wider uppercase mb-1">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gold-dark/40 bg-cream-light/60 focus:outline-none focus:border-gold rounded font-medium text-maroon-dark"
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/70" />
              </div>
              {errors.password && (
                <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-maroon-dark tracking-wider uppercase mb-1">Confirm New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gold-dark/40 bg-cream-light/60 focus:outline-none focus:border-gold rounded font-medium text-maroon-dark"
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/70" />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 btn-gold rounded text-sm uppercase tracking-widest font-cinzel disabled:opacity-50"
            >
              {loading ? "Writng new values..." : "Save Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
