import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import NewOrderForm from '../components/NewOrderForm'
import { NewProductForm } from '../components/NewProductForm'
import type { ProductFormData } from '../components/NewProductForm'
import { useOrdersStore } from '../store/ordersStore'

export default function HomePage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const { fetchOrders } = useOrdersStore()

  const handleNewOrder = async () => {
    setIsOrderModalOpen(false)
    await fetchOrders(true)
  }

  const handleNewProduct = (data: ProductFormData) => {
    console.log('New product data:', data)
    setIsProductModalOpen(false)
  }

  return (
    <>
      <main className="w-full px-4 sm:px-10 flex flex-col justify-center min-h-[70vh] gap-4">
        <Link 
          to="/orders"
          className="px-6 py-3 bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-yellow-500  transition-all duration-300 transform hover:-translate-y-1 text-center"
        >
          Ver pedidos
        </Link>
        <Link 
          to="/products"
          className="px-6 py-3 bg-green-400 text-gray-800 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-1 text-center"
        >
          Ver productos
        </Link>
        <button 
          onClick={() => setIsOrderModalOpen(true)}
          className="px-6 py-3 bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-yellow-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          Nuevo pedido
        </button>
        <button 
          onClick={() => setIsProductModalOpen(true)}
          className="px-6 py-3 bg-green-400 text-gray-800 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          Nuevo producto
        </button>
      </main>

      <Modal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)}
        title="Nuevo Pedido"
      >
        <NewOrderForm onClose={() => setIsOrderModalOpen(false)} onSuccess={handleNewOrder} />
      </Modal>

      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)}
        title="Nuevo Producto"
      >
        <NewProductForm onSubmit={handleNewProduct} />
      </Modal>
    </>
  )
} 