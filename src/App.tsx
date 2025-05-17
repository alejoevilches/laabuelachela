import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <nav className="w-full flex justify-center px-4 sm:px-6 py-4">
          <img src="/src/assets/logo.jpg" alt="La Abuela Chela logo" className="max-w-xs w-full h-32 object-contain" />
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </div>
    </Router>
  )
}
