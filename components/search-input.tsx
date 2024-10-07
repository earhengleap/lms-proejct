"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import qs from "query-string";

const SearchInput = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 300); // 300ms debounce

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentCategoryId = searchParams.get("categoryId");

  const updateSearchParams = useCallback(
    (searchValue: string) => {
      const url = qs.stringifyUrl(
        {
          url: pathname,
          query: {
            categoryId: currentCategoryId,
            title: searchValue, 
          },
        },
        { skipNull: true, skipEmptyString: true }
      );

      router.push(url);
    },
    [currentCategoryId, pathname, router]
  );

  useEffect(() => {
    updateSearchParams(debouncedValue);
  }, [debouncedValue, updateSearchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSearchParams(value);
  };

  return (
    <form className="flex items-center relative" onSubmit={handleSubmit}>
      <Input
        onChange={handleInputChange}
        value={value}
        className="flex h-10 border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full lg:w-[600px] rounded-lg rounded-r-none focus-visible:ring-transparent pr-8"
        placeholder="Search for a course"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-sky-500 text-white hover:bg-sky-600 h-10 px-4 py-2 rounded-l-none"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
};

export default SearchInput;
