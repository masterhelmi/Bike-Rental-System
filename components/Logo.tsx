import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = '', width = 200, height = 70 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="BikeShare Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  )
}
