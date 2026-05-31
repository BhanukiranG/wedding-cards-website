"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FloatingPetals from "@/components/FloatingPetals";

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit recovery request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-maroon-royal flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingPetals />
      
      <div className="w-full max-w-md bg-parchment border-2 border-gold-foil p-8 rounded-lg shadow-2xl relative z-10 glass-panel">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center space-x-1 text-xs text-maroon hover:text-gold-dark font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Log-in</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-cinzel text-maroon-dark text-xl font-bold tracking-wider">PASSWORD RECOVERY</h2>
          <p className="text-gold-dark font-playfair italic text-xs mt-1">Restore your access to the Wedding Portal</p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-2"></div>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded text-xs text-center space-y-2">
            <p className="font-bold">✓ Reset Link Transmitted</p>
            <p className="text-gray-600">Please audit your inbox. Click the link in the email to configure your new credentials.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-maroon-dark tracking-wider uppercase mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  {...register("email")}
                  placeholder="name@wedding.com"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gold-dark/40 bg-cream-light/60 focus:outline-none focus:border-gold rounded font-medium text-maroon-dark"
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gold-dark/70" />
              </div>
              {errors.email && (
                <p className="text-red-600 text-[10px] mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 btn-gold rounded text-sm uppercase tracking-widest font-cinzel disabled:opacity-50"
            >
              {loading ? "Transmitting..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
