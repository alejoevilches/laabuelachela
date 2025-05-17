import { useEffect, useState } from 'react'
import { getActiveProducts, toggleProductStatus, type Product } from '../lib/supabase'

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getActiveProducts()
        console.log('Data received in component:', JSON.stringify(data, null, 2))
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
      const updatedProducts = await getActiveProducts()
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
    <div className="w-full">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th scope="col" className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-2 sm:px-4 py-2 text-sm text-gray-900 max-w-[150px] sm:max-w-none truncate">
                {product.description}
              </td>
              <td className="px-2 sm:px-4 py-2 text-sm text-gray-500">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-2 sm:px-4 py-2 text-sm text-gray-500">
                <button
                  onClick={() => handleToggleStatus(product.id, product.active)}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                    product.active
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {product.active ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 