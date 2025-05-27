import { useEffect, useState } from 'react'
import { getAllProducts, toggleProductStatus, type Product } from '../lib/supabase'

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts()
        setProducts(data)
      } catch (err) {
        console.error('Error in component:', err)
        setError('Error al cargar los productos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleProductStatus(id, currentStatus)
      const updatedProducts = await getAllProducts()
      setProducts(updatedProducts)
    } catch (err) {
      console.error('Error toggling status:', err)
      setError('Error al cambiar el estado del producto')
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Cargando productos...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>
  }

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-gray-900 font-medium mb-2 line-clamp-2">
                {product.description}
              </h3>
              <div className="mt-auto flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.active ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => handleToggleStatus(product.id, product.active)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    product.active
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {product.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 