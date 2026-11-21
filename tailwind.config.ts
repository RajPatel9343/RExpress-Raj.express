import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          blue: {
            DEFAULT: '#2563EB',
            dark: '#1D4ED8',
            light: '#EFF6FF',
            hover: '#1E40AF',
          },
          white: '#FFFFFF',
          black: '#111827',
          gray: {
            dark: '#374151',
            medium: '#6B7280',
            light: '#F3F4F6',
            border: '#E5E7EB',
            bg: '#F9FAFB',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
