import { create } from 'zustand'
import { getOrdersWithProducts, getWeeklyOrderSummary, type OrderWithProducts, type WeeklyOrderSummary } from '../lib/supabase'

interface OrdersState {
  pendingOrders: OrderWithProducts[]
  completedOrders: OrderWithProducts[]
  weeklySummary: WeeklyOrderSummary[]
  isLoading: boolean
  error: string | null
  showCompleted: boolean
  isPendingLoaded: boolean
  isCompletedLoaded: boolean
  setShowCompleted: (show: boolean) => void
  fetchOrders: (force?: boolean) => Promise<void>
  addOrder: (order: OrderWithProducts) => void
  updateOrder: (order: OrderWithProducts) => void
  removeOrder: (orderId: number) => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  pendingOrders: [],
  completedOrders: [],
  weeklySummary: [],
  isLoading: false,
  error: null,
  showCompleted: false,
  isPendingLoaded: false,
  isCompletedLoaded: false,
  setShowCompleted: (show) => {
    set({ showCompleted: show })
    // Solo cargar los datos si no están cargados
    const { isPendingLoaded, isCompletedLoaded } = get()
    if ((show && !isCompletedLoaded) || (!show && !isPendingLoaded)) {
      get().fetchOrders()
    }
  },
  fetchOrders: async (force = false) => {
    const { showCompleted, isPendingLoaded, isCompletedLoaded } = get()
    
    // Si los datos ya están cargados y no se fuerza la actualización, no hacer nada
    if ((showCompleted ? isCompletedLoaded : isPendingLoaded) && !force) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const [ordersData, summaryData] = await Promise.all([
        getOrdersWithProducts(showCompleted ? 'completed' : 'pending'),
        getWeeklyOrderSummary()
      ])
      
      set((state) => ({ 
        ...state,
        ...(showCompleted 
          ? { completedOrders: ordersData, isCompletedLoaded: true }
          : { pendingOrders: ordersData, isPendingLoaded: true }
        ),
        weeklySummary: summaryData
      }))
    } catch (err) {
      console.error('Error loading data:', err)
      set({ error: 'Error al cargar los datos' })
    } finally {
      set({ isLoading: false })
    }
  },
  addOrder: (order) => {
    set((state) => ({ 
      pendingOrders: [order, ...state.pendingOrders],
      isPendingLoaded: true
    }))
  },
  updateOrder: (updatedOrder) => {
    set((state) => ({
      pendingOrders: state.pendingOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
      completedOrders: state.completedOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
      isPendingLoaded: true,
      isCompletedLoaded: true
    }))
  },
  removeOrder: (orderId) => {
    set((state) => ({
      pendingOrders: state.pendingOrders.filter((order) => order.id !== orderId),
      completedOrders: state.completedOrders.filter((order) => order.id !== orderId),
      isPendingLoaded: true,
      isCompletedLoaded: true
    }))
  },
})) 