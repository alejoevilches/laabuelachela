import { useState } from 'react'
import { createProduct } from '../lib/supabase'

export interface ProductFormData {
  description: string
}

interface Props {
  onSubmit: (data: ProductFormData) => void
}

export function NewProductForm({ onSubmit }: Props) {
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await createProduct(description)
      onSubmit({ description })
      setDescription('')
    } catch (err) {
      setError('Error al crear el producto. Por favor, intenta de nuevo.')
      console.error('Error creating product:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Nombre del producto
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-green-400 text-gray-800 font-bold rounded-lg shadow hover:shadow-lg hover:bg-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creando...' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
} 