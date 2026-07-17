"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import qs from "query-string";

const SearchInput = () => {
  const [value, setValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedValue = useDebounce(value, 150);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentCategoryId = searchParams.get("categoryId");
  const currentTitle = searchParams.get("title");

  useEffect(() => {
    if (currentTitle) {
      setValue(currentTitle);
    }
  }, [currentTitle]);

  const updateSearchParams = useCallback(
    (searchValue: string) => {
      setIsSearching(true);
      const url = qs.stringifyUrl(
        {
          url: pathname,
          query: {
            categoryId: currentCategoryId,
            title: searchValue || undefined,
          },
        },
        { skipNull: true, skipEmptyString: true }
      );

      router.replace(url);
    },
    [currentCategoryId, pathname, router]
  );

  useEffect(() => {
    updateSearchParams(debouncedValue);
  }, [debouncedValue, updateSearchParams]);

  useEffect(() => {
    setIsSearching(false);
  }, [currentTitle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsSearching(true);
  };

  const handleClear = () => {
    setValue("");
    updateSearchParams("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-lg group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-sky-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          )}
        </div>
        <input
          ref={inputRef}
          onChange={handleInputChange}
          value={value}
          placeholder="Search courses..."
          className="w-full h-11 pl-10 pr-10 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
