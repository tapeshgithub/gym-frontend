import React from 'react';
import { RiSearchLine } from 'react-icons/ri';

const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <RiSearchLine
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500 pointer-events-none"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
    />
  </div>
);

export default SearchInput;
