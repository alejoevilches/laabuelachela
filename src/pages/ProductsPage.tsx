import { Link } from 'react-router-dom'
import ProductsTable from '../components/ProductsTable'

export default function ProductsPage() {
  return (
    <main className="w-full px-4 sm:px-10 mt-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Productos</h1>
      <ProductsTable />
      <div className="mt-8 flex justify-center">
        <Link 
          to="/"
          className="px-6 py-3 bg-green-400 text-gray-800 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          Volver a inicio
        </Link>
      </div>
    </main>
  )
} 