
import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative mb-8 group">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl py-4 px-6 text-lg focus:outline-none focus:border-cyan-500 transition-all duration-300 group-hover:border-slate-600"
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>
    </div>
  );
};

export default SearchInput;
