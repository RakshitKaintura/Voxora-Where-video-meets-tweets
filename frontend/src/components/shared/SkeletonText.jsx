import { cn } from '@/lib/utils'

// A single shimmering text-line placeholder.
//
// Props:
//  - width: string  e.g. 'w-3/4', 'w-full', 'w-24' (Tailwind width class)
//  - height: string e.g. 'h-4' (Tailwind height class). Defaults to h-3.5
//  - className: extra classes
export default function SkeletonText({ width = 'w-full', height = 'h-3.5', className }) {
  return (
    <div
      className={cn('skeleton rounded', width, height, className)}
    />
  )
}
