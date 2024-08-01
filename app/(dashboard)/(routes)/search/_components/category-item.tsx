"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import Flag from "react-world-flags";

interface CategoryItemProps {
  label: string;
  value?: string;
  countryCode?: string;
}

const CategoryItem = ({ label, value, countryCode }: CategoryItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get("categoryId");
  const currentTitle = searchParams.get("title");

  const isSelected = currentCategoryId === value;

  const onClick = () => {
    const url = qs.stringifyUrl({
      url: pathname,
      query: { title: currentTitle, categoryId: isSelected ? null : value },
    }, { skipNull: true, skipEmptyString: true });

    router.push(url);
  };

  return (
    <button
      onClick={onClick}
      className={`py-2 px-3 text-sm border rounded-full flex items-center gap-x-1 transition-colors
        hover:border-sky-700
        ${isSelected ? 'border-sky-700 bg-sky-200/20 text-sky-800' : 'border-slate-200'}`}
    >
      {countryCode && (
        <div className="w-5 h-5"> 
          <Flag code={countryCode} className="w-full h-full" />
        </div>
      )}
      <div className="truncate">{label}</div>
    </button>
  );
};

export default CategoryItem;
