import { useState, useEffect } from 'react'
import { getAllProducts, createOrder, updateOrder, type Product } from '../lib/supabase'

interface SelectedProduct {
  product_id: number
  quantity: number
}

interface NewOrderFormProps {
  onClose: () => void
  onSuccess: () => void
  orderToEdit?: {
    id: number
    client: string
    address: string
    amount: number
    products: { product_id: number; quantity: number }[]
  }
}

export default function NewOrderForm({ onClose, onSuccess, orderToEdit }: NewOrderFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [client, setClient] = useState('')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPickup, setIsPickup] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAllProducts()
        // Filtrar solo los productos activos para el formulario de pedido
        const activeProducts = data.filter(product => product.active)
        setProducts(activeProducts)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Error al cargar los productos')
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (orderToEdit) {
      setClient(orderToEdit.client)
      setAddress(orderToEdit.address || '')
      setAmount(orderToEdit.amount.toString())
      setSelectedProducts(orderToEdit.products)
      setIsPickup(orderToEdit.address === 'Retira')
    }
  }, [orderToEdit])

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
    setError(null)

    // Validar nombre del cliente
    if (!client.trim()) {
      setError('Por favor, ingresa el nombre del cliente')
      return
    }

    // Validar dirección solo si no es retira
    if (!isPickup && !address.trim()) {
      setError('Por favor, ingresa la dirección de entrega')
      return
    }

    // Validar que haya al menos un producto seleccionado
    if (selectedProducts.length === 0) {
      setError('Por favor, selecciona al menos un producto')
      return
    }

    // Validar que todos los productos seleccionados tengan cantidad mayor a 0
    const hasInvalidQuantity = selectedProducts.some(p => p.quantity <= 0)
    if (hasInvalidQuantity) {
      setError('Todos los productos seleccionados deben tener una cantidad mayor a 0')
      return
    }

    // Validar el precio total
    if (!amount.trim()) {
      setError('Por favor, ingresa el precio total')
      return
    }

    const amountNumber = Number(amount)
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError('El precio total debe ser un número mayor a 0')
      return
    }

    setIsLoading(true)

    try {
      if (orderToEdit) {
        // Actualizar pedido existente
        const { error } = await updateOrder(
          orderToEdit.id,
          client,
          '123456789', // Número de teléfono por defecto
          isPickup ? 'Retira' : address,
          amountNumber,
          selectedProducts.map(p => ({
            productId: p.product_id,
            quantity: p.quantity
          }))
        )

        if (error) {
          console.error('Error from updateOrder:', error)
          throw error
        }
      } else {
        // Crear nuevo pedido
        const { error } = await createOrder(
          client,
          '123456789', // Número de teléfono por defecto
          isPickup ? 'Retira' : address,
          amountNumber,
          selectedProducts.map(p => ({
            productId: p.product_id,
            quantity: p.quantity
          }))
        )

        if (error) {
          console.error('Error from createOrder:', error)
          throw error
        }
      }

      onSuccess()
    } catch (err) {
      console.error('Error creating/updating order:', err)
      if (err instanceof Error) {
        setError(`Error al ${orderToEdit ? 'actualizar' : 'crear'} el pedido: ${err.message}`)
      } else {
        setError(`Error al ${orderToEdit ? 'actualizar' : 'crear'} el pedido. Por favor, intenta de nuevo.`)
      }
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
          Cliente *
        </label>
        <input
          type="text"
          id="client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
          placeholder="Ingresa el nombre del cliente"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Dirección de entrega *
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPickup"
              checked={isPickup}
              onChange={(e) => {
                setIsPickup(e.target.checked)
                if (e.target.checked) {
                  setAddress('')
                }
              }}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isPickup" className="ml-2 block text-sm text-gray-700">
              Retira
            </label>
          </div>
        </div>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required={!isPickup}
          disabled={isPickup}
          placeholder={isPickup ? "Retira" : "Ingresa la dirección de entrega"}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Productos *</h3>
        <div className="max-h-[300px] overflow-y-auto border rounded-md">
          <div className="space-y-2 p-2">
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
        {selectedProducts.length === 0 && (
          <p className="mt-1 text-sm text-red-600">Selecciona al menos un producto</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Precio Total *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
          {isLoading ? (orderToEdit ? 'Actualizando...' : 'Creando...') : (orderToEdit ? 'Actualizar Pedido' : 'Crear Pedido')}
        </button>
      </div>
    </form>
  )
} 