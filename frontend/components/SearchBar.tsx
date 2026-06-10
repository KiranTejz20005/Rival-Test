import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search tasks by title..." }: SearchBarProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-350 dark:focus:border-neutral-700 transition duration-200 shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
        >
          <X className="h-4 w-4 text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors" />
        </button>
      )}
    </div>
  );
}

