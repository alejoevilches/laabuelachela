import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { updateOrderStatus, type OrderWithProducts } from '../lib/supabase'
import { Modal } from './Modal'
import NewOrderForm from './NewOrderForm'
import { generateOrderPDF } from '../utils/generateOrderPDF'
import Loader from './Loader'
import { useOrdersStore } from '../store/ordersStore'

export default function OrdersList() {
  const {
    pendingOrders,
    completedOrders,
    weeklySummary,
    isLoading,
    error,
    showCompleted,
    setShowCompleted,
    fetchOrders
  } = useOrdersStore()

  const orders = showCompleted ? completedOrders : pendingOrders

  const [isUpdating, setIsUpdating] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrderWithProducts | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleEditSuccess = async () => {
    setEditingOrder(null)
    await fetchOrders(true)
  }

  const handleCompleteOrder = async (orderId: number) => {
    setIsUpdating(true)
    try {
      await updateOrderStatus(orderId, 'completed')
      await fetchOrders(true)
    } catch (err) {
      console.error('Error completing order:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMarkAsPending = async (orderId: number) => {
    setIsUpdating(true)
    try {
      await updateOrderStatus(orderId, 'pending')
      await fetchOrders(true)
    } catch (err) {
      console.error('Error marking order as pending:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrintOrders = () => {
    generateOrderPDF(orders)
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
          No hay pedidos {showCompleted ? 'completados' : 'pendientes'} para mostrar
        </div>
        <div className="flex justify-center gap-4 mt-8 mb-8">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            {showCompleted ? 'Ver pedidos pendientes' : 'Ver pedidos completados'}
          </button>
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
      <Loader isVisible={isUpdating} />
      {!showCompleted && weeklySummary.length > 0 && (
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Esta semana debes cocinar:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {weeklySummary.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{item.description}</span>
                <span className="text-lg font-semibold text-gray-900">x{item.total_quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                {order.address}
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
                    : 'bg-green-100 text-green-800'
                }`}>
                  {order.status === 'pending' ? 'Pendiente' : 'Completado'}
                </span>
                <div className="flex gap-2">
                  {order.status === 'pending' ? (
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      className="px-3 py-1 text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Completar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsPending(order.id)}
                      className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                      Marcar como pendiente
                    </button>
                  )}
                  <button
                    onClick={() => setEditingOrder(order)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mb-8">
        <button
          onClick={handlePrintOrders}
          className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          Imprimir comanda
        </button>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          {showCompleted ? 'Ver pedidos pendientes' : 'Ver pedidos completados'}
        </button>
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
              address: editingOrder.address,
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