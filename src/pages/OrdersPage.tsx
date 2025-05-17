import OrdersList from '../components/OrdersList'

export default function OrdersPage() {
  return (
    <main className="w-full px-4 sm:px-10 mt-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>
      <OrdersList />
    </main>
  )
} 