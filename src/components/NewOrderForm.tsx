import { useState, useEffect } from 'react'
import { getActiveProducts, createOrder, type Product } from '../lib/supabase'

interface SelectedProduct {
  product_id: number
  quantity: number
}

interface NewOrderFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function NewOrderForm({ onClose, onSuccess }: NewOrderFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [client, setClient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getActiveProducts()
        setProducts(data)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Error al cargar los productos')
      }
    }

    loadProducts()
  }, [])

  const handleProductSelect = (productId: number, quantity: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.product_id === productId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter(p => p.product_id !== productId)
        }
        return prev.map(p => 
          p.product_id === productId ? { ...p, quantity } : p
        )
      }
      return [...prev, { product_id: productId, quantity }]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProducts.length === 0) {
      setError('Debes seleccionar al menos un producto')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await createOrder(
        client,
        '123456789', // Número de teléfono por defecto
        selectedProducts.map(p => ({
          productId: p.product_id,
          quantity: p.quantity
        }))
      )

      if (error) throw error

      onSuccess()
    } catch (err) {
      console.error('Error creating order:', err)
      setError('Error al crear el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="client" className="block text-sm font-medium text-gray-700">
          Cliente
        </label>
        <input
          type="text"
          id="client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Productos</h3>
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-700">{product.description}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleProductSelect(product.id, Math.max(0, (selectedProducts.find(p => p.product_id === product.id)?.quantity || 0) - 1))}
                >
                  -
                </button>
                <span className="w-8 text-center">
                  {selectedProducts.find(p => p.product_id === product.id)?.quantity || 0}
                </span>
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleProductSelect(product.id, (selectedProducts.find(p => p.product_id === product.id)?.quantity || 0) + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Creando...' : 'Crear Pedido'}
        </button>
      </div>
    </form>
  )
} 