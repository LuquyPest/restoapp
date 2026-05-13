import Image from "next/image"

interface Props {
  size?: number
  className?: string
}

export function AppLogo({ size = 40, className = "" }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="RestoCompta"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      priority
    />
  )
}
