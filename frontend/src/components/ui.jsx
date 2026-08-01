import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-line bg-panel/80 p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] ${className}`}>
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-paper/55 font-medium">{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper/30 outline-none transition-colors focus:border-blaze ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper outline-none transition-colors focus:border-blaze ${props.className || ''}`}
    />
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blaze text-white hover:bg-red-500 hover:shadow-blaze active:scale-[0.97]',
    ghost: 'border border-line text-paper/80 hover:border-blaze/60 hover:text-white active:scale-[0.97]',
    danger: 'border border-blazeDim text-red-300 hover:bg-blaze/10 active:scale-[0.97]',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-6 animate-fadeUp">
      {eyebrow && <p className="mb-1 font-mono text-xs uppercase tracking-widest text-blaze">{eyebrow}</p>}
      <h1 className="font-display text-2xl font-semibold text-paper sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-paper/50">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="animate-fadeUp rounded-xl border border-dashed border-line py-14 text-center">
      <p className="font-display text-base text-paper/70">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-paper/40">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-paper/40">
      <span className="h-2 w-2 animate-pulseLine rounded-full bg-blaze" />
      Loading…
    </div>
  );
}
