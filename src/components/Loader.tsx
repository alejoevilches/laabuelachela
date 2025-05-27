import { useEffect, useState } from 'react'

interface LoaderProps {
  isVisible: boolean
}

export default function Loader({ isVisible }: LoaderProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 300) // Esperar a que termine la animación de salida
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isAnimating) return null

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )
} 