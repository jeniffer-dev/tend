import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui's class merge helper. Not business logic — it resolves
 *  conflicting Tailwind classes and nothing else. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
