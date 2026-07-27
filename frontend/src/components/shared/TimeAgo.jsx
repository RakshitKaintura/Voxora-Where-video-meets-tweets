import { timeAgo } from '@/lib/utils'

// Displays a relative time string ("2 hours ago", "just now").
// Automatically re-renders every minute so the time stays fresh.
//
// Props:
//  - date: string | Date  — ISO date string or Date object
//  - className: string
import { useState, useEffect } from 'react'

export default function TimeAgo({ date, className }) {
  const [label, setLabel] = useState(() => timeAgo(date))

  useEffect(() => {
    setLabel(timeAgo(date))
    // Refresh every 60 seconds
    const interval = setInterval(() => setLabel(timeAgo(date)), 60_000)
    return () => clearInterval(interval)
  }, [date])

  return (
    <time
      dateTime={date}
      className={className}
      title={date ? new Date(date).toLocaleString() : ''}
    >
      {label}
    </time>
  )
}
