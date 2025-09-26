import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "long", 
    year: "numeric"
  })
}

export function formatSalary(min?: number, max?: number, currency = "USD") {
  if (!min && !max) return "Nije specificirano"
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
  if (min) return `Od ${min.toLocaleString()} ${currency}`
  if (max) return `Do ${max.toLocaleString()} ${currency}`
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}
