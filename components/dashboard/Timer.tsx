'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  endTime: string
  onTimeUp?: () => void
  className?: string
}

export function Timer({ endTime, onTimeUp, className = '' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime)
      const now = new Date()
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true })
        if (onTimeUp) onTimeUp()
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds, isExpired: false })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endTime, onTimeUp])

  const formatTime = (num: number) => num.toString().padStart(2, '0')

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="font-semibold">Waktu Habis</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="font-mono font-semibold">
        {timeLeft.hours > 0 && `${formatTime(timeLeft.hours)}:`}
        {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    </div>
  )
}