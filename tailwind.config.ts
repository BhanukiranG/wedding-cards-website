import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          dark: '#2A080C',
          DEFAULT: '#4E141B',
          light: '#70222B',
        },
        gold: {
          dark: '#8C6615',
          DEFAULT: '#D4AF37',
          light: '#F9E79F',
        },
        cream: {
          dark: '#E6DEC9',
          DEFAULT: '#FAF6EB',
          light: '#FDFDFB',
        }
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
        vibes: ["var(--font-vibes)", "cursive"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      backgroundImage: {
        'parchment': "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(230, 222, 201, 0.2) 100%)",
        'maroon-royal': "radial-gradient(circle at 50% 50%, rgba(112, 34, 43, 0.3) 0%, rgba(42, 8, 12, 0.9) 100%)"
      }
    },
  },
  plugins: [],
};
export default config;
