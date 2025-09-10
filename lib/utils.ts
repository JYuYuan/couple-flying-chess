import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomMs(minMs: number, maxMs: number) {
  if (minMs > maxMs) {
    throw new Error('minMs 不能大于 maxMs');
  }
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
