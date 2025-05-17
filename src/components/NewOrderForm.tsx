import { useState, useEffect } from 'react'
import { createOrder, getActiveProducts, checkAndSetupProductsTable, type Product } from '../lib/supabase'

interface OrderFormData {
  customer_name: string
}

interface NewOrderFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function NewOrderForm({ onClose, onSuccess }: NewOrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: ''
  })
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<{ product_id: string; quantity: number }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        // Primero verificar y configurar la tabla de productos
        const { error: setupError } = await checkAndSetupProductsTable()
        if (setupError) {
          setError('Error al configurar la tabla de productos')
          setIsLoading(false)
          return
        }

        // Luego cargar los productos
        const data = await getActiveProducts()
        setProducts(data)
      } catch (err) {
        setError('Error inesperado al cargar los productos')
        console.error('Error loading products:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await createOrder(
        {
          customer_name: formData.customer_name,
          total: selectedProducts.reduce((sum, product) => sum + product.quantity, 0),
          status: 'pending'
        },
        selectedProducts
      )

      if (error) throw error

      onSuccess()
      onClose()
    } catch (err) {
      setError('Error al crear el pedido')
      console.error('Error creating order:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProductSelect = (productId: string, quantity: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.product_id === productId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter(p => p.product_id !== productId)
        }
        return prev.map(p => p.product_id === productId ? { ...p, quantity } : p)
      }
      if (quantity === 0) return prev
      return [...prev, { product_id: productId, quantity }]
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Cargando productos...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
          Nombre del Cliente
        </label>
        <input
          type="text"
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Productos</label>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{product.description}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleProductSelect(product.id, Math.max(0, (selectedProducts.find(p => p.product_id === product.id)?.quantity || 0) - 1))}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  -
                </button>
                <span className="text-sm w-8 text-center">
                  {selectedProducts.find(p => p.product_id === product.id)?.quantity || 0}
                </span>
                <button
                  type="button"
                  onClick={() => handleProductSelect(product.id, (selectedProducts.find(p => p.product_id === product.id)?.quantity || 0) + 1)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creando...' : 'Crear Pedido'}
        </button>
      </div>
    </form>
  )
} 