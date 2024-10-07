import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(miliseconds: number) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - miliseconds) / 1000);

  const units = [
    { name: 'year', seconds: 3153600 }, 
    { name: 'month', seconds: 2592000 }, 
    { name: 'day', seconds: 86400 }, 
    { name: 'hour', seconds: 3600 }, 
    { name: 'minute', seconds: 60 }, 
    { name: 'second', seconds: 1 }, 
  ];

  for (const unit of units) {
    const count = Math.floor(diffInSeconds / unit.seconds);
    if (count >= 1) {
      return ` ${count} ${unit.name}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}



export function roundIfNumber(value: string | number | null) {
  if (typeof value === 'number') {
    
    return parseFloat(value.toFixed(2)); 
  } else if (typeof value === 'string') {
    const num = parseFloat(value);
    const rounded = parseFloat(num.toFixed(2));
    return rounded;
  }
  return value
}

