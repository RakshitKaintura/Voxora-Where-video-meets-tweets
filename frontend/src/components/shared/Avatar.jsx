import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

// User avatar with image and fallback initials.
//
// Props:
//  - src: string        — image URL (Cloudinary)
//  - alt: string        — alt text / user's name
//  - size: 'xs'|'sm'|'md'|'lg'|'xl'  — preset size. Defaults to 'md'
//  - className: string  — extra classes
const SIZE_MAP = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
}

export default function Avatar({ src, alt = '', size = 'md', className }) {
  const sizeClasses = SIZE_MAP[size] ?? SIZE_MAP.md

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden shrink-0 flex items-center justify-center font-semibold select-none',
        sizeClasses,
        className
      )}
      style={{
        backgroundColor: src ? 'transparent' : 'hsl(var(--red))',
        color: 'white',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // If image fails, hide it and show initials
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span>{getInitials(alt)}</span>
      )}
    </div>
  )
}
