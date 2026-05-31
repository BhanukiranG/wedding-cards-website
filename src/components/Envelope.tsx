"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EnvelopeProps {
  onEnter: () => void;
}

export default function Envelope({ onEnter }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl z-10">
      <div className="text-center mb-8 px-4">
        <div className="font-vibes text-gold text-4xl mb-2">Sri Rama Prasanna</div>
        <h2 className="font-cinzel text-gold-light text-2xl md:text-3xl tracking-widest leading-relaxed">
          ROYAL WEDDING INVITATION
        </h2>
        <p className="text-cream/70 font-playfair italic text-sm mt-3">
          "Marriage is the union of two souls in sacred matrimony. We invite you to witness this auspicious journey."
        </p>
      </div>

      {/* 3D Envelope Container */}
      <div 
        onClick={() => setIsOpen(true)}
        className={`envelope-wrapper transition-transform duration-500 ${
          isOpen ? "open cursor-default" : "hover:scale-[1.02]"
        }`}
      >
        <div className="envelope">
          {/* Top Flap */}
          <div className="envelope-flap"></div>
          
          {/* Wax Seal */}
          <div className="wax-seal">
            <span>S</span>
          </div>
          
          {/* Wedding Letter Card */}
          <div className="letter-card bg-parchment border-2 border-double border-gold/60 flex flex-col items-center justify-between p-6">
            <div className="w-full text-center border-b border-gold/30 pb-3">
              <h4 className="font-cinzel text-maroon text-sm font-semibold tracking-widest">SIVARAMA & LAKSHMI</h4>
              <p className="font-vibes text-gold-dark text-xl mt-1">Wedding Ceremony</p>
            </div>
            
            <div className="text-center my-4">
              <p className="text-[10px] text-maroon-light tracking-wide uppercase font-semibold">Join the Auspicious Event</p>
              <p className="font-playfair font-semibold text-lg text-maroon-dark my-1">August 27, 2026</p>
              <p className="text-[10px] text-gray-600">M Convention Center, Vijayawada</p>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEnter();
              }}
              className="w-full btn-gold text-xs py-2 px-4 rounded tracking-wider uppercase"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-cream/40 text-[10px] font-cinzel tracking-widest uppercase animate-pulse">
        {!isOpen ? "Click Wax Seal to Break & Open" : "Click 'Access Dashboard' on the letter"}
      </div>
    </div>
  );
}
