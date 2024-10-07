import { Category } from "@prisma/client";
import CategoryItem from "./category-item";

interface CategoriesProps {
  items: Category[];
}

const flagMap: Record<Category["name"], string> = {
  Khmer: "KH",
  English: "US",
  Spanish: "ES",
  Chinese: "CN",
  French: "FR",
  German: "DE",
  Vietnamese: "VN",
  Thai: "TH",
  Italian: "IT",
  Japanese: "JP",
  Korean: "KR",
  Russian: "RU",
  Dutch: "NL",
  Swedish: "SE",
  Finnish: "FI",
  Norwegian: "NO",
  Danish: "DK",
  Polish: "PL",
  Turkish: "TR",
  Hindi: "IN",
  Bengali: "BD",
  Punjabi: "IN",
  Persian: "IR",
  Indonesian: "ID",
  Malay: "MY"
};

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          countryCode={flagMap[item.name]} 
          value={item.id}
        />
      ))}
    </div>
  );
};
