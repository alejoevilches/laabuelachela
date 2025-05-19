import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrdersWithProducts, type OrderWithProducts } from '../lib/supabase'
import { Modal } from './Modal'
import NewOrderForm from './NewOrderForm'

export default function OrdersList() {
  const [orders, setOrders] = useState<OrderWithProducts[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<OrderWithProducts | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrdersWithProducts()
        setOrders(data)
      } catch (err) {
        console.error('Error loading orders:', err)
        setError('Error al cargar los pedidos')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleEditSuccess = async () => {
    setEditingOrder(null)
    try {
      const data = await getOrdersWithProducts()
      setOrders(data)
    } catch (err) {
      console.error('Error reloading orders:', err)
      setError('Error al recargar los pedidos')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Cargando pedidos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <>
        <div className="text-center text-gray-600 py-8">
          No hay pedidos para mostrar
        </div>
        <div className="flex justify-center mt-8">
          <Link
            to="/"
            className="px-6 py-3 bg-green-400 text-gray-800 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-1 text-center"
          >
            Volver al inicio
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {order.client}
              </h3>
              <p className="text-sm text-gray-500">
                {order.date} {order.time}
              </p>
            </div>
            
            <div className="space-y-2">
              {order.products.map((product) => (
                <div
                  key={product.product_id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700">{product.description}</span>
                  <span className="font-medium text-gray-900">x{product.quantity}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${order.amount}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {order.status === 'pending'
                    ? 'Pendiente'
                    : order.status === 'completed'
                    ? 'Completado'
                    : 'Cancelado'}
                </span>
                <button
                  onClick={() => setEditingOrder(order)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Link
          to="/"
          className="px-6 py-3 bg-green-400 text-gray-800 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-1 text-center"
        >
          Volver al inicio
        </Link>
      </div>

      <Modal 
        isOpen={editingOrder !== null} 
        onClose={() => setEditingOrder(null)}
        title="Editar Pedido"
      >
        {editingOrder && (
          <NewOrderForm 
            onClose={() => setEditingOrder(null)} 
            onSuccess={handleEditSuccess}
            orderToEdit={{
              id: editingOrder.id,
              client: editingOrder.client,
              amount: editingOrder.amount,
              products: editingOrder.products.map(p => ({
                product_id: p.product_id,
                quantity: p.quantity
              }))
            }}
          />
        )}
      </Modal>
    </>
  )
} 