export interface CoursePublisher {
  name: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number | null;
  isPublished: boolean;
  createdAt: string;
  publisher: CoursePublisher;
  _count: {
    chapters: number;
    purchases: number;
  };
}

export type SortValue =
  | "date-desc"
  | "date-asc"
  | "price-desc"
  | "price-asc"
  | "students-desc"
  | "students-asc";

export type SortOption = {
  label: string;
  value: SortValue;
  sortFn: (a: Course, b: Course) => number;
};

export const SORT_OPTIONS: SortOption[] = [
  {
    label: "Newest First",
    value: "date-desc",
    sortFn: (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  },
  {
    label: "Oldest First",
    value: "date-asc",
    sortFn: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  {
    label: "Price: High to Low",
    value: "price-desc",
    sortFn: (a, b) => (b.price ?? 0) - (a.price ?? 0),
  },
  {
    label: "Price: Low to High",
    value: "price-asc",
    sortFn: (a, b) => (a.price ?? 0) - (b.price ?? 0),
  },
  {
    label: "Most Students",
    value: "students-desc",
    sortFn: (a, b) => b._count.purchases - a._count.purchases,
  },
  {
    label: "Least Students",
    value: "students-asc",
    sortFn: (a, b) => a._count.purchases - b._count.purchases,
  },
];

export const formatCoursePrice = (price: number | null): string =>
  price == null ? "Free" : `$${price.toLocaleString()}`;

export const formatCourseDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
