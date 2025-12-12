import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

export const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, prefix, min = 0, max }) => {
  return (
    <div className="mb-4">
      <label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>
      <div className="relative group">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400 group-focus-within:text-premium-gold">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          value={value || ''}
          min={min}
          max={max}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 ${prefix ? 'pl-8' : 'pl-4'} pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-premium-gold/50 focus:border-premium-gold transition-all`}
        />
      </div>
    </div>
  );
};

export const SliderInput: React.FC<NumberInputProps> = ({ label, value, onChange, min = 0, max = 100, step = 1, prefix, suffix }) => {
  // Calculate percentage for background gradient
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <label className="text-slate-300 text-sm font-medium">{label}</label>
        <span className="text-premium-gold font-bold font-mono">
          {prefix}{value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700"
        style={{
          background: `linear-gradient(to right, #fbbf24 ${percentage}%, #334155 ${percentage}%)`
        }}
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{prefix}{min}{suffix}</span>
        <span>{prefix}{max}{suffix}</span>
      </div>
    </div>
  );
};

interface SelectInputProps {
  label: string;
  value: number;
  options: { label: string; value: number }[];
  onChange: (val: number) => void;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, value, options, onChange }) => (
  <div className="mb-4">
    <label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-premium-gold/50 focus:border-premium-gold transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  </div>
);