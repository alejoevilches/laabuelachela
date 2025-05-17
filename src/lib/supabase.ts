import { createClient } from '@supabase/supabase-js'

// Verificar las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? '✅' : '❌',
    key: supabaseKey ? '✅' : '❌'
  })
  throw new Error('Missing Supabase environment variables. Please check your .env.local file')
}

// Asegurarse de que la URL tenga el formato correcto
const formattedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`

try {
  // Validar la URL
  new URL(formattedUrl)
} catch (error) {
  console.error('Invalid Supabase URL:', formattedUrl)
  throw new Error('Invalid Supabase URL format')
}

// Crear el cliente de Supabase
export const supabase = createClient(formattedUrl, supabaseKey)

export interface Order {
  id: number
  client: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
  date: string // fecha (YYYY-MM-DD)
  time: string // hora (HH:mm:ss)
}

export interface OrderProduct {
  id: number
  order_id: number
  product_id: number
  quantity: number
  created_at: string
}

export interface Product {
  id: number
  description: string
  active: boolean
  created_at: string
}

export interface OrderWithProducts extends Order {
  products: {
    product_id: number;
    quantity: number;
    description: string;
  }[];
}

export async function createOrder(
  customerName: string,
  customerPhone: string,
  products: { productId: number; quantity: number }[]
) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: customerName,
        customer_phone: customerPhone,
        status: 'pending'
      }
    ])
    .select()
    .single()

  if (orderError) throw orderError

  const orderProducts = products.map(p => ({
    order_id: order.id,
    product_id: p.productId,
    quantity: p.quantity
  }))

  const { error: productsError } = await supabase
    .from('order_products')
    .insert(orderProducts)

  if (productsError) throw productsError

  return { data: order, error: null }
}

export async function createProduct(description: string) {
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        description,
        active: true
      }
    ])
    .select()
    .single()

  if (error) throw error
  return { data, error: null }
}

export async function getActiveProducts() {
  console.log('Fetching active products from Supabase...')
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('description')

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  console.log('Raw products data:', JSON.stringify(data, null, 2))
  return data || []
}

export async function toggleProductStatus(id: number, currentStatus: boolean) {
  const { error } = await supabase
    .from('products')
    .update({ active: !currentStatus })
    .eq('id', id)

  if (error) throw error
}

export async function checkAndSetupProductsTable() {
  try {
    // Verificar si la tabla existe y tiene datos
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (fetchError) {
      console.error('Error checking products table:', fetchError)
      return { error: fetchError }
    }

    // Si no hay productos, insertar algunos de prueba
    if (!products || products.length === 0) {
      console.log('No products found, inserting test data...')
      const testProducts = [
        { description: 'Pizza Margherita', active: true },
        { description: 'Pizza Pepperoni', active: true },
        { description: 'Pizza Hawaiana', active: true },
        { description: 'Coca Cola 1L', active: true },
        { description: 'Agua Mineral', active: true }
      ]

      const { error: insertError } = await supabase
        .from('products')
        .insert(testProducts)

      if (insertError) {
        console.error('Error inserting test products:', insertError)
        return { error: insertError }
      }

      console.log('Test products inserted successfully')
    }

    return { error: null }
  } catch (error) {
    console.error('Error in checkAndSetupProductsTable:', error)
    return { error }
  }
}

export async function getOrdersWithProducts() {
  try {
    // Obtener todos los pedidos
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false })

    if (ordersError) throw ordersError

    // Para cada pedido, obtener sus productos
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        // Obtener los productos del pedido
        const { data: orderProducts, error: productsError } = await supabase
          .from('product_orders')
          .select('product, quantity')
          .eq('order_id', order.id)

        if (productsError) throw productsError

        // Obtener los detalles de cada producto
        const productsWithDetails = await Promise.all(
          orderProducts.map(async (op) => {
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('description')
              .eq('id', op.product)
              .single()

            if (productError) throw productError

            return {
              product_id: op.product,
              quantity: op.quantity,
              description: productData.description
            }
          })
        )

        return {
          ...order,
          products: productsWithDetails
        }
      })
    )

    return ordersWithProducts
  } catch (error) {
    console.error('Error fetching orders with products:', error)
    throw error
  }
} 