"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 shadow-[0_2px_8px_-2px_rgba(194,65,12,0.3)] group-hover:shadow-[0_4px_16px_-4px_rgba(194,65,12,0.4)] transition-all duration-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5.5 h-5.5 text-white"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 13.87A4 4 0 0 1 9.87 10a3.2 3.2 0 0 0 2.13-1.5" />
          <path d="M12 3a9 9 0 0 0-9 9c0 2.6.68 4.47 1.5 5.76a4 4 0 0 0 3.5 2.12h8a4 4 0 0 0 3.5-2.12C20.32 16.47 21 14.6 21 12a9 9 0 0 0-9-9z" />
          <path d="M9 13.5c0 1 .5 2 1.5 2.5s2.5.5 3.5 0 1.5-1.5 1.5-2.5" />
          <path d="M10 8.5c-.5 1-.5 2-.5 2.5" />
          <path d="M14 8.5c.5 1 .5 2 .5 2.5" />
        </svg>
        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-serif text-xl tracking-tight text-stone-900 -mb-0.5 group-hover:text-orange-700 transition-colors">
          Pop-up
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-semibold">
          Kitchen
        </span>
      </div>
    </Link>
  );
}
